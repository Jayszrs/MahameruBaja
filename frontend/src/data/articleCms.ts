import { z } from "zod";
import type { Article } from "./articles";

export function articleSlug(title: string) {
  return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140).replace(/-$/, "");
}

export function articleToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function safeArticleImage(value: string) {
  if (/^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..")) return true;
  if (/^\/api\/articles\/media\/[a-f0-9-]+\.(jpg|png|webp)$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
  catch { return false; }
}

export function safeArticleLink(value: string) {
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//"))) return true;
  try { const url = new URL(value); return ["https:", "http:", "mailto:"].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}

const dateSchema = z.string().refine(value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Tanggal tidak valid.");

export const articleInputSchema = z.object({
  title: z.string().trim().max(180),
  slug: z.string().trim().max(140).refine(value => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Alamat hanya boleh memakai huruf kecil, angka, dan tanda hubung."),
  category: z.string().trim().max(100),
  date: dateSchema,
  excerpt: z.string().trim().max(600),
  image: z.string().trim().max(2000).refine(value => !value || safeArticleImage(value), "Alamat gambar tidak valid."),
  imageAlt: z.string().trim().max(250),
  content: z.string().max(100_000),
  status: z.enum(["draft", "published"]),
}).superRefine((value, context) => {
  if (value.status !== "published") return;
  for (const key of ["title", "category", "excerpt", "image", "imageAlt", "content"] as const) {
    if (!value[key].trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: "Wajib diisi sebelum artikel diterbitkan." });
  }
});

export const articleRevisionSchema = z.object({ revision: z.number().int().min(0) });
export const articleUpdateSchema = z.intersection(articleInputSchema, articleRevisionSchema);
export const articleRecordSchema = z.intersection(articleInputSchema, z.object({
  id: z.string().min(1).max(80), revision: z.number().int().min(0),
  readTime: z.string().max(50), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  firstPublishedAt: z.string().datetime().nullable(),
}));
export const articleCollectionSchema = z.array(articleRecordSchema).superRefine((records, context) => {
  for (const key of ["id", "slug"] as const) {
    if (new Set(records.map(record => record[key])).size !== records.length) context.addIssue({ code: z.ZodIssueCode.custom, message: `${key} artikel harus unik.` });
  }
});
export type ArticleInput = z.infer<typeof articleInputSchema>;
export type ArticleRecord = z.infer<typeof articleRecordSchema>;

export function articleReadTime(content: string) {
  const words = content.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#*_|>`~-]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} mnt baca`;
}

export function publicArticle(record: ArticleRecord): Article {
  return { id: record.id, slug: record.slug, title: record.title, category: record.category, date: record.date,
    excerpt: record.excerpt, image: record.image, imageAlt: record.imageAlt, content: record.content, readTime: record.readTime };
}

export class ArticleError extends Error {
  constructor(public code: string) { super(code); }
}
