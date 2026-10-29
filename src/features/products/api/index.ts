import { http } from "../../../config/http-client";
import { dataSchema, pageSchema, queryString } from "../../../config/api-types";
import { productSchema, productHistorySchema } from "../types";

export const productsApi = {
  list: (
    filters: Record<string, string | number | undefined>,
    signal?: AbortSignal,
  ) =>
    http("/products" + queryString(filters), pageSchema(productSchema), {
      signal,
    }),
  detail: (id: string, signal?: AbortSignal) =>
    http(`/products/${id}`, dataSchema(productSchema), { signal }),
  history: (
    id: string,
    filters: { page: number; limit?: number },
    signal?: AbortSignal,
  ) =>
    http(
      `/products/${id}/history` + queryString(filters),
      pageSchema(productHistorySchema),
      { signal },
    ),
  create: (body: { sku: string; name: string }) =>
    http("/products", dataSchema(productSchema), { method: "POST", body }),
  update: (id: string, body: { sku?: string; name?: string }) =>
    http(`/products/${id}`, dataSchema(productSchema), {
      method: "PATCH",
      body,
    }),
};
