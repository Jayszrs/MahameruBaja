import type { MetadataRoute } from "next";
import { isPreviewSite, siteOrigin } from "../src/lib/siteOrigin";
export default function robots(): MetadataRoute.Robots {
  if (isPreviewSite()) return { rules: { userAgent: "*", disallow: "/" } };
  const base = siteOrigin();
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/admin-demo", "/cari"] }, sitemap: `${base}/sitemap.xml` };
}
