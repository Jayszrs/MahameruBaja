import { notFound } from "next/navigation";
import { connection } from "next/server";
import { readPublicDivisions } from "../../../../src/lib/divisionStore";
import { readPublicSiteContent } from "../../../../src/lib/siteContentStore";
import DivisionSubPage from "../../../../src/screens/DivisionSubPage";
import { unitSections, unitSectionLabels, type UnitSection } from "../../../../src/data/unitSections";

import { visibleInDivision } from "../../../../src/data/divisionCms";

type Params = { slug: string; section: string };
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params;
  const division = (await readPublicDivisions()).find(d => d.slug === slug);
  if (!division || !unitSections.includes(section as UnitSection)) return {};
  return { title: { absolute: `${unitSectionLabels[section as UnitSection]} | ${division.name}` }, description: division.description, alternates: { canonical: `/unit/${slug}/${section}` } };
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params;
  const division = (await readPublicDivisions()).find(d => d.slug === slug);
  if (!division || !unitSections.includes(section as UnitSection)) notFound();
  if (["kontak", "produk", "galeri", "tentang"].includes(section)) await connection();
  const content = ["kontak", "produk", "galeri", "tentang"].includes(section) ? await readPublicSiteContent() : null;
  const contacts = section === "kontak" ? content!.contacts.filter(c => c.published) : [];
  const inventory = section === "produk" ? content!.inventory : [];
  const projects = ["galeri", "tentang"].includes(section) ? content!.galleryProjects.filter(p => p.published && p.photos.length && visibleInDivision(p,division.slug)) : [];
  return <DivisionSubPage division={division} section={section as UnitSection} contacts={contacts} inventory={inventory} projects={projects} />;
}
