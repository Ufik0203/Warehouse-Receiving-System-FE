import { useState } from "react";
import { z } from "zod";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router";
import type { Product } from "../types";
import { useAuth } from "../../auth/hooks/use-auth";
import { useRead, useAction } from "../../../hooks/use-server";
import { productsApi } from "../api";
import { Field, DataForm } from "../../../components/shared/Fields";
import {
  Panel,
  QueryState,
  ErrorNotice,
  Success,
} from "../../../components/shared/Feedback";
import { DataTable, Pagination } from "../../../components/shared/DataTable";

const input = z.object({
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(
      z
        .string()
        .min(1)
        .max(40)
        .regex(/^[A-Z0-9_-]+$/, "Gunakan huruf, angka, _ atau -."),
    ),
  name: z
    .string()
    .trim()
    .refine(
      (v) => [...v].length >= 1 && [...v].length <= 120,
      "Nama harus 1–120 karakter Unicode.",
    ),
});

export function ProductsWorkspace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const filters = { page, q };
  const result = useRead("products", filters, (signal) =>
    productsApi.list(filters, signal),
  );
  const create = useAction(productsApi.create, ["products", "inventory"]);
  const [editing, setEditing] = useState<Product | null>(null);
  const update = useAction(
    (body: { sku: string; name: string }) =>
      productsApi.update(editing?.id ?? "", body),
    ["products", "inventory", "receivings", "transactions", "productHistory"],
  );
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
      <Panel title="Daftar produk">
        <Field
          label="Cari SKU atau nama"
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          error={
            [...q.trim()].length > 100
              ? "Pencarian maksimal 100 karakter."
              : undefined
          }
        />
        <QueryState
          pending={result.isPending}
          error={result.error}
          retry={result.refetch}
          hasData={!!result.data}
        />
        {result.data && (
          <>
            <DataTable
              headers={
                user?.role === "SUPERVISOR"
                  ? ["SKU", "Nama", "Satuan", "Aksi"]
                  : ["SKU", "Nama", "Satuan"]
              }
              rows={result.data.data.map((row) => [
                row.sku,
                row.name,
                row.unit,
                ...(user?.role === "SUPERVISOR"
                  ? [
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Button
                          aria-label={`Edit ${row.sku}`}
                          isDisabled={update.isPending}
                          onPress={() => {
                            update.reset();
                            setEditing(row);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          aria-label={`Riwayat Edit ${row.sku}`}
                          onPress={() =>
                            navigate(`/products/${row.id}/history`)
                          }
                        >
                          Riwayat Edit
                        </Button>
                      </div>,
                    ]
                  : []),
              ])}
            />
            <Pagination
              page={page}
              total={result.data.pagination.total}
              onPage={setPage}
            />
          </>
        )}
      </Panel>
      {user?.role === "SUPERVISOR" && (
        <div className="min-w-0 space-y-6">
          {editing && (
            <Panel title="Edit produk">
              <DataForm
                key={editing.id}
                fields={[
                  { name: "sku", label: "SKU edit" },
                  { name: "name", label: "Nama produk edit" },
                ]}
                initial={{ sku: editing.sku, name: editing.name }}
                schema={input}
                pending={update.isPending}
                onSubmit={async (body) => {
                  await update.mutateAsync(body);
                  setEditing(null);
                }}
                label="Simpan"
              />
              <Button
                variant="secondary"
                isDisabled={update.isPending}
                onPress={() => {
                  setEditing(null);
                  update.reset();
                }}
              >
                Batal
              </Button>
              <ErrorNotice error={update.error} />
            </Panel>
          )}
          {update.isSuccess && (
            <Success refreshFailed={update.data.refreshFailed}>
              Produk berhasil diperbarui.
            </Success>
          )}
          <Panel title="Tambah produk">
            <p className="text-sm text-muted">
              Produk baru dimulai dengan stok nol.
            </p>
            <DataForm
              fields={[
                { name: "sku", label: "SKU" },
                { name: "name", label: "Nama produk" },
              ]}
              initial={{ sku: "", name: "" }}
              schema={input}
              pending={create.isPending}
              onSubmit={create.mutateAsync}
              label="Buat produk"
            />
            <ErrorNotice error={create.error} />
            {create.isSuccess && (
              <Success refreshFailed={create.data.refreshFailed}>
                Produk berhasil dibuat.
              </Success>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
