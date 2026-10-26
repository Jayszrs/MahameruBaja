import LaserCuttingPage from "../../src/screens/LaserCuttingPage";
import type { Metadata } from "next";
import LocalBusinessDetails from "../../src/components/LocalBusinessDetails";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { siteOrigin } from "../../src/lib/siteOrigin";
import { breadcrumbSchema, divisionBusinessSchema, jsonLd, organizationSchema } from "../../src/lib/structuredData";

const title = "Jasa Laser Cutting Bekasi & Bending Plat | Mahameru Baja";
const description = "Jasa laser cutting dan bending plat di Tambun, Bekasi. Kirim gambar, bahan, ketebalan, dan jumlah ke MBI untuk cek pengerjaan, harga, serta jadwal.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/jasa" },
  openGraph: { title, description, url: "/jasa", images: [{ url: "/images/laser-cutting-illustration.jpg", alt: "Ilustrasi proses laser cutting plat" }] },
  twitter: { card: "summary_large_image", title, description },
};

export default async function Page() {
  const divisions = (await readPublicDivisions()).filter(division => division.slug === "laser-cutting");
  const base = siteOrigin();
  const schema = { "@context": "https://schema.org", "@graph": [
    organizationSchema(base),
    ...divisions.map(division => divisionBusinessSchema(division, base)),
    ...divisions.map(division => ({
      "@type": "Service", "@id": `${base}/jasa#service`,
      name: "Jasa laser cutting dan bending plat Bekasi", url: `${base}/jasa`,
      serviceType: "Laser cutting dan bending plat", description,
      areaServed: division.area,
      provider: { "@id": `${base}/unit/${division.slug}#business` },
    })),
    breadcrumbSchema(base, "/jasa", "Jasa laser cutting Bekasi"),
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><LaserCuttingPage /><LocalBusinessDetails divisions={divisions} service /></>;
}
