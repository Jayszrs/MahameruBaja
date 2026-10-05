import { z } from "zod";
import { divisionSlugs } from "./siteContent";

export const requestInputSchema = z.object({
  kind: z.enum(["GENERAL", "QUOTATION", "LASER", "TRADING"]),
  businessUnitSlug: z.enum(divisionSlugs).default("retail-tambun"),
  name: z.string().trim().min(2).max(160), company: z.string().trim().max(200).optional(),
  whatsapp: z.string().trim().min(8).max(24).regex(/^[+0-9\s()-]+$/),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional(), request: z.string().trim().max(5000).optional(),
  consent: z.literal(true), source: z.string().max(80).default("WEBSITE"),
  metadata: z.record(z.union([z.string().max(1000), z.number(), z.boolean(), z.null()])).optional(),
  items: z.array(z.object({ productName: z.string().trim().min(1).max(200), specification: z.string().trim().max(1000).optional(), quantity: z.number().positive().max(100000000).optional(), unit: z.string().trim().max(32).optional() })).max(50).default([]),
});
export const requestStatuses = ["Baru", "Review kebutuhan", "Menyiapkan penawaran", "Menunggu pelanggan", "Diproses", "Selesai", "Dibatalkan"] as const;
export const requestRecordSchema = requestInputSchema.extend({
  id: z.string(), revision: z.number().int().nonnegative(), createdAt: z.string(), updatedAt: z.string(),
  status: z.enum(requestStatuses), notes: z.string().max(5000), archived: z.boolean(),
  idempotencyKey: z.string().max(100).optional(),
});
export const requestPatchSchema = z.object({ revision: z.number().int().nonnegative(), input: requestInputSchema.optional(), status: z.enum(requestStatuses).optional(), notes: z.string().max(5000).optional(), archived: z.boolean().optional() });
export type RequestInput = z.infer<typeof requestInputSchema>;
export type RequestRecord = z.infer<typeof requestRecordSchema>;
