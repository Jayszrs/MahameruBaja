import InformasiPage from "../../src/screens/InformasiPage";
import { readPublishedArticles } from "../../src/lib/articleStore";
export const dynamic = "force-dynamic";
export const metadata = { title: "Informasi" };
export default async function Page() {
  return <InformasiPage articles={await readPublishedArticles()} />;
}
