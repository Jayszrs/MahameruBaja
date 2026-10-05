import type { MetadataRoute } from "next";
import { products } from "../src/data/products";
import { articles } from "../src/data/articles";
import { divisions } from "../src/data/divisionContent";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahamerubaja.com";
  const staticPaths = ["", "/divisi", "/tentang-kami", "/produk", "/layanan", "/laser-cutting", "/proyek", "/informasi", "/kontak", "/minta-penawaran"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 })),
    ...divisions.map((division) => ({ url: `${base}/unit/${division.slug}`, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...products.map((product) => ({ url: `${base}/produk/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${base}/informasi/${article.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
