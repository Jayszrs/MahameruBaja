import InformasiPage from "../../src/screens/InformasiPage";
import { readPublishedArticles } from "../../src/lib/articleStore";
export const dynamic = "force-dynamic";
export const metadata = { title: "Artikel Besi, Baja & Laser Cutting", description: "Informasi material besi dan baja, laser cutting, bending, serta kebutuhan proyek dari Mahameru Baja Indonesia.", alternates: { canonical: "/informasi" } };
export default async function Page() {
  return <InformasiPage articles={await readPublishedArticles()} />;
}
