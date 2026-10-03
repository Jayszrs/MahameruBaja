import { notFound } from "next/navigation";
import BusinessUnitPage from "../../../src/screens/BusinessUnitPage";
import { businessUnits } from "../../../src/data/business";

export function generateStaticParams() { return businessUnits.map((unit) => ({ slug: unit.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = businessUnits.find((item) => item.slug === slug);
  return unit ? { title: unit.name, description: unit.description } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!businessUnits.some((unit) => unit.slug === slug)) notFound();
  return <BusinessUnitPage />;
}
