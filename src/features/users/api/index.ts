import { z } from "zod";
import { http } from "../../../config/http-client";
import { dataSchema, pageSchema, queryString } from "../../../config/api-types";
import { userSchema } from "../types";
import type { User } from "../types";

export const usersApi = {
  list: (
    filters: Record<string, string | number | boolean | undefined>,
    signal?: AbortSignal,
  ) =>
    http("/users" + queryString(filters), pageSchema(userSchema), { signal }),
  detail: (id: string, signal?: AbortSignal) =>
    http(`/users/${id}`, dataSchema(userSchema), { signal }),
  create: (body: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
  }) => http("/users", dataSchema(userSchema), { method: "POST", body }),
  update: (
    id: string,
    body: { name: string; role: User["role"]; isActive: boolean },
  ) => http(`/users/${id}`, dataSchema(userSchema), { method: "PATCH", body }),
  remove: (id: string) =>
    http(`/users/${id}`, z.undefined(), { method: "DELETE" }),
};
