import { notFound } from "next/navigation";
import BusinessUnitPage from "../../../src/screens/BusinessUnitPage";
import { readPublicDivisions } from "../../../src/lib/divisionStore";
import { readPublishedArticles } from "../../../src/lib/articleStore";
import Link from "next/link";
import { visibleInDivision } from "../../../src/data/divisionCms";
import { connection } from "next/server";
import { readPublicSiteContent } from "../../../src/lib/siteContentStore";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = (await readPublicDivisions()).find((item) => item.slug === slug);
  const titles: Record<string, string> = {
    "retail-tambun": "Toko Besi Tambun | Mahameru Baja",
    "retail-cibitung": "Toko Besi Cibitung | Garuda Marginal Baja",
    "trading-proyek": "Supply Baja Proyek | Mahameru Baja Indonesia",
    "laser-cutting": "Laser Cutting & CNC Bending Bekasi | MBI",
    "fabrikasi-erection": "Fabrikasi & Erection Bekasi | MBI Project",
  };
  return unit ? { title: { absolute: titles[slug] || unit.name + " | Mahameru Baja" }, description: unit.description, alternates: { canonical: `/unit/${slug}` } } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const division = (await readPublicDivisions()).find((unit) => unit.slug === slug);
  if (!division) notFound();
  const content = await readPublicSiteContent();
  const articles = (await readPublishedArticles()).filter(a=>visibleInDivision(a,slug));
  return <><BusinessUnitPage division={division} contacts={content.contacts.filter(c => c.published)} content={content} />{articles.length>0 && <section className="home-section"><div className="home-shell"><p className="industrial-eyebrow">ARTIKEL / {division.label}</p><h2>Informasi dari divisi kami.</h2><div className="admin-article-activity">{articles.map(article=><Link key={article.id} href={`/informasi/${article.slug}`}><div><strong>{article.title}</strong><small>{article.category} ? {article.readTime}</small></div><span>?</span></Link>)}</div></div></section>}</>;
}
