import HomePage from "../src/screens/HomePage";
import { connection } from "next/server";
import { readPublicSiteContent } from "../src/lib/siteContentStore";
import { siteOrigin } from "../src/lib/siteOrigin";

export const metadata = {
  title: { absolute: "Jasa Laser Cutting Bekasi | Mahameru Baja Indonesia" },
  description: "MBI melayani jasa laser cutting plat, CNC bending, fabrikasi, dan supply besi proyek di Bekasi, Tambun, serta Cibitung. Kirim gambar kerja atau cari material dan minta penawaran.",
  alternates: { canonical: "/" },
  openGraph: { title: "Jasa Laser Cutting Bekasi | Mahameru Baja Indonesia", description: "Laser cutting plat, CNC bending, fabrikasi, dan material konstruksi dalam lima divisi Mahameru Baja.", images: [{ url: "/images/laser-cutting-illustration.jpg", width: 1800, height: 1013, alt: "MBI Laser Cutting — ilustrasi proses produksi" }] },
};

export default async function Page() {
  await connection();
  const stored = await readPublicSiteContent();
  const content = { ...stored, contacts: [], reviews: stored.reviews.filter(r => r.published), socialAccounts: stored.socialAccounts.filter(a => a.published), socialPosts: stored.socialPosts.filter(p => p.published) };
  const base = siteOrigin();
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Mahameru Baja Indonesia",
    url: base,
    image: `${base}/images/steel-indonesia/toko-mahameru.jpg`,
    telephone: "+6281218052017",
    description: "Jasa laser cutting plat, CNC bending, retail besi, dan supply material proyek di Kabupaten Bekasi.",
    areaServed: ["Tambun Selatan", "Cibitung", "Kabupaten Bekasi"],
    address: { "@type": "PostalAddress", addressLocality: "Tambun Selatan", addressRegion: "Jawa Barat", addressCountry: "ID" },
    sameAs: [content.mapsUrl, ...content.socialAccounts.map(account => account.url)],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }} /><HomePage content={content} /></>;
}
