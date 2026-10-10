import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "../components/HeroCarousel";
import DivisionVision from "../components/DivisionVision";
import SocialProof from "../components/SocialProof";
import type { HeroSlide } from "../data/heroSlides";
import ContactDirectory from "../components/ContactDirectory";
import DivisionLocation from "../components/DivisionLocation";
import { internationalPhone, type TeamContact, type SiteContent } from "../data/siteContent";
import { divisions, type Division } from "../data/divisionContent";

export default function BusinessUnitPage({ division, contacts, content }: { division: Division; contacts: TeamContact[]; content: SiteContent }) {
  const base = `/unit/${division.slug}`;
  const serviceHref = `${base}/${division.slug.startsWith("retail") ? "produk" : "layanan"}`;
  const contact = contacts.find(c => c.published && c.whatsapp && c.divisions.includes(division.slug))
    ?? contacts.find(c => c.published && c.whatsapp && !c.divisions.length);
  const whatsapp = `https://wa.me/${internationalPhone(contact?.whatsapp || "081218052017")}?text=${encodeURIComponent(`Halo ${contact?.name || "Mahameru Baja"}, saya ingin bertanya tentang ${division.name} (${division.label}).`)}`;
  const reviewContent = division.slug === "retail-cibitung" ? { ...content, ...content.garudaReviews } : content;
  const slides: HeroSlide[] = [division.hero, ...division.images.map(image => image.src)].filter((src, i, all) => all.indexOf(src) === i).slice(0, 3).map((media, i) => ({
    id: `${division.slug}-${i}`, type: "image", media, alt: division.name,
    eyebrow: `${division.label} / ${division.area}`,
    title: i === 0 ? division.name : i === 1 ? "Untuk kebutuhan Anda." : "Mulai dari konsultasi.",
    accent: i === 0 ? division.slug.startsWith("retail") ? "Material untuk setiap rencana." : "Dari kebutuhan hingga pengerjaan." : i === 1 ? division.offerings[0] : "Hubungi tim divisi kami.",
    description: i === 0 ? division.intro : i === 1 ? division.description : "Kirim daftar material atau gambar kerja. Admin membantu mengecek spesifikasi, ketersediaan, harga, dan jadwal sesuai kebutuhan Anda.",
    primaryAction: {label: division.slug.startsWith("retail") ? "Jelajahi produk" : "Jelajahi layanan", href: serviceHref},
    secondaryAction: {label: "Hubungi admin", href: `${base}/kontak`},
    visualNote: media.includes("illustration") || media.includes("visual") || media.includes("hero-steel") ? "Visual ilustrasi" : "Foto material Mahameru",
  }));
  return <div className="division-page">
    <HeroCarousel slides={slides} rating={reviewContent.rating} ratingDate={reviewContent.ratingDate} mapsUrl={reviewContent.mapsUrl} companyName={division.name} ratingSourceName={division.slug === "retail-cibitung" ? division.name : "Mahameru Baja"} serviceItems={division.offerings.slice(0, 4)} area={division.area} servicesLabel={division.label} />


    <section className="division-intro-section" id="profil"><div className="industrial-container division-intro-grid"><div data-reveal><p className="industrial-eyebrow">MENGENAL DIVISI</p><h2>{division.name}</h2></div><p data-reveal>{division.description}</p></div></section>

    <DivisionVision slug={division.slug} />
    <section className="division-services-section" id="layanan-unit"><div className="industrial-container">
      <div className="division-section-heading" data-reveal><p className="industrial-eyebrow">01 / LAYANAN & PRODUK</p><h2>Mulai dari kebutuhan Anda.</h2><p>Pilih jalur yang sesuai, lalu kirim spesifikasi untuk ditinjau tim.</p></div>
      <div className="division-offerings">{division.offerings.map((offering, index) => <article key={offering} data-reveal><div className="division-offering-image"><Image src={division.images[index % division.images.length].src} alt="" fill sizes="(max-width: 650px) 50vw, 25vw" /></div><span>0{index + 1}</span><h3>{offering}</h3><Link href={`${base}/kontak`}>Konsultasikan <span aria-hidden="true">↗</span></Link></article>)}</div>
    </div></section>
    {division.slug === "retail-cibitung" && <SocialProof content={reviewContent} companyName={division.name} includeImported={false} reviewsOnly />}

    <section className="division-gallery-section" id="galeri-unit" aria-label={`Galeri ${division.name}`}><div className="industrial-container"><div className="division-section-heading" data-reveal><p className="industrial-eyebrow">02 / MATERIAL & PROSES</p><h2>Lihat lebih dekat.</h2><Link href={`${base}/galeri`}>Buka galeri divisi &#8599;</Link></div></div><div className="division-gallery">{division.images.map((item) => <figure key={item.src} data-reveal><div data-parallax="0.1"><Image src={item.src} alt={item.title} fill sizes="(max-width: 700px) 100vw, 33vw" /></div><figcaption>{item.title}</figcaption></figure>)}</div></section>

    <section className="division-photo-story"><div className="division-story-media" data-parallax="0.24"><Image src={division.hero} alt="" fill sizes="100vw" /></div><div className="industrial-container"><p className="industrial-eyebrow" data-reveal>{division.area}</p><h2 data-reveal>{division.slug === "laser-cutting" ? <>Presisi pada proses.<br /><em>Detail pada hasil.</em></> : division.slug === "trading-proyek" ? <>Dari daftar kebutuhan.<br /><em>Menuju lokasi proyek.</em></> : <>Pilihan material.<br /><em>Untuk rencana besar Anda.</em></>}</h2><Link className="industrial-button" href={`${base}/kontak`}>Mulai konsultasi &#8599;</Link></div></section>
    <section className="division-process-section"><div className="industrial-container division-process-grid"><div data-reveal><p className="industrial-eyebrow">03 / CARA KERJA</p><h2>Tiga langkah<br />untuk memulai.</h2><p>Informasi yang lengkap membantu tim menindaklanjuti permintaan Anda lebih cepat.</p></div><ol>{division.process.map((step, index) => <li key={step} data-reveal><span>0{index + 1}</span><div><svg className="division-step-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{index === 0 ? <><path d="M12 6h18l7 7v29H12zM30 6v9h7M18 23h13M18 29h13M18 35h8" /></> : index === 1 ? <><path d="M8 11h32v24H8zM8 19h32M16 11v24M32 11v24M20 25l4 4 7-8" /></> : <><path d="M5 16h25v20H5zM30 24h8l6 7v5H30M10 16V9h15v7" /><circle cx="14" cy="37" r="4" /><circle cx="36" cy="37" r="4" /></>}</svg><h3>{step}</h3></div></li>)}</ol></div></section>

    <section className="division-faq-section"><div className="industrial-container division-faq-grid"><div data-reveal><p className="industrial-eyebrow">04 / PERTANYAAN</p><h2>Yang sering ditanyakan.</h2></div><div>{division.faq.map((item) => <details key={item.question} data-reveal><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>

    <ContactDirectory contacts={contacts} divisionSlug={division.slug} />
    <DivisionLocation slug={division.slug} />
    {division.slug !== "retail-cibitung" && <SocialProof content={reviewContent} companyName="Mahameru Baja" reviewsOnly />}
    <section className="division-end-section"><div className="industrial-container division-end-grid" data-reveal><div><p className="industrial-eyebrow">LANJUTKAN PERMINTAAN</p><h2>Siapkan daftar atau gambar. Kami bantu arahkan.</h2></div><div className="division-actions"><Link className="industrial-button" href={`${base}/kontak`}>Minta penawaran ↗</Link><a className="industrial-button outline" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div></div></section>
    <nav className="industrial-container division-next" aria-label="Divisi lainnya"><strong>Satu ekosistem Mahameru Baja</strong><Link href="/tentang-kami#divisi" className="division-switch">Jelajahi divisi lainnya &#8599;</Link></nav>
  </div>;
}
