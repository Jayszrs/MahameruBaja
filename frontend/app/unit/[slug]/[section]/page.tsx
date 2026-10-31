import { notFound } from "next/navigation";
import { connection } from "next/server";
import { readPublicDivisions } from "../../../../src/lib/divisionStore";
import { readPublicSiteContent } from "../../../../src/lib/siteContentStore";
import DivisionSubPage from "../../../../src/screens/DivisionSubPage";
import { unitSections, unitSectionLabels, type UnitSection } from "../../../../src/data/unitSections";

import { visibleInDivision } from "../../../../src/data/divisionCms";
import { divisionSearchTitle, divisionSearchDescription } from "../../../../src/data/divisionSeo";
import { siteOrigin } from "../../../../src/lib/siteOrigin";
import { divisionBusinessSchema, jsonLd, organizationSchema } from "../../../../src/lib/structuredData";

type Params = { slug: string; section: string };
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params;
  const division = (await readPublicDivisions()).find(d => d.slug === slug);
  if (!division || !unitSections.includes(section as UnitSection)) return {};
  const title = `${unitSectionLabels[section as UnitSection]} | ${divisionSearchTitle(division)}`;
  const description = divisionSearchDescription(division);
  return { title: { absolute: title }, description, alternates: { canonical: `/unit/${slug}/${section}` }, openGraph: { siteName: "Mahameru Baja Indonesia", title, description, url: `/unit/${slug}/${section}`, images: division.hero ? [{ url: division.hero, alt: division.name }] : [] } };
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params;
  const division = (await readPublicDivisions()).find(d => d.slug === slug);
  if (!division || !unitSections.includes(section as UnitSection)) notFound();
  if (["kontak", "produk", "galeri", "tentang", "layanan"].includes(section)) await connection();
  const content = ["kontak", "produk", "galeri", "tentang", "layanan"].includes(section) ? await readPublicSiteContent() : null;
  const contacts = section === "kontak" ? content!.contacts.filter(c => c.published) : [];
  const inventory = section === "produk" ? content!.inventory : [];
  const projects = ["galeri", "tentang", "layanan"].includes(section) ? content!.galleryProjects.filter(p => p.published && p.photos.length && visibleInDivision(p,division.slug)) : [];
  const base = siteOrigin();
  const schema = { "@context": "https://schema.org", "@graph": [organizationSchema(base), divisionBusinessSchema(division, base), {
    "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: division.name, item: `${base}/unit/${slug}` },
      { "@type": "ListItem", position: 3, name: unitSectionLabels[section as UnitSection], item: `${base}/unit/${slug}/${section}` },
    ],
  }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><DivisionSubPage division={division} section={section as UnitSection} contacts={contacts} inventory={inventory} projects={projects} appearance={content?.websiteAppearance} /></>;
}
