import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../features/auth/hooks/use-auth";
import { authEpoch, ApiError } from "../config/http-client";
import { keys } from "../config/query-keys";
import type { Resource } from "../config/query-keys";

export function useRead<T>(
  resource: Resource,
  filters: object,
  read: (signal: AbortSignal) => Promise<T>,
  detailId?: string,
) {
  const { user } = useAuth();
  const actor = user?.id ?? "anonymous";
  return useQuery({
    queryKey: detailId
      ? keys.detail(actor, resource, detailId)
      : keys.list(actor, resource, filters),
    enabled: !!user,
    queryFn: ({ signal }) => read(signal),
  });
}

export function useAction<T, V>(
  action: (input: V) => Promise<T>,
  resources: Resource[],
) {
  const { user } = useAuth();
  const client = useQueryClient();
  const busy = useRef(false);
  const mutation = useMutation({
    retry: false,
    mutationFn: async (input: V) => {
      if (busy.current)
        throw new ApiError(0, "DUPLICATE_SUBMIT", "Permintaan masih berjalan.");
      busy.current = true;
      const epoch = authEpoch();
      const actor = user?.id;
      try {
        const result = await action(input);
        if (epoch !== authEpoch())
          throw new ApiError(0, "SESSION_CHANGED", "Session telah berubah.");
        const refreshed = await Promise.allSettled(
          resources.map((resource) =>
            client.invalidateQueries(
              { queryKey: keys.scope(actor ?? "", resource) },
              { throwOnError: true },
            ),
          ),
        );
        return {
          result,
          refreshFailed: refreshed.some((item) => item.status === "rejected"),
        };
      } finally {
        busy.current = false;
      }
    },
  });
  return mutation;
}
