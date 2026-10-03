import { notFound } from "next/navigation";
import ProductDetailPage from "../../../src/screens/ProductDetailPage";
import { getProductBySlug, products } from "../../../src/data/products";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (!getProductBySlug((await params).slug)) notFound();
  return <ProductDetailPage />;
}
