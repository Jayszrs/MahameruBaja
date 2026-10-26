import { Suspense } from "react";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
import { connection } from "next/server";
import ProductsPage from "../../src/screens/ProductsPage";
import type { Metadata } from "next";
import LocalBusinessDetails from "../../src/components/LocalBusinessDetails";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { siteOrigin } from "../../src/lib/siteOrigin";
import { breadcrumbSchema, divisionBusinessSchema, jsonLd, organizationSchema } from "../../src/lib/structuredData";
const title = "Toko Besi & Baja Bekasi, Tambun, Cibitung | Mahameru Baja";
const description = "Katalog toko besi dan baja Bekasi: besi beton, hollow, pipa, plat, WF, wiremesh, dan baja ringan. Hubungi toko Tambun atau Cibitung untuk cek stok dan harga.";
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: "/produk" },
  openGraph: { title, description, url: "/produk", images: [{ url: "/images/steel-indonesia/toko-mahameru.jpg", alt: "Toko besi Mahameru Baja di Tambun, Bekasi" }] },
  twitter: { card: "summary_large_image", title, description },
};
export default async function Page() {
  await connection();
  const [{ inventory }, allDivisions] = await Promise.all([readPublicSiteContent(), readPublicDivisions()]);
  const divisions = allDivisions.filter(division => division.slug.startsWith("retail-"));
  const base = siteOrigin();
  const schema = { "@context": "https://schema.org", "@graph": [
    organizationSchema(base), ...divisions.map(division => divisionBusinessSchema(division, base)),
    { "@type": "CollectionPage", "@id": `${base}/produk#webpage`, url: `${base}/produk`, name: title, description, about: divisions.map(division => ({ "@id": `${base}/unit/${division.slug}#business` })) },
    breadcrumbSchema(base, "/produk", "Toko besi dan baja Bekasi"),
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><Suspense><ProductsPage inventory={inventory.filter(i => i.listed)} /></Suspense><LocalBusinessDetails divisions={divisions} /></>;
}
