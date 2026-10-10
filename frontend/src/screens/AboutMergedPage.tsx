import Image from "next/image";
import Link from "next/link";
import { divisions } from "../data/divisionContent";
import { divisionIdentity, groupVision, groupMotto, divisionWhatsApp } from "../data/companyIdentity";
import type { SiteContent } from "../data/siteContent";
import SocialProof from "../components/SocialProof";

export default function AboutMergedPage({ content }: { content: SiteContent }) {
  return <div className="company-about">
    <section className="company-about-hero">
      <div className="company-about-background" data-parallax="0.22"><Image src="/images/steel-indonesia/toko-mahameru.jpg" alt="Toko Mahameru Baja di Tambun" fill sizes="100vw" priority /></div>
      <div className="home-shell"><nav aria-label="Breadcrumb"><Link href="/">Beranda</Link><span>/ Tentang Kami</span></nav><p className="industrial-eyebrow">MAHAMERU GROUP / BEKASI</p><h1>Dari material<br />hingga <em>hasil kerja.</em></h1><p>{groupMotto}</p><a href="#divisi" className="home-button home-button-primary">Kenali divisi kami ↗</a></div>
    </section>
    <section className="company-vision home-shell" aria-labelledby="vision-heading"><p className="industrial-eyebrow">VISI MAHAMERU GROUP</p><h2 id="vision-heading">Terpercaya.<br /><em>Terintegrasi.</em></h2><p>{groupVision}</p></section>
    <section id="divisi" className="company-divisions home-shell" aria-labelledby="division-heading"><div className="company-divisions-heading"><p className="industrial-eyebrow">LIMA DIVISI / SATU SOLUSI</p><h2 id="division-heading">Tim yang tepat untuk<br />setiap kebutuhan.</h2><p>Retail, pengadaan material, laser cutting, hingga fabrikasi dan erection. Kenali ruang lingkup dan hubungi admin masing-masing divisi.</p></div>
      {divisions.map((division, index) => <article key={division.slug} className="company-division" data-reveal><div className="company-division-top"><span>0{index + 1} / {division.label}</span><Image src={divisionIdentity[division.slug].logo} alt={`Logo ${division.name}`} width={180} height={140} /></div><div className="company-division-main"><figure><div data-parallax="0.12"><Image src={division.hero} alt={division.name} fill sizes="(max-width: 800px) 100vw, 45vw" /></div><figcaption>{division.area}</figcaption></figure><div><h3>{division.name}</h3><p>{division.description}</p><div className="company-division-mission"><h4>Misi divisi</h4><p>{divisionIdentity[division.slug].mission}</p></div><div className="company-division-actions"><Link href={`/unit/${division.slug}`}>Buka website divisi ↗</Link><a href={divisionWhatsApp(division.slug)} target="_blank" rel="noopener noreferrer">Hubungi admin {divisionIdentity[division.slug].admins[0].name} ↗</a></div></div></div></article>)}
    </section><SocialProof content={content} />
  </div>;
}
