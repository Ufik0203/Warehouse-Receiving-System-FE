import { z } from 'zod';
import { id, date } from '../../../config/api-types';
export const productSchema = z.object({ id, sku: z.string(), name: z.string(), unit: z.literal('pcs'), createdAt: date });
export type Product = z.infer<typeof productSchema>;
