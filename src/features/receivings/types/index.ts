import { z } from 'zod';
import { id, date } from '../../../config/api-types';
export const receivingSchema = z.object({ id, number: z.string(), reference: z.string(), status: z.enum(['OPEN','PARTIAL','COMPLETED']), createdBy: id, createdAt: date, updatedAt: date });
export const detailSchema = receivingSchema.extend({ items: z.array(z.object({ id, productId: id, sku: z.string(), productName: z.string(), expectedQuantity: z.number().int(), receivedQuantity: z.number().int(), remainingQuantity: z.number().int() })) });
export const receiptPayloadSchema = z.object({ items: z.array(z.object({ receivingItemId: id, quantity: z.number().int().min(1).max(1000000) })).min(1).max(50) });
export const receiptSchema = z.object({ id, receivingId: id, receivedBy: id, receivedAt: date, items: z.array(z.object({ receivingItemId: id, productId: id, quantity: z.number() })) });
export type Receiving = z.infer<typeof receivingSchema>;
export type ReceivingDetail = z.infer<typeof detailSchema>;
export type ReceiptPayload = z.infer<typeof receiptPayloadSchema>;
