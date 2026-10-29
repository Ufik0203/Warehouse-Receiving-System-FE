import { http } from "../../../config/http-client";
import { pageSchema, queryString } from "../../../config/api-types";
import { balanceSchema, movementSchema } from "../types";

export const inventoryApi = {
  balances: (
    filters: Record<string, string | number | undefined>,
    signal?: AbortSignal,
  ) =>
    http("/inventory" + queryString(filters), pageSchema(balanceSchema), {
      signal,
    }),
  history: (
    filters: Record<string, string | number | undefined>,
    signal?: AbortSignal,
  ) =>
    http(
      "/inventory/transactions" + queryString(filters),
      pageSchema(movementSchema),
      { signal },
    ),
};
