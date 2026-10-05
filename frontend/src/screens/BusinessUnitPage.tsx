import Image from "next/image";
import Link from "next/link";
import ContactDirectory from "../components/ContactDirectory";
import { internationalPhone, type TeamContact } from "../data/siteContent";
import { divisions, type Division } from "../data/divisionContent";

export default function BusinessUnitPage({ division, contacts }: { division: Division; contacts: TeamContact[] }) {
  const base = `/unit/${division.slug}`;
  const serviceHref = `${base}/${division.slug.startsWith("retail") ? "produk" : "layanan"}`;
  const contact = contacts.find(c => c.published && c.whatsapp && c.divisions.includes(division.slug))
    ?? contacts.find(c => c.published && c.whatsapp && !c.divisions.length);
  const whatsapp = `https://wa.me/${internationalPhone(contact?.whatsapp || "081218052017")}?text=${encodeURIComponent(`Halo ${contact?.name || "Mahameru Baja"}, saya ingin bertanya tentang ${division.name} (${division.label}).`)}`;
  return <div className="division-page">
    <section className="division-hero" aria-labelledby="division-title">
      <div className="division-hero-image" data-parallax="0.3"><Image src={division.hero} alt="" fill priority sizes="100vw" /></div>
      <div className="division-hero-overlay" />
      <div className="industrial-container division-hero-content">
        <nav className="division-breadcrumb" aria-label="Jejak halaman"><Link href="/">Beranda</Link><span>/</span><Link href="/divisi">Divisi</Link><span>/</span><span>{division.name}</span></nav>
        <p className="industrial-eyebrow" data-reveal>{division.label} / {division.area}</p>
        <h1 id="division-title" data-reveal>{division.title}</h1>
        <p data-reveal>{division.intro}</p>
        <div className="division-actions" data-reveal><Link className="industrial-button" href={serviceHref}>{division.slug.startsWith("retail") ? "Jelajahi produk" : "Jelajahi layanan"} ↗</Link><a className="industrial-button outline" href={whatsapp} target="_blank" rel="noopener noreferrer">Chat tim ↗</a></div>
      </div>
      <span className="division-hero-index" aria-hidden="true">0{divisions.findIndex((item) => item.slug === division.slug) + 1} / 04</span>
    </section>


    <section className="division-intro-section" id="profil"><div className="industrial-container division-intro-grid"><div data-reveal><p className="industrial-eyebrow">MENGENAL DIVISI</p><h2>{division.name}</h2></div><p data-reveal>{division.description}</p></div></section>

    <section className="division-services-section" id="layanan-unit"><div className="industrial-container">
      <div className="division-section-heading" data-reveal><p className="industrial-eyebrow">01 / LAYANAN & PRODUK</p><h2>Mulai dari kebutuhan Anda.</h2><p>Pilih jalur yang sesuai, lalu kirim spesifikasi untuk ditinjau tim.</p></div>
      <div className="division-offerings">{division.offerings.map((offering, index) => <article key={offering} data-reveal><div className="division-offering-image"><Image src={division.images[index % division.images.length].src} alt="" fill sizes="(max-width: 650px) 50vw, 25vw" /></div><span>0{index + 1}</span><h3>{offering}</h3><Link href={`${base}/kontak`}>Konsultasikan <span aria-hidden="true">↗</span></Link></article>)}</div>
    </div></section>

    <section className="division-gallery-section" id="galeri-unit" aria-label={`Galeri ${division.name}`}><div className="industrial-container"><div className="division-section-heading" data-reveal><p className="industrial-eyebrow">02 / MATERIAL & PROSES</p><h2>Lihat lebih dekat.</h2><Link href={`${base}/galeri`}>Buka galeri divisi ?</Link></div></div><div className="division-gallery">{division.images.map((item) => <figure key={item.src} data-reveal><div data-parallax="0.1"><Image src={item.src} alt={item.title} fill sizes="(max-width: 700px) 100vw, 33vw" /></div><figcaption>{item.title}</figcaption></figure>)}</div></section>

    <section className="division-photo-story"><div className="division-story-media" data-parallax="0.24"><Image src={division.hero} alt="" fill sizes="100vw" /></div><div className="industrial-container"><p className="industrial-eyebrow" data-reveal>{division.area}</p><h2 data-reveal>{division.slug === "laser-cutting" ? <>Presisi pada proses.<br /><em>Detail pada hasil.</em></> : division.slug === "trading-proyek" ? <>Dari daftar kebutuhan.<br /><em>Menuju lokasi proyek.</em></> : <>Pilihan material.<br /><em>Untuk rencana besar Anda.</em></>}</h2><Link className="industrial-button" href={`${base}/kontak`}>Mulai konsultasi ?</Link></div></section>
    <section className="division-process-section"><div className="industrial-container division-process-grid"><div data-reveal><p className="industrial-eyebrow">03 / CARA KERJA</p><h2>Tiga langkah<br />untuk memulai.</h2><p>Informasi yang lengkap membantu tim menindaklanjuti permintaan Anda lebih cepat.</p></div><ol>{division.process.map((step, index) => <li key={step} data-reveal><span>0{index + 1}</span><div><svg className="division-step-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{index === 0 ? <><path d="M12 6h18l7 7v29H12zM30 6v9h7M18 23h13M18 29h13M18 35h8" /></> : index === 1 ? <><path d="M8 11h32v24H8zM8 19h32M16 11v24M32 11v24M20 25l4 4 7-8" /></> : <><path d="M5 16h25v20H5zM30 24h8l6 7v5H30M10 16V9h15v7" /><circle cx="14" cy="37" r="4" /><circle cx="36" cy="37" r="4" /></>}</svg><h3>{step}</h3></div></li>)}</ol></div></section>

    <section className="division-faq-section"><div className="industrial-container division-faq-grid"><div data-reveal><p className="industrial-eyebrow">04 / PERTANYAAN</p><h2>Yang sering ditanyakan.</h2></div><div>{division.faq.map((item) => <details key={item.question} data-reveal><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>

    <ContactDirectory contacts={contacts} divisionSlug={division.slug} />
    <section className="division-end-section"><div className="industrial-container division-end-grid" data-reveal><div><p className="industrial-eyebrow">LANJUTKAN PERMINTAAN</p><h2>Siapkan daftar atau gambar. Kami bantu arahkan.</h2></div><div className="division-actions"><Link className="industrial-button" href={`${base}/kontak`}>Minta penawaran ↗</Link><a className="industrial-button outline" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div></div></section>
    <nav className="industrial-container division-next" aria-label="Divisi lainnya"><strong>Satu ekosistem Mahameru Baja</strong><Link href="/divisi" className="division-switch">Jelajahi divisi lainnya ?</Link></nav>
  </div>;
}
