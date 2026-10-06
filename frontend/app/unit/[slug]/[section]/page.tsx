import { notFound } from "next/navigation";
import { connection } from "next/server";
import { divisions } from "../../../../src/data/divisionContent";
import { readSiteContent } from "../../../../src/lib/siteContentStore";
import DivisionSubPage, { unitSections, unitSectionLabels, type UnitSection } from "../../../../src/screens/DivisionSubPage";

type Params = { slug: string; section: string };
export function generateStaticParams() { return divisions.flatMap(d => ["tentang", d.slug.startsWith("retail") ? "produk" : "layanan", "galeri", "kontak"].map(section => ({ slug: d.slug, section }))); }
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params;
  const division = divisions.find(d => d.slug === slug);
  if (!division || !unitSections.includes(section as UnitSection)) return {};
  return { title: { absolute: `${unitSectionLabels[section as UnitSection]} | ${division.name}` }, description: division.description, alternates: { canonical: `/unit/${slug}/${section}` } };
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params;
  const division = divisions.find(d => d.slug === slug);
  if (!division || !unitSections.includes(section as UnitSection) || (slug === "laser-cutting" && section === "produk")) notFound();
  if (section === "kontak") await connection();
  const contacts = section === "kontak" ? (await readSiteContent()).contacts.filter(c => c.published) : [];
  return <DivisionSubPage division={division} section={section as UnitSection} contacts={contacts} />;
}
