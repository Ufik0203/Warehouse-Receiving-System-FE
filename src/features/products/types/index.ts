import { z } from "zod";
import { id, date } from "../../../config/api-types";

export const productSchema = z.object({
  id,
  sku: z.string(),
  name: z.string(),
  unit: z.literal("pcs"),
  createdAt: date,
});
export type Product = z.infer<typeof productSchema>;
const productLabels = z.object({ sku: z.string(), name: z.string() });
export const productHistorySchema = z.object({
  id,
  productId: id,
  actorId: id,
  actorName: z.string(),
  changedAt: date,
  changedFields: z
    .array(z.enum(["sku", "name"]))
    .min(1)
    .max(2),
  before: productLabels,
  after: productLabels,
});
