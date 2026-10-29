import { z } from "zod";
import { id, date } from "../../../config/api-types";

export const userSchema = z.object({
  id,
  email: z.string(),
  name: z.string(),
  role: z.enum(["OPERATOR", "SUPERVISOR"]),
  isActive: z.boolean(),
  deletedAt: date.nullable(),
  createdAt: date,
  updatedAt: date,
});
export type User = z.infer<typeof userSchema>;
