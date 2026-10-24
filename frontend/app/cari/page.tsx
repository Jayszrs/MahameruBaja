import { Suspense } from "react";
import SearchPage from "../../src/screens/SearchPage";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Cari Produk", robots: { index: false, follow: true } };
export default async function Page() { const { inventory } = await readPublicSiteContent(); return <Suspense><SearchPage inventory={inventory} /></Suspense>; }
