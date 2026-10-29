import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "@heroui/react";
import { z } from "zod";
import { useRead, useAction } from "../../../hooks/use-server";
import { productsApi } from "../../products/api";
import { receivingsApi } from "../api";
import { Field, Choice } from "../../../components/shared/Fields";
import {
  Panel,
  QueryState,
  ErrorNotice,
  Success,
} from "../../../components/shared/Feedback";

const input = z
  .object({
    reference: z
      .string()
      .trim()
      .refine((v) => [...v].length <= 160, "Referensi maksimal 160 karakter."),
    items: z
      .array(
        z.object({
          productId: z.uuid("Pilih produk."),
          expectedQuantity: z.coerce
            .number()
            .int()
            .min(1, "Minimal 1.")
            .max(1000000, "Maksimal 1.000.000."),
        }),
      )
      .min(1)
      .max(50),
  })
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.productId)).size ===
      value.items.length,
    { message: "Produk tidak boleh berulang.", path: ["items"] },
  );
const productPageSize = 5;
const itemPageSize = 5;

export function CreateReceiving() {
  const busy = useRef(false);
  const [reference, setReference] = useState("");
  const [rows, setRows] = useState([
    { key: crypto.randomUUID(), productId: "", expectedQuantity: "1" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemPage, setItemPage] = useState(1);
  const [validationNotice, setValidationNotice] = useState("");
  const itemNodes = useRef(new Map<string, HTMLDivElement>());
  const focusTarget = useRef<{
    key: string;
    field: "product" | "quantity";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [known, setKnown] = useState<Record<string, string>>({});
  const filters = { page, limit: productPageSize };
  const products = useRead("products", filters, (signal) =>
    productsApi.list(filters, signal),
  );
  const create = useAction(receivingsApi.create, ["receivings"]);
  const current =
    products.data?.data.map((product) => ({
      value: product.id,
      label: `${product.sku} \u00b7 ${product.name}`,
    })) ?? [];
  const total = products.data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / productPageSize));
  const itemPages = Math.max(1, Math.ceil(rows.length / itemPageSize));
  const itemStart = (itemPage - 1) * itemPageSize;
  const visibleRows = rows.slice(itemStart, itemStart + itemPageSize);

  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    const selector =
      target.field === "product"
        ? 'button[aria-haspopup="listbox"]'
        : 'input[type="number"]';
    const field = itemNodes.current
      .get(target.key)
      ?.querySelector<HTMLElement>(selector);
    if (field) {
      field.focus();
      field.scrollIntoView({ block: "nearest" });
      focusTarget.current = null;
    }
  }, [itemPage, rows, errors]);

  function addItem() {
    if (rows.length >= 50 || create.isPending) return;
    const item = {
      key: crypto.randomUUID(),
      productId: "",
      expectedQuantity: "1",
    };
    focusTarget.current = { key: item.key, field: "product" };
    setRows((previous) =>
      previous.length >= 50 ? previous : [...previous, item],
    );
    setItemPage(Math.floor(rows.length / itemPageSize) + 1);
  }
  function removeItem(key: string) {
    if (rows.length <= 1 || create.isPending) return;
    const remaining = rows.filter((row) => row.key !== key);
    setRows(remaining);
    setItemPage((previous) =>
      Math.min(
        previous,
        Math.max(1, Math.ceil(remaining.length / itemPageSize)),
      ),
    );
    setErrors({});
    setValidationNotice("");
    focusTarget.current = null;
  }

  function clearItemError(
    index: number,
    field: "productId" | "expectedQuantity",
  ) {
    setErrors((previous) => {
      const remaining = { ...previous };
      delete remaining[`items.${index}.${field}`];
      delete remaining["items"];
      return remaining;
    });
    setValidationNotice("");
  }

  function optionsFor(row: (typeof rows)[number]) {
    const choices = [...current];
    if (
      row.productId &&
      !choices.some((option) => option.value === row.productId)
    ) {
      choices.unshift({
        value: row.productId,
        label: known[row.productId] ?? row.productId,
      });
    }
    return [
      { value: "", label: "Pilih produk" },
      ...choices.filter(
        (option) =>
          !rows.some(
            (other) =>
              other.key !== row.key && other.productId === option.value,
          ),
      ),
    ];
  }
  function selectProduct(key: string, value: string) {
    const label = current.find((option) => option.value === value)?.label;
    if (value && label)
      setKnown((previous) => ({ ...previous, [value]: label }));
    setRows((previous) =>
      previous.map((row) =>
        row.key === key ? { ...row, productId: value } : row,
      ),
    );
  }
  async function submit() {
    if (create.isPending || busy.current) return;
    const parsed = input.safeParse({
      reference,
      items: rows.map(({ productId, expectedQuantity }) => ({
        productId,
        expectedQuantity,
      })),
    });
    if (!parsed.success) {
      const details = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          issue.path.join("."),
          issue.message,
        ]),
      );
      const invalid = parsed.error.issues
        .filter(
          (issue) =>
            issue.path[0] === "items" && typeof issue.path[1] === "number",
        )
        .map((issue) => ({
          index: Number(issue.path[1]),
          field:
            issue.path[2] === "expectedQuantity"
              ? ("quantity" as const)
              : ("product" as const),
        }));
      const seen = new Set<string>();
      rows.forEach((row, index) => {
        if (row.productId && seen.has(row.productId)) {
          details[`items.${index}.productId`] = "Produk tidak boleh berulang.";
          invalid.push({ index, field: "product" });
        }
        if (row.productId) seen.add(row.productId);
      });
      const first = invalid.sort((a, b) => a.index - b.index)[0];
      if (first && rows[first.index]) {
        setItemPage(Math.floor(first.index / itemPageSize) + 1);
        focusTarget.current = {
          key: rows[first.index]!.key,
          field: first.field,
        };
        setValidationNotice(
          `Item ${first.index + 1} belum valid. Periksa produk dan expected quantity pada halaman ini.`,
        );
      } else {
        setValidationNotice(
          "Periksa referensi dan seluruh item sebelum menyimpan.",
        );
      }
      setErrors(details);
      return;
    }
    setErrors({});
    setValidationNotice("");
    busy.current = true;
    try {
      await create.mutateAsync(parsed.data);
    } catch {
      /* Mutation error is displayed below. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Panel title="Buat dokumen penerimaan">
      <p className="text-sm text-muted">
        Pilih 1-50 produk berbeda. Dokumen baru tidak menambah stok.
      </p>
      <Field
        label="Referensi"
        value={reference}
        onChange={setReference}
        error={errors["reference"]}
      />
      <section
        aria-label="Katalog produk pilihan"
        className="space-y-3 rounded-xl border border-border p-3"
      >
        <h3 className="font-medium">Katalog produk pilihan</h3>
        <p className="text-sm text-muted">
          5 produk katalog per halaman. Pilihan yang sudah diisi tetap tersimpan
          pada item penerimaan.
        </p>
        <QueryState
          pending={products.isPending}
          error={products.error}
          retry={products.refetch}
          hasData={!!products.data}
        />
        {products.data && (
          <>
            <p role="status">
              Halaman {page} dari {totalPages} {"\u00b7"} {total} produk
              tersedia
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                isDisabled={
                  page <= 1 || products.isFetching || create.isPending
                }
                onPress={() => setPage((previous) => Math.max(1, previous - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="secondary"
                isDisabled={
                  page >= totalPages || products.isFetching || create.isPending
                }
                onPress={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
              >
                Berikutnya
              </Button>
            </div>
          </>
        )}
      </section>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <section
          aria-label="Halaman item penerimaan"
          className="space-y-3 rounded-xl border border-border p-3"
        >
          <h3 className="font-medium">Item penerimaan</h3>
          <p role="status">
            Item penerimaan {"\u2014"} Halaman {itemPage} dari {itemPages}{" "}
            {"\u00b7"} {rows.length} item
          </p>
          <p className="text-sm text-muted">
            Maksimal 5 baris per halaman, maksimal 50 item. Semua item dari
            seluruh halaman akan disimpan.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              isDisabled={itemPage <= 1 || create.isPending}
              onPress={() =>
                setItemPage((previous) => Math.max(1, previous - 1))
              }
            >
              Item sebelumnya
            </Button>
            <Button
              type="button"
              variant="secondary"
              isDisabled={itemPage >= itemPages || create.isPending}
              onPress={() =>
                setItemPage((previous) => Math.min(itemPages, previous + 1))
              }
            >
              Item berikutnya
            </Button>
          </div>
        </section>
        {validationNotice && (
          <p role="alert" className="text-danger">
            {validationNotice}
          </p>
        )}
        {visibleRows.map((row, position) => {
          const index = itemStart + position;
          return (
            <div
              key={row.key}
              ref={(node) => {
                if (node) itemNodes.current.set(row.key, node);
                else itemNodes.current.delete(row.key);
              }}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-end gap-3 rounded-xl border border-border p-3 [&>*]:min-w-0 md:grid-cols-[minmax(0,1fr)_180px_auto]"
            >
              <div className="space-y-1 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:[overflow-wrap:anywhere]">
                <h4 className="font-medium">Item {index + 1}</h4>
                <Choice
                  label={`Produk ${index + 1}`}
                  value={row.productId}
                  onChange={(value) => {
                    clearItemError(index, "productId");
                    selectProduct(row.key, value);
                  }}
                  options={optionsFor(row)}
                  error={errors[`items.${index}.productId`]}
                  disabled={create.isPending}
                />
                {row.productId &&
                  !current.some((option) => option.value === row.productId) && (
                    <p className="text-xs text-muted">
                      Pilihan tersimpan dari halaman lain.
                    </p>
                  )}
              </div>
              <Field
                label={`Expected quantity ${index + 1}`}
                type="number"
                value={row.expectedQuantity}
                onChange={(value) => {
                  clearItemError(index, "expectedQuantity");
                  setRows((previous) =>
                    previous.map((item) =>
                      item.key === row.key
                        ? { ...item, expectedQuantity: value }
                        : item,
                    ),
                  );
                }}
                error={errors[`items.${index}.expectedQuantity`]}
                disabled={create.isPending}
              />
              <Button
                type="button"
                variant="secondary"
                isDisabled={rows.length === 1 || create.isPending}
                onPress={() => removeItem(row.key)}
              >
                Hapus item {index + 1}
              </Button>
            </div>
          );
        })}
        {errors["items"] && (
          <p role="alert" className="text-danger">
            {errors["items"]}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            isDisabled={rows.length >= 50 || create.isPending}
            onPress={addItem}
          >
            Tambah item
          </Button>
          <Button type="submit" isDisabled={create.isPending}>
            {create.isPending ? "Menyimpan..." : "Simpan penerimaan"}
          </Button>
        </div>
      </form>
      <ErrorNotice error={create.error} />
      {create.isSuccess && (
        <Success refreshFailed={create.data.refreshFailed}>
          Dokumen berhasil dibuat.{" "}
          <Link
            className="underline"
            to={`/receivings/${create.data.result.data.id}`}
          >
            Buka receiving
          </Link>
        </Success>
      )}
    </Panel>
  );
}
