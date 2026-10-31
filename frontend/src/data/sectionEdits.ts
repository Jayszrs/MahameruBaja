import { z } from "zod";
import { ownershipFields } from "./divisionCms";
import { safeHttpsUrl, safeInternalLink, safeLocalAsset } from "./safeUrls";
import { textPages } from "./websiteTexts";
export function safeSectionLink(value: string) {
  return safeInternalLink(value) || safeHttpsUrl(value) || /^(tel:\+?[\d ()-]{7,30}|mailto:[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)$/.test(value);
}
export const sectionEditSchema = z.object({
  ...ownershipFields,
  id: z.string().min(1).max(80),
  page: z.enum(Object.keys(textPages) as [keyof typeof textPages, ...Array<keyof typeof textPages>]),
  section: z.string().regex(/^[a-z][a-z0-9-]{0,79}$/),
  kind: z.enum(["text", "image", "link", "embed"]),
  source: z.string().min(1).max(5000),
  replacement: z.string().max(5000),
  label: z.string().max(200),
  published: z.boolean().default(true),
}).superRefine((row, ctx) => {
  const value = row.replacement;
  if (row.kind === "link" && !safeSectionLink(value)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["replacement"], message: "Gunakan tautan halaman, HTTPS, telepon, atau email yang valid." });
  if (row.kind === "image" && value && !safeLocalAsset(value, ["images", "media", "api/cms/media"]) && !safeHttpsUrl(value)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["replacement"], message: "Gunakan gambar lokal atau tautan HTTPS." });
  if (row.kind === "embed" && !safeHttpsUrl(value)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["replacement"], message: "Gunakan URL HTTPS untuk peta." });
});
export type SectionEdit = z.infer<typeof sectionEditSchema>;
