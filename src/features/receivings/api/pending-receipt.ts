import { z } from "zod";
import { receiptPayloadSchema } from "../types";
import type { ReceiptPayload } from "../types";

const pendingSchema = z
  .object({
    version: z.literal(1),
    actorId: z.uuid(),
    receivingId: z.uuid(),
    key: z.uuid(),
    payload: receiptPayloadSchema,
    createdAt: z.string(),
  })
  .strict();
export type PendingReceipt = z.infer<typeof pendingSchema>;
const storageKey = (actor: string, receiving: string) =>
  `wrs:pending:${actor}:${receiving}`;
export function loadPending(
  actor: string,
  receiving: string,
): PendingReceipt | null {
  const raw = sessionStorage.getItem(storageKey(actor, receiving));
  if (!raw) return null;
  const result = pendingSchema.safeParse(JSON.parse(raw));
  if (
    !result.success ||
    result.data.actorId !== actor ||
    result.data.receivingId !== receiving
  )
    throw new Error(
      "Data operasi tersimpan tidak valid. Jangan buat operasi baru; periksa riwayat terlebih dahulu.",
    );
  return result.data;
}
export function savePending(
  actor: string,
  receiving: string,
  payload: ReceiptPayload,
): PendingReceipt {
  const previous = loadPending(actor, receiving);
  if (previous) return previous;
  const pending: PendingReceipt = {
    version: 1,
    actorId: actor,
    receivingId: receiving,
    key: crypto.randomUUID(),
    payload,
    createdAt: new Date().toISOString(),
  };
  sessionStorage.setItem(storageKey(actor, receiving), JSON.stringify(pending));
  return pending;
}
export function clearPending(pending: PendingReceipt) {
  const existing = loadPending(pending.actorId, pending.receivingId);
  if (existing?.key === pending.key)
    sessionStorage.removeItem(storageKey(pending.actorId, pending.receivingId));
}
