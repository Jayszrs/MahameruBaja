import KontakPage from "../../src/screens/KontakPage";
import { connection } from "next/server";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Kontak Tim & Divisi", description: "Hubungi tim Mahameru Baja untuk retail besi, supply proyek, laser cutting dan CNC bending di Bekasi.", alternates: { canonical: "/kontak" } };
export default async function Page() {
  await connection();
  return <KontakPage contacts={(await readPublicSiteContent()).contacts.filter(c => c.published)} />;
}
