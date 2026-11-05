import { readPublicSiteContent } from "../../src/lib/siteContentStore";
import { appearanceForSite } from "../../src/data/websiteAppearance";
import SocialProof from "../../src/components/SocialProof";
import LaserCuttingPage from "../../src/screens/LaserCuttingPage";
import type { Metadata } from "next";
import LocalBusinessDetails from "../../src/components/LocalBusinessDetails";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { siteOrigin } from "../../src/lib/siteOrigin";
import { breadcrumbSchema, divisionBusinessSchema, faqSchema, jsonLd, organizationSchema, siteDisplayName } from "../../src/lib/structuredData";
import LaserServiceGuide from "../../src/components/LaserServiceGuide";
import { readPublishedArticles } from "../../src/lib/articleStore";
import { laserFAQs } from "../../src/data/business";
import { contentOwner, visibleInDivision } from "../../src/data/divisionCms";

const title = "Jasa Cutting Laser Bekasi & Tambun | MBI Laser Cutting";
const description = "MBI Laser Cutting melayani jasa cutting laser Bekasi dan Tambun, bending plat, serta fabrikasi. Kirim gambar, material, ukuran, dan jumlah untuk penawaran.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/jasa" },
  openGraph: { siteName: siteDisplayName, title, description, url: "/jasa", images: [{ url: "/images/laser-cutting-illustration.jpg", alt: "Ilustrasi proses laser cutting plat" }] },
  twitter: { card: "summary_large_image", title, description },
};

export default async function Page() {
  const [allDivisions, published, content] = await Promise.all([readPublicDivisions(), readPublishedArticles(), readPublicSiteContent()]);
  const divisions = allDivisions.filter(division => division.slug === "laser-cutting");
  const faqs = divisions[0]?.faq ?? laserFAQs;
  const faqHeading = divisions[0]?.faqHeading || "Pertanyaan laser cutting & bending.";
  const articles = published.filter(article => visibleInDivision(article, "laser-cutting") || !contentOwner(article) && article.audience === undefined && /laser|bending/i.test(`${article.title} ${article.category}`)).slice(0, 3);
  const base = siteOrigin();
  const schema = { "@context": "https://schema.org", "@graph": [
    organizationSchema(base),
    ...divisions.map(division => divisionBusinessSchema(division, base)),
    ...divisions.map(division => ({
      "@type": "Service", "@id": `${base}/jasa#service`,
      name: "Jasa laser cutting dan bending plat Tambun, Bekasi", url: `${base}/jasa`,
      alternateName: ["Jasa cutting laser Tambun", "Jasa cutting laser Bekasi", "Jasa cutting laser plat"],
      serviceType: "Laser cutting dan bending plat", description,
      areaServed: division.area,
      provider: { "@id": `${base}/unit/${division.slug}#business` },
    })),
    ...(appearanceForSite(content.websiteAppearance).hiddenServiceSections.includes("faq") ? [] : [faqSchema(base, "/jasa", faqs)]),
    breadcrumbSchema(base, "/jasa", "Jasa Cutting Laser Bekasi & Tambun"),
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><LaserCuttingPage appearance={content.websiteAppearance} projects={content.galleryProjects} faqs={faqs} faqHeading={faqHeading}><LaserServiceGuide articles={articles} /></LaserCuttingPage>{content.divisionReviews["laser-cutting"] && <SocialProof content={content.divisionReviews["laser-cutting"]} companyName="MBI Laser Cutting" includeImported={false} partnerLogos={[]} />}<LocalBusinessDetails divisions={divisions} service /></>;
}
