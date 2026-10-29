import { z } from "zod";

export const id = z.uuid();
export const date = z.iso.datetime();
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
    }),
  });
export const dataSchema = <T extends z.ZodType>(item: T) =>
  z.object({ data: item });
export type Page<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number };
};
export const queryString = (
  values: Record<string, string | number | boolean | undefined>,
) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== "") params.set(key, String(value));
  return params.size ? `?${params}` : "";
};
