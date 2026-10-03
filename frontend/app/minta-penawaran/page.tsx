import { Suspense } from "react";
import QuotationPage from "../../src/screens/QuotationPage";
export const metadata = { title: "Minta Penawaran" };
export default function Page() { return <Suspense><QuotationPage /></Suspense>; }
