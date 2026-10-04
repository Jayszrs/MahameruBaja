import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahamerubaja.com";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/admin-demo", "/cari"] }, sitemap: `${base}/sitemap.xml` };
}
