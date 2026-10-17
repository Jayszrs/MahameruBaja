import { z } from "zod";
import { ownershipFields } from "./divisionCms";
export const textPages = { all: "Semua halaman", home: "Beranda", about: "Tentang kami", products: "Produk", services: "Layanan", gallery: "Galeri", contact: "Kontak", social: "Sosial media", articles: "Artikel", quotation: "Permintaan penawaran", search: "Pencarian", legal: "Privasi & ketentuan" } as const;
export type TextPage = keyof typeof textPages;
export const websiteTextSchema = z.object({ ...ownershipFields, id: z.string().min(1).max(80), page: z.enum(Object.keys(textPages) as [TextPage, ...TextPage[]]), source: z.string().trim().min(1).max(5000), replacement: z.string().trim().min(1).max(5000), published: z.boolean().default(true) });
export type WebsiteText = z.infer<typeof websiteTextSchema>;
export function websitePage(path: string): TextPage {
  const route = path.replace(/^\/unit\/[^/]+/, "") || "/";
  if (route === "/") return "home";
  if (/^\/(tentang|tentang-kami)/.test(route)) return "about";
  if (/^\/produk/.test(route)) return "products";
  if (/^\/(layanan|jasa|laser-cutting)/.test(route)) return "services";
  if (/^\/(galeri|proyek)/.test(route)) return "gallery";
  if (/^\/kontak/.test(route)) return "contact";
  if (/^\/sosial-media/.test(route)) return "social";
  if (/^\/informasi/.test(route)) return "articles";
  if (/^\/minta-penawaran/.test(route)) return "quotation";
  if (/^\/cari/.test(route)) return "search";
  return "legal";
}
export const normalizeWebsiteText = (value: string) => value.replace(/\s+/g, " ").trim();
