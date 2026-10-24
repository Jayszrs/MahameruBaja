import { notFound } from "next/navigation";
import { readPublicSiteContent } from "../../../src/lib/siteContentStore";
import { connection } from "next/server";
import ProductDetailPage from "../../../src/screens/ProductDetailPage";
import { products } from "../../../src/data/products";
import { resolvedInventoryProducts } from "../../../src/data/inventory";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = resolvedInventoryProducts((await readPublicSiteContent()).inventory).find(product => product.slug === slug);
  return product ? { title: product.name, description: product.description, alternates: { canonical: `/produk/${product.slug}` } } : {};
}
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ unit?: string }> }) {
  await connection();
  const { inventory } = await readPublicSiteContent();
  const { slug } = await params;
  if (!resolvedInventoryProducts(inventory).some(product => product.slug === slug && inventory.some(item => item.productId === product.id && item.listed))) notFound();
  return <ProductDetailPage inventory={inventory.filter(i => i.listed)} selectedDivision={(await searchParams).unit} />;
}
