import AboutMergedPage from "../../src/screens/AboutMergedPage";
import { readSiteContent } from "../../src/lib/siteContentStore";
import { connection } from "next/server";

export const metadata = { title: "Tentang Mahameru Group | Lima Divisi, Satu Solusi", description: "Visi Mahameru Group dan lima divisi: retail, trading, laser cutting & CNC bending, fabrikasi dan erection.", alternates: { canonical: "/tentang-kami" } };

export default async function Page() {
  await connection();
  return <AboutMergedPage content={await readSiteContent()} />;
}
