import { z } from "zod";
import { http } from "../../../config/http-client";
import { dataSchema } from "../../../config/api-types";
import { userSchema } from "../types";

export const authApi = {
  me: (signal?: AbortSignal) =>
    http("/auth/me", dataSchema(userSchema), { signal, anonymous: true }),
  login: (input: { email: string; password: string }) =>
    http(
      "/auth/login",
      dataSchema(z.object({ user: userSchema, csrfToken: z.string() })),
      { method: "POST", body: input, anonymous: true },
    ),
  logout: () => http("/auth/logout", z.undefined(), { method: "POST" }),
};
