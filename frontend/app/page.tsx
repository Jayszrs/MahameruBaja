import HomePage from "../src/screens/HomePage";
import { connection } from "next/server";
import { readPublicSiteContent } from "../src/lib/siteContentStore";
import { siteOrigin } from "../src/lib/siteOrigin";
import { readPublicDivisions } from "../src/lib/divisionStore";
import { divisionBusinessSchema, jsonLd, organizationSchema, siteDisplayName, websiteSchema } from "../src/lib/structuredData";

export const metadata = {
  title: { absolute: "MBI Laser Cutting | Jasa Cutting Laser Bekasi & Tambun" },
  description: "MBI Laser Cutting, Mahameru Baja Indonesia: jasa cutting laser Bekasi dan Tambun, bending plat, fabrikasi, serta material baja. Kirim desain untuk cek proses dan harga.",
  alternates: { canonical: "/" },
  openGraph: { siteName: siteDisplayName, url: "/", title: "MBI Laser Cutting | Jasa Cutting Laser Bekasi & Tambun", description: "Jasa cutting laser plat, bending, fabrikasi, dan material konstruksi dalam lima divisi Mahameru Baja.", images: [{ url: "/images/laser-cutting-illustration.jpg", width: 1800, height: 1013, alt: "MBI Laser Cutting — ilustrasi proses produksi" }] },
};

export default async function Page() {
  await connection();
  const [stored, divisions] = await Promise.all([readPublicSiteContent(), readPublicDivisions()]);
  const content = { ...stored, contacts: stored.contacts.filter(c => c.published), reviews: stored.reviews.filter(r => r.published), socialAccounts: stored.socialAccounts.filter(a => a.published), socialPosts: stored.socialPosts.filter(p => p.published) };
  const base = siteOrigin();
  const schema = { "@context": "https://schema.org", "@graph": [
    { ...organizationSchema(base), subOrganization: divisions.map(division => ({ "@id": `${base}/unit/${division.slug}#business` })) },
    websiteSchema(base),
    ...divisions.map(division => divisionBusinessSchema(division, base)),
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><HomePage content={content} /></>;
}
