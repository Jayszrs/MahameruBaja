import AboutMergedPage from "../../src/screens/AboutMergedPage";
import { readSiteContent } from "../../src/lib/siteContentStore";

export const metadata = { title: "Tentang Mahameru Baja | Empat Divisi untuk Kebutuhan Baja", description: "Kenali Mahameru Baja, empat divisi untuk retail material, suplai proyek, laser cutting dan CNC bending, serta pengalaman pelanggan kami.", alternates: { canonical: "/tentang-kami" } };

export default async function Page() {
  return <AboutMergedPage content={await readSiteContent()} />;
}
