import { notFound } from "next/navigation";
import BusinessUnitPage from "../../../src/screens/BusinessUnitPage";
import { readPublicDivisions } from "../../../src/lib/divisionStore";
import { readPublishedArticles } from "../../../src/lib/articleStore";
import Link from "next/link";
import { visibleInDivision } from "../../../src/data/divisionCms";
import { connection } from "next/server";
import { readPublicSiteContent } from "../../../src/lib/siteContentStore";
import { siteOrigin } from "../../../src/lib/siteOrigin";
import { divisionBusinessSchema, jsonLd, organizationSchema } from "../../../src/lib/structuredData";
import { divisionSearchTitle, divisionSearchDescription } from "../../../src/data/divisionSeo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = (await readPublicDivisions()).find((item) => item.slug === slug);
  if (!unit) return {};
  const title = divisionSearchTitle(unit);
  const description = divisionSearchDescription(unit);
  return { title: { absolute: title }, description, alternates: { canonical: `/unit/${slug}` }, openGraph: { siteName: "Mahameru Baja Indonesia", title, description, url: `/unit/${slug}`, images: unit.hero ? [{ url: unit.hero, alt: unit.name }] : [] }, twitter: { card: "summary_large_image", title, description } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const division = (await readPublicDivisions()).find((unit) => unit.slug === slug);
  if (!division) notFound();
  const content = await readPublicSiteContent();
  const articles = (await readPublishedArticles()).filter(a=>visibleInDivision(a,slug));
  const base = siteOrigin();
  const schema = { "@context": "https://schema.org", "@graph": [organizationSchema(base), divisionBusinessSchema(division, base), {
    "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: division.name, item: `${base}/unit/${slug}` },
    ],
  }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><BusinessUnitPage division={division} contacts={content.contacts.filter(c => c.published)} content={content} />{articles.length>0 && <section className="home-section"><div className="home-shell"><p className="industrial-eyebrow">ARTIKEL / {division.label}</p><h2>Informasi dari divisi kami.</h2><div className="admin-article-activity">{articles.map(article=><Link key={article.id} href={`/informasi/${article.slug}`}><div><strong>{article.title}</strong><small>{article.category} ? {article.readTime}</small></div><span>?</span></Link>)}</div></div></section>}</>;
}
