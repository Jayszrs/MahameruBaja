import { Suspense } from "react";
import { readSiteContent } from "../../src/lib/siteContentStore";
import { connection } from "next/server";
import ProductsPage from "../../src/screens/ProductsPage";
export const metadata = { title: "Katalog Besi Beton, Hollow, Plat & Material Baja", description: "Cari besi beton, hollow, plat, pipa, wiremesh, baja ringan, dan material konstruksi di Mahameru Baja Tambun dan Cibitung. Konfirmasi stok serta harga terbaru.", alternates: { canonical: "/produk" } };
export default async function Page() { await connection(); const { inventory } = await readSiteContent(); return <Suspense><ProductsPage inventory={inventory.filter(i => i.listed)} /></Suspense>; }
