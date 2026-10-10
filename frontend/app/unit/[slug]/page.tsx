import { notFound } from "next/navigation";
import BusinessUnitPage from "../../../src/screens/BusinessUnitPage";
import { divisions } from "../../../src/data/divisionContent";
import { connection } from "next/server";
import { readSiteContent } from "../../../src/lib/siteContentStore";

export function generateStaticParams() { return divisions.map((unit) => ({ slug: unit.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = divisions.find((item) => item.slug === slug);
  const titles: Record<string, string> = {
    "retail-tambun": "Toko Besi Tambun | Mahameru Baja",
    "retail-cibitung": "Toko Besi Cibitung | Garuda Marginal Baja",
    "trading-proyek": "Supply Baja Proyek | Mahameru Baja Indonesia",
    "laser-cutting": "Laser Cutting & CNC Bending Bekasi | MBI",
    "fabrikasi-erection": "Fabrikasi & Erection Bekasi | MBI Project",
  };
  return unit ? { title: { absolute: titles[slug] }, description: unit.description, alternates: { canonical: `/unit/${slug}` } } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const division = divisions.find((unit) => unit.slug === slug);
  if (!division) notFound();
  return <BusinessUnitPage division={division} contacts={(await readSiteContent()).contacts.filter(c => c.published)} />;
}
