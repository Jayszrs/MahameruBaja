"use client";
import { useDivisionDirectory } from "../components/DivisionDirectory";
import Image from "../components/CmsImage";
import Link from "next/link";

import { groupVision } from "../data/companyIdentity";
import { reviewContent, type SiteContent } from "../data/siteContent";
import SocialProof from "../components/SocialProof";
import DivisionCollage from "../components/DivisionCollage";
import PublicText from "../components/PublicText";
import { appearanceForSite } from "../data/websiteAppearance";
import RotatingHeroMedia from "../components/RotatingHeroMedia";
import { partnerLogosForSite } from "../data/partnerLogos";

export default function AboutMergedPage({ content }: { content: SiteContent }) {
  const appearance=appearanceForSite(content.websiteAppearance);
  const { divisions, divisionIdentity, divisionWhatsApp } = useDivisionDirectory();
  return <PublicText><div className="company-about">
    <section className="company-about-hero">
      <RotatingHeroMedia className="company-about-background" images={appearance.aboutHeroImage ? [appearance.aboutHeroImage] : ["/images/steel-indonesia/toko-mahameru.jpg", "/images/laser-cutting-illustration.jpg", "/images/cnc-bending-visual-v1.png"]} />
      <div className="home-shell"><nav aria-label="Breadcrumb"><Link href="/">Beranda</Link><span>/ Tentang Kami</span></nav><p className="industrial-eyebrow">MAHAMERU GROUP / BEKASI</p><h1>Dari material<br />hingga <em>hasil kerja.</em></h1><p>Segala kebutuhan baja dalam satu tempat: material, pengadaan proyek, laser cutting, bending, fabrikasi, dan erection.</p><a href="#divisi" className="home-button home-button-primary">Kenali divisi kami ↗</a></div>
    </section>
    <section className="company-vision home-shell" aria-labelledby="vision-heading"><p className="industrial-eyebrow">VISI MAHAMERU GROUP</p><h2 id="vision-heading">Tumbuh bersama kebutuhan<br /><em>industri dan konstruksi.</em></h2><p>{groupVision}</p></section>
    <section className="home-section about-engineering"><div className="home-shell"><p className="industrial-eyebrow">GAMBAR / PERHITUNGAN / PENGERJAAN</p><h2>Mulai dari gambar,<br />sampai rencana pengerjaan.</h2><p>Diskusikan gambar kerja, kebutuhan material, dan RAB bersama tim. Kami membantu meninjau kebutuhan sebelum menyepakati ruang lingkup, biaya, serta jadwal.</p><div className="about-engineering-points"><div><span>01</span><h3>Review gambar kerja</h3><p>Bahas ukuran, sambungan, dan detail yang diperlukan.</p></div><div><span>02</span><h3>Kebutuhan & RAB</h3><p>Siapkan daftar kebutuhan dan bahas perhitungan biayanya.</p></div><div><span>03</span><h3>Fabrikasi & erection</h3><p>Koordinasikan produksi, finishing, dan pemasangan di lokasi.</p></div></div><Link href="/unit/fabrikasi-erection/kontak" className="home-button home-button-primary">Diskusikan gambar proyek ↗</Link></div></section>
    <section id="divisi" className="company-divisions home-shell" aria-labelledby="division-heading"><div className="company-divisions-heading"><p className="industrial-eyebrow">JARINGAN MAHAMERU GROUP</p><h2 id="division-heading">Tim yang tepat untuk<br />setiap kebutuhan.</h2><p>Mulai dari pembelian material untuk toko dan proyek hingga pengerjaan baja sesuai gambar kerja. Kenali layanan setiap divisi dan hubungi admin untuk membicarakan kebutuhan Anda.</p></div>
      {divisions.map((division, index) => <article key={division.slug} className="company-division" data-reveal><div className="company-division-top"><span>0{index + 1} / {division.label}</span><Image src={divisionIdentity[division.slug].logo} alt={`Logo ${division.name}`} width={180} height={140} /></div><div className="company-division-main"><DivisionCollage division={division} index={index} projects={content.galleryProjects.filter(p => p.published && p.division === division.slug)} /><div className="company-division-copy"><h3>{division.name}</h3><p>{division.description}</p><div className="company-division-mission"><h4>Misi divisi</h4><p>{divisionIdentity[division.slug].mission}</p></div><div className="company-division-actions"><Link href={`/unit/${division.slug}`}>Buka website divisi ↗</Link><a href={divisionWhatsApp(division.slug)} target="_blank" rel="noopener noreferrer">Hubungi admin {divisionIdentity[division.slug].admins[0]?.name || "tim"} ↗</a></div></div></div></article>)}
    </section><SocialProof content={reviewContent(content)} partnerLogos={partnerLogosForSite(content.partnerLogos)} />
  </div></PublicText>;
}
