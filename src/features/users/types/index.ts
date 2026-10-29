import { z } from "zod";
export { userSchema } from "../../auth/types";
export type { User } from "../../auth/types";

const name = z
  .string()
  .trim()
  .refine(
    (v) => [...v].length >= 1 && [...v].length <= 120,
    "Nama harus 1–120 karakter Unicode.",
  );
const role = z.enum(["OPERATOR", "SUPERVISOR"]);
export const createUserInput = z.object({
  name,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email())
    .refine((v) => [...v].length <= 254, "Email maksimal 254 karakter."),
  password: z
    .string()
    .refine(
      (v) => [...v].length >= 12 && [...v].length <= 128,
      "Password harus 12–128 karakter; spasi dipertahankan.",
    ),
  role,
});
export const updateUserInput = z.object({
  name,
  role,
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
});
