import { z } from "zod";
import { id, date } from "../../../config/api-types";

export const balanceSchema = z.object({
  productId: id,
  sku: z.string(),
  productName: z.string(),
  unit: z.literal("pcs"),
  availableQuantity: z.string().regex(/^\d+$/),
  updatedAt: date,
});

export const movementSchema = z.object({
  id,
  receiptId: id,
  receivingId: id,
  receivingNumber: z.string(),
  receivingItemId: id,
  productId: id,
  sku: z.string(),
  productName: z.string(),
  quantity: z.number(),
  actorId: id,
  actorName: z.string(),
  createdAt: date,
});
