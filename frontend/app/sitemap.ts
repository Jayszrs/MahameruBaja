import type { MetadataRoute } from "next";
import { products } from "../src/data/products";
import { readPublishedArticles } from "../src/lib/articleStore";
import { divisions } from "../src/data/divisionContent";
import { isPreviewSite, siteOrigin } from "../src/lib/siteOrigin";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewSite()) return [];
  const base = siteOrigin();
  const articles = await readPublishedArticles();
  const staticPaths = ["", "/tentang-kami", "/produk", "/jasa", "/proyek", "/informasi", "/kontak", "/minta-penawaran", "/sosial-media"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 })),
    ...divisions.map((division) => ({ url: `${base}/unit/${division.slug}`, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...divisions.flatMap(d => ["tentang", d.slug.startsWith("retail") ? "produk" : "layanan", "galeri", "kontak"].map(section => ({ url: `${base}/unit/${d.slug}/${section}`, changeFrequency: "monthly" as const, priority: 0.7 }))),
    ...products.map((product) => ({ url: `${base}/produk/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${base}/informasi/${article.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
