import type { MetadataRoute } from "next";
import { resolvedInventoryProducts } from "../src/data/inventory";
import { readPublishedArticles } from "../src/lib/articleStore";
import { readPublicDivisions } from "../src/lib/divisionStore";
import { readPublicSiteContent } from "../src/lib/siteContentStore";
import { isPreviewSite, siteOrigin } from "../src/lib/siteOrigin";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewSite()) return [];
  const base = siteOrigin();
  const [articles, divisions, content] = await Promise.all([readPublishedArticles(), readPublicDivisions(), readPublicSiteContent()]);
  const products = resolvedInventoryProducts(content.inventory).filter(product => content.inventory.some(item => item.productId === product.id && item.listed));
  const staticPaths = ["", "/tentang-kami", "/produk", "/jasa", "/proyek", "/informasi", "/kontak", "/minta-penawaran", "/sosial-media", "/kebijakan-privasi", "/syarat-ketentuan"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 })),
    ...divisions.map((division) => ({ url: `${base}/unit/${division.slug}`, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...divisions.flatMap(d => ["tentang", d.kind === "material" ? "produk" : "layanan", "galeri", "kontak"].map(section => ({ url: `${base}/unit/${d.slug}/${section}`, changeFrequency: "monthly" as const, priority: 0.7 }))),
    ...products.map((product) => ({ url: `${base}/produk/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${base}/informasi/${article.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
