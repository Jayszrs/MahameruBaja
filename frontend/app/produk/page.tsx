import { Suspense } from "react";
import ProductsPage from "../../src/screens/ProductsPage";
export const metadata = { title: "Katalog Besi Beton, Hollow, Plat & Material Baja", description: "Cari besi beton, hollow, plat, pipa, wiremesh, baja ringan, dan material konstruksi di Mahameru Baja Tambun dan Cibitung. Konfirmasi stok serta harga terbaru.", alternates: { canonical: "/produk" } };
export default function Page() { return <Suspense><ProductsPage /></Suspense>; }
