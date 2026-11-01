"use client";
import { useCompanyProfile } from "./PublicText";
import PublicText, { PublicSection } from "./PublicText";
import { useDivisionDirectory } from "./DivisionDirectory";
import { groupVision } from "../data/companyIdentity";
export default function DivisionVision({ slug }: { slug: string }) {
  const company=useCompanyProfile();
  const { divisionIdentity } = useDivisionDirectory();
  return <PublicText><PublicSection section="vision" page="about"><section className="division-vision home-shell" aria-label="Visi dan misi divisi">
    <article data-reveal><p className="industrial-eyebrow">VISI MAHAMERU GROUP</p><h2>Terpercaya.<br />Terintegrasi.</h2><p>{company.vision}</p></article>
    <article data-reveal><p className="industrial-eyebrow">MISI DIVISI</p><h2>Fokus pada<br />kebutuhan Anda.</h2><p>{divisionIdentity[slug]?.mission || ""}</p></article>
  </section></PublicSection></PublicText>;
}
