import HomePage from "../src/screens/HomePage";
import { googleMapsUrl } from "../src/data/googleReviews";

export const metadata = {
  title: { absolute: "Jasa Laser Cutting Bekasi | Mahameru Baja Indonesia" },
  description: "MBI melayani jasa laser cutting plat, CNC bending, fabrikasi, dan supply besi proyek di Bekasi, Tambun, serta Cibitung. Kirim gambar kerja atau cari material dan minta penawaran.",
  alternates: { canonical: "/" },
  openGraph: { title: "Jasa Laser Cutting Bekasi | Mahameru Baja Indonesia", description: "Laser cutting plat, CNC bending, fabrikasi, dan material konstruksi dalam empat divisi Mahameru Baja." },
};

export default function Page() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahamerubaja.com";
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
    sameAs: [googleMapsUrl],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }} /><HomePage /></>;
}
