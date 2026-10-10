import { divisionIdentity, groupVision } from "../data/companyIdentity";
export default function DivisionVision({ slug }: { slug: string }) {
  return <section className="division-vision home-shell" aria-label="Visi dan misi divisi">
    <article data-reveal><p className="industrial-eyebrow">VISI MAHAMERU GROUP</p><h2>Terpercaya.<br />Terintegrasi.</h2><p>{groupVision}</p></article>
    <article data-reveal><p className="industrial-eyebrow">MISI DIVISI</p><h2>Fokus pada<br />kebutuhan Anda.</h2><p>{divisionIdentity[slug].mission}</p></article>
  </section>;
}
