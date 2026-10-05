import Image from "next/image";
import Link from "next/link";
import { divisions, type Division } from "../data/divisionContent";

export default function BusinessUnitPage({ division }: { division: Division }) {
  const whatsapp = `https://wa.me/6281218052017?text=${encodeURIComponent(`Halo Mahameru Baja, saya ingin bertanya tentang ${division.name} (${division.label}).`)}`;
  return <div className="division-page">
    <section className="division-hero" aria-labelledby="division-title">
      <div className="division-hero-image" data-parallax="0.22"><Image src={division.hero} alt="" fill priority sizes="100vw" /></div>
      <div className="division-hero-overlay" />
      <div className="industrial-container division-hero-content">
        <nav className="division-breadcrumb" aria-label="Jejak halaman"><Link href="/">Beranda</Link><span>/</span><Link href="/divisi">Divisi</Link><span>/</span><span>{division.name}</span></nav>
        <p className="industrial-eyebrow" data-reveal>{division.label} / {division.area}</p>
        <h1 id="division-title" data-reveal>{division.title}</h1>
        <p data-reveal>{division.intro}</p>
        <div className="division-actions" data-reveal><Link className="industrial-button" href={division.primary.href}>{division.primary.label} ↗</Link><a className="industrial-button outline" href={whatsapp} target="_blank" rel="noopener noreferrer">Chat tim ↗</a></div>
      </div>
      <span className="division-hero-index" aria-hidden="true">0{divisions.findIndex((item) => item.slug === division.slug) + 1} / 04</span>
    </section>

    <section className="division-intro-section"><div className="industrial-container division-intro-grid"><div data-reveal><p className="industrial-eyebrow">MENGENAL DIVISI</p><h2>{division.name}</h2></div><p data-reveal>{division.description}</p></div></section>

    <section className="division-services-section"><div className="industrial-container">
      <div className="division-section-heading" data-reveal><p className="industrial-eyebrow">01 / LAYANAN & PRODUK</p><h2>Mulai dari kebutuhan Anda.</h2><p>Pilih jalur yang sesuai, lalu kirim spesifikasi untuk ditinjau tim.</p></div>
      <div className="division-offerings">{division.offerings.map((offering, index) => <article key={offering} data-reveal><span>0{index + 1}</span><h3>{offering}</h3><Link href={division.quote}>Konsultasikan <span aria-hidden="true">↗</span></Link></article>)}</div>
    </div></section>

    <section className="division-gallery-section" aria-label={`Galeri ${division.name}`}><div className="industrial-container"><div className="division-section-heading" data-reveal><p className="industrial-eyebrow">02 / MATERIAL & PROSES</p><h2>Lihat lebih dekat.</h2></div></div><div className="division-gallery">{division.images.map((item) => <figure key={item.src} data-reveal><div data-parallax="0.1"><Image src={item.src} alt={item.title} fill sizes="(max-width: 700px) 100vw, 33vw" /></div><figcaption>{item.title}</figcaption></figure>)}</div></section>

    <section className="division-process-section"><div className="industrial-container division-process-grid"><div data-reveal><p className="industrial-eyebrow">03 / CARA KERJA</p><h2>Tiga langkah<br />untuk memulai.</h2><p>Informasi yang lengkap membantu tim menindaklanjuti permintaan Anda lebih cepat.</p></div><ol>{division.process.map((step, index) => <li key={step} data-reveal><span>0{index + 1}</span><h3>{step}</h3></li>)}</ol></div></section>

    <section className="division-faq-section"><div className="industrial-container division-faq-grid"><div data-reveal><p className="industrial-eyebrow">04 / PERTANYAAN</p><h2>Yang sering ditanyakan.</h2></div><div>{division.faq.map((item) => <details key={item.question} data-reveal><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>

    <section className="division-end-section"><div className="industrial-container division-end-grid" data-reveal><div><p className="industrial-eyebrow">LANJUTKAN PERMINTAAN</p><h2>Siapkan daftar atau gambar. Kami bantu arahkan.</h2></div><div className="division-actions"><Link className="industrial-button" href={division.quote}>Minta penawaran ↗</Link><a className="industrial-button outline" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div></div></section>
    <nav className="industrial-container division-next" aria-label="Divisi lainnya"><strong>Jelajahi divisi lain</strong><div>{divisions.filter((item) => item.slug !== division.slug).map((item) => <Link key={item.slug} href={`/unit/${item.slug}`} prefetch>{item.name} <span aria-hidden="true">↗</span></Link>)}</div></nav>
  </div>;
}
