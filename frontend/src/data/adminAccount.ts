import { z } from "zod";
export const accountInputSchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  division: z.string().min(1).max(80).nullable(), active: z.boolean(),
});
export const accountSchema = accountInputSchema.extend({
  id: z.string().min(1), role: z.enum(["super_admin", "division_admin"]), passwordHash: z.string().min(1),
  mustChangePassword: z.boolean(), sessionVersion: z.number().int().nonnegative(), revision: z.number().int().nonnegative(),
  createdAt: z.string(), updatedAt: z.string(),
});
export type AdminAccount = z.infer<typeof accountSchema>;
export type AdminIdentity = Pick<AdminAccount, "id" | "name" | "email" | "role" | "division" | "mustChangePassword">;
export type PublicAdminAccount = Omit<AdminAccount, "passwordHash" | "sessionVersion">;
export const publicAccount = ({ passwordHash: _hash, sessionVersion: _version, ...account }: AdminAccount): PublicAdminAccount => account;
