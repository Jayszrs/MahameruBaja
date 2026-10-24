import { Suspense } from "react";
import QuotationPage from "../../src/screens/QuotationPage";
export const metadata = { title: "Minta Penawaran Besi & Laser Cutting", description: "Kirim kebutuhan material besi, baja, laser cutting, bending, atau fabrikasi ke tim Mahameru Baja untuk mendapatkan penawaran.", alternates: { canonical: "/minta-penawaran" } };
export default function Page() { return <Suspense><QuotationPage /></Suspense>; }
