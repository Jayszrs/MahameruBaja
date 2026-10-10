import { notFound } from "next/navigation";
import { readSiteContent } from "../../../src/lib/siteContentStore";
import { connection } from "next/server";
import ProductDetailPage from "../../../src/screens/ProductDetailPage";
import { getProductBySlug, products } from "../../../src/data/products";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description, alternates: { canonical: `/produk/${product.slug}` } } : {};
}
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ unit?: string }> }) {
  if (!getProductBySlug((await params).slug)) notFound();
  await connection();
  const { inventory } = await readSiteContent();
  return <ProductDetailPage inventory={inventory.filter(i => i.listed)} selectedDivision={(await searchParams).unit} />;
}
