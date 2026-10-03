import { Suspense } from "react";
import ProductsPage from "../../src/screens/ProductsPage";
export const metadata = { title: "Katalog Produk" };
export default function Page() { return <Suspense><ProductsPage /></Suspense>; }
