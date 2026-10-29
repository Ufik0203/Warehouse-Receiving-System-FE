import { useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "@heroui/react";
import { useAuth } from "../../auth/hooks/use-auth";
import { useAction } from "../../../hooks/use-server";
import { ApiError } from "../../../config/http-client";
import { receivingsApi } from "../api";
import { loadPending, savePending, clearPending } from "../api/pending-receipt";
import type { PendingReceipt } from "../api/pending-receipt";
import type { ReceivingDetail } from "../types";
import { Field } from "../../../components/shared/Fields";
import {
  Panel,
  Success,
  ErrorNotice,
} from "../../../components/shared/Feedback";

export function ReceiptForm({
  document,
  canSubmit = true,
}: {
  document: ReceivingDetail;
  canSubmit?: boolean;
}) {
  const { user } = useAuth();
  const actor = user?.id ?? "";
  const busy = useRef(false);
  const [storageError, setStorageError] = useState<unknown>(null);
  const [pending, setPending] = useState<PendingReceipt | null>(() => {
    try {
      return loadPending(actor, document.id);
    } catch {
      return null;
    }
  });
  const [corrupt] = useState(() => {
    try {
      loadPending(actor, document.id);
      return false;
    } catch {
      return true;
    }
  });
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useAction(
    async (operation: PendingReceipt) => {
      const result = await receivingsApi.receive(
        operation.receivingId,
        operation.key,
        operation.payload,
      );
      clearPending(operation);
      setPending(null);
      return result;
    },
    ["receivings", "inventory", "transactions"],
  );
  async function send(operation: PendingReceipt) {
    if (busy.current) return;
    busy.current = true;
    try {
      await mutation.mutateAsync(operation);
    } catch {
      /* The saved operation remains recoverable. */
    } finally {
      busy.current = false;
    }
  }
  async function submit() {
    if (pending || busy.current || corrupt || !canSubmit) return;
    const validation: Record<string, string> = {};
    const items = document.items.flatMap((item) => {
      const raw = quantities[item.id] ?? "";
      if (!raw || raw === "0") return [];
      const quantity = Number(raw);
      if (
        !/^\d+$/.test(raw) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 1000000 ||
        quantity > item.remainingQuantity
      ) {
        validation[item.id] =
          "Gunakan bilangan bulat 1 sampai remaining (maksimal 1.000.000).";
        return [];
      }
      return [{ receivingItemId: item.id, quantity }];
    });
    if (!items.length)
      validation["form"] = "Isi minimal satu jumlah penerimaan.";
    setErrors(validation);
    if (Object.keys(validation).length) return;
    try {
      const operation = savePending(actor, document.id, { items });
      setPending(operation);
      await send(operation);
    } catch (error: unknown) {
      setStorageError(error);
    }
  }
  const definitive =
    mutation.error instanceof ApiError &&
    [
      "VALIDATION_ERROR",
      "OVER_RECEIPT",
      "RECEIVING_COMPLETED",
      "RECEIVING_ITEM_NOT_FOUND",
    ].includes(mutation.error.code);
  return (
    <Panel title="Catat penerimaan">
      {corrupt ? (
        <p role="alert">
          Operasi tersimpan tidak valid. Periksa riwayat sebelum membuat operasi
          lain.
        </p>
      ) : pending ? (
        <div className="space-y-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <h3 className="font-semibold">Operasi belum terkonfirmasi</h3>
          <p className="text-sm">
            Jumlah dan kode operasi tersimpan. Coba lagi memakai operasi asli,
            termasuk jika dokumen sudah selesai.
          </p>
          <ul className="text-sm">
            {pending.payload.items.map((item) => (
              <li key={item.receivingItemId}>
                {document.items.find((row) => row.id === item.receivingItemId)
                  ?.sku ?? item.receivingItemId}
                : {item.quantity}
              </li>
            ))}
          </ul>
          <Button
            isDisabled={mutation.isPending}
            onPress={() => {
              void send(pending);
            }}
          >
            {mutation.isPending ? "Mengirim…" : "Coba ulang operasi tersimpan"}
          </Button>
          {definitive && (
            <Button
              variant="secondary"
              onPress={() => {
                clearPending(pending);
                setPending(null);
                mutation.reset();
              }}
            >
              Tutup operasi yang ditolak
            </Button>
          )}
        </div>
      ) : document.status !== "COMPLETED" ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted">
            Isi jumlah tambahan yang diterima. Kosong atau nol berarti tidak
            diterima kali ini.
          </p>
          {document.items.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_180px]"
            >
              <div>
                <p className="font-medium">
                  {item.sku} · {item.productName}
                </p>
                <p className="text-sm text-muted">
                  Expected {item.expectedQuantity} · Received{" "}
                  {item.receivedQuantity} · Remaining {item.remainingQuantity}
                </p>
              </div>
              <Field
                label={`Terima ${item.sku}`}
                type="number"
                value={quantities[item.id] ?? ""}
                onChange={(value) =>
                  setQuantities({ ...quantities, [item.id]: value })
                }
                error={errors[item.id]}
                disabled={mutation.isPending || item.remainingQuantity === 0}
              />
            </div>
          ))}
          {errors["form"] && (
            <p role="alert" className="text-danger">
              {errors["form"]}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isDisabled={mutation.isPending || !canSubmit}>
              Simpan penerimaan
            </Button>
            <Button
              variant="secondary"
              isDisabled={mutation.isPending || !canSubmit}
              onPress={() =>
                setQuantities(
                  Object.fromEntries(
                    document.items.map((item) => [
                      item.id,
                      String(item.remainingQuantity),
                    ]),
                  ),
                )
              }
            >
              Isi seluruh remaining
            </Button>
          </div>
        </form>
      ) : (
        <p>Seluruh item sudah diterima.</p>
      )}
      <ErrorNotice error={mutation.error ?? storageError} />
      {mutation.isSuccess && (
        <Success refreshFailed={mutation.data.refreshFailed && !canSubmit}>
          Penerimaan telah dikonfirmasi. Receipt {mutation.data.result.data.id}.
        </Success>
      )}
      <Link
        className="inline-block text-sm text-accent underline"
        to={`/inventory/transactions?receivingId=${document.id}`}
      >
        Periksa riwayat dokumen
      </Link>
    </Panel>
  );
}
