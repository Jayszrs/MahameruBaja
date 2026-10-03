import { Suspense } from "react";
import SearchPage from "../../src/screens/SearchPage";
export const metadata = { title: "Cari Produk", robots: { index: false, follow: true } };
export default function Page() { return <Suspense><SearchPage /></Suspense>; }
