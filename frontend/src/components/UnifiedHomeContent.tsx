import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HeroCarousel from "./HeroCarousel";
import Promotions from "./Promotions";
import SocialProof from "./SocialProof";
import SocialHub from "./SocialHub";
import ContactDirectory from "./ContactDirectory";
import DivisionCollage from "./DivisionCollage";
import ProjectAlbums from "./ProjectAlbums";
import { divisions, type Division } from "../data/divisionContent";
import { accountDivisionSlugs } from "../data/socialMedia";
import { divisionIdentity, divisionWhatsApp, groupVision, groupMotto, mainLogo } from "../data/companyIdentity";
import { garudaLocation } from "../data/divisionLocations";
import { internationalPhone, reviewContent, type SiteContent } from "../data/siteContent";
import type { HeroSlide } from "../data/heroSlides";

function divisionSlides(division: Division): HeroSlide[] {
  const base = `/unit/${division.slug}`;
  const retail = division.slug.startsWith("retail");
  return [division.hero, ...division.images.map(image => image.src)].filter((src, i, all) => all.indexOf(src) === i).slice(0, 3).map((media, i) => ({
    id: `${division.slug}-${i}`, type: "image", media, alt: division.name,
    eyebrow: `${division.label} / ${division.area}`,
    title: i === 0 ? division.name : i === 1 ? "Untuk kebutuhan Anda." : "Mulai dari konsultasi.",
    accent: i === 0 ? retail ? "Material untuk setiap rencana." : "Dari kebutuhan hingga pengerjaan." : i === 1 ? division.offerings[0] : "Hubungi tim divisi kami.",
    description: i === 0 ? division.intro : division.description,
    primaryAction: { label: retail ? "Jelajahi produk" : "Jelajahi layanan", href: `${base}/${retail ? "produk" : "layanan"}` },
    secondaryAction: { label: "Hubungi admin", href: `${base}/kontak` },
    visualNote: /illustration|visual|hero-steel/.test(media) ? "Visual ilustrasi" : "Foto material Mahameru",
  }));
}

export default function UnifiedHomeContent({ content, division, children }: { content: SiteContent; division?: Division; children: ReactNode }) {
  const name = division?.name || "Mahameru Baja Indonesia";
  const base = division ? `/unit/${division.slug}` : "";
  const contactHref = `${base}/kontak`;
  const quote = division ? `/minta-penawaran?unit=${division.slug}` : "/minta-penawaran";
  const retail = division?.slug.startsWith("retail");
  const serviceHref = division ? `${base}/${retail ? "produk" : "layanan"}` : "/jasa";
  const garuda = division?.slug === "retail-cibitung";
  const reviews = garuda ? { ...content, ...content.garudaReviews } : content;
  const mapsUrl = garuda ? garudaLocation.mapsUrl : content.mapsUrl;
  const mapEmbed = garuda ? garudaLocation.embedUrl : "https://www.google.com/maps?q=Toko%20Besi%20Mahameru%20Baja%20Tambun%20Selatan&output=embed";
  const address = garuda ? garudaLocation.address : "Jl. Permata Regensi Blok K1 No. 38–39, Tambun Selatan, Kabupaten Bekasi 17510";
  const team = content.contacts.find(c => c.published && c.whatsapp && c.divisions.includes(division?.slug || "laser-cutting")) ?? content.contacts.find(c => c.published && c.whatsapp && !c.divisions.length);
  const wa = team ? `https://wa.me/${internationalPhone(team.whatsapp)}` : divisionWhatsApp(division?.slug || "laser-cutting");
  const accounts = division ? content.socialAccounts.filter(account => !accountDivisionSlugs(account).length || accountDivisionSlugs(account).includes(division.slug)) : content.socialAccounts;
  const posts = division ? content.socialPosts.filter(post => post.division === division.slug) : content.socialPosts;
  // Only show banners addressed to this division. Never relabel a different
  // division's offer or silently invent a promotion to fill the layout.
  const promos = division ? content.promotions.filter(promo => promo.ctaHref === base || promo.ctaHref.startsWith(`${base}/`)) : content.promotions;
  const offerings = division ? division.offerings.map((title, i) => ({ title, image: division.images[i % division.images.length].src, href: contactHref })) : divisions.map(d => ({ title: d.name, image: d.hero, href: `/unit/${d.slug}` }));
  const featured = division || divisions.find(d => d.slug === "laser-cutting")!;
  const introTitle = division ? division.title : "Dari material. Sampai hasil kerja.";
  const flow = division ? division.process.map((title, i) => ({ title, text: i === 0 ? division.intro : i === 1 ? "Tim meninjau spesifikasi dan kebutuhan Anda sebelum menyiapkan penawaran." : "Pesanan atau pekerjaan berjalan sesuai ruang lingkup dan jadwal yang disepakati." })) : [
    { title: "Pilih divisi yang sesuai", text: "Retail Tambun, Retail Cibitung, trading, laser cutting & bending, atau fabrikasi & erection." },
    { title: "Kirim kebutuhan", text: "Cantumkan material atau gambar, ukuran, jumlah, lokasi, dan target waktu." },
    { title: "Setujui penawaran", text: "Tim mengonfirmasi harga, ketersediaan, jadwal, dan ketentuan sebelum pesanan diproses." },
    { title: "Terima barang atau hasil kerja", text: "Pengiriman atau penyelesaian pekerjaan mengikuti jadwal yang disepakati." },
  ];
  const faq = division?.faq || [
    { question: "Bagaimana memilih divisi yang tepat?", answer: "Pilih retail untuk kebutuhan material toko, trading untuk pengadaan proyek, laser cutting & bending untuk pengolahan plat, atau fabrikasi & erection untuk pekerjaan struktur dan pemasangan." },
    { question: "Apakah stok dan harga perlu dikonfirmasi?", answer: "Ya. Tim divisi mengonfirmasi ketersediaan, spesifikasi, harga, dan jadwal sebelum pemesanan." },
  ];

  return <div className="unified-home" data-home-template="mahameru" data-home-division={division?.slug || "main"}>
    <HeroCarousel slides={division ? divisionSlides(division) : content.heroSlides} rating={reviews.rating} ratingDate={reviews.ratingDate} mapsUrl={mapsUrl} companyName={name} ratingSourceName={garuda ? name : "Mahameru Baja"} serviceItems={division?.offerings.slice(0, 4)} area={division?.area} servicesLabel={division?.label} />
    <div data-home-section="promotions">{promos.some(p => p.published) ? <Promotions promotions={promos} /> : <section className="home-promos home-promo-empty"><div className="home-shell"><p className="industrial-eyebrow">PROMO & KEGIATAN / {name}</p><h2>Kabar berikutnya<br />dari tim kami.</h2><p>Informasi promo divisi akan ditampilkan setelah diterbitkan. Untuk kebutuhan saat ini, hubungi tim kami.</p><Link href={contactHref}>Tanyakan kebutuhan Anda ↗</Link></div></section>}</div>
    <section className="home-section home-intro" data-home-section="intro" id="profil"><div className="home-shell company-division-main"><DivisionCollage division={featured} index={Math.max(0, divisions.findIndex(d => d.slug === featured.slug))} projects={content.galleryProjects.filter(p => p.published && p.division === featured.slug)} /><div className="home-intro-copy" data-reveal><p className="home-eyebrow text-brand"><span />{division ? division.label : "SATU EKOSISTEM MAHAMERU"}</p><h2>{introTitle}</h2><p>{division?.description || groupMotto}</p><div className="home-vision"><h3>VISI MAHAMERU GROUP</h3><p>{groupVision}</p><h3>{division ? "MISI DIVISI" : "LIMA DIVISI / SATU SOLUSI"}</h3><p>{division ? divisionIdentity[division.slug].mission : "Retail, pengadaan material, laser cutting, bending, fabrikasi, dan erection. Pilih tim yang sesuai dengan kebutuhan Anda."}</p></div><Link className="home-button home-button-primary" href={division ? `${base}/tentang` : "/tentang-kami"}>Kenali {division ? "divisi kami" : "Mahameru"} ↗</Link></div></div></section>
    {division &&     <section className="home-section home-services" id="layanan-unit" data-home-section="offerings"><div className="home-shell"><div className="home-section-heading" data-reveal><div><p className="home-eyebrow text-brand"><span />{division ? division.label : "LIMA JALUR LAYANAN"}</p><h2>Mulai dari<br /><em>kebutuhan Anda.</em></h2></div><p>{division?.intro || "Pilih material, suplai proyek, atau pekerjaan custom. Kami arahkan ke tim yang tepat."}</p></div><div className="home-offering-ribbon" tabIndex={0} aria-label="Pilihan layanan, geser untuk melihat lainnya">{offerings.map((item, i) => <Link className="home-offering-card" href={item.href} key={item.title}><div><Image src={item.image} alt="" fill sizes="(max-width: 650px) 75vw, 300px" /></div><small>{String(i + 1).padStart(2, "0")}</small><h3>{item.title}</h3><span>{division ? "Konsultasikan" : "Buka website divisi"} ↗</span></Link>)}</div></div></section>}
    <section className="home-laser" data-home-section="feature"><div className="home-laser-media" data-parallax="0.15"><Image src={division?.hero || "/images/cnc-bending-visual-v1.png"} alt="" fill sizes="100vw" /></div><div className="home-laser-shade" /><div className="home-shell home-laser-content" data-reveal><p className="home-eyebrow">{division?.label || "LASER CUTTING & CNC BENDING"}</p><h2>{division ? division.title : "Butuh plat dipotong atau ditekuk sesuai gambar?"}</h2><p>{division?.intro || "Kirim gambar DWG, DXF, atau PDF beserta jenis material, ketebalan, ukuran, dan jumlah. Tim meninjau proses sebelum memberi penawaran."}</p><div className="home-process-line">{(division?.offerings.slice(0, 6) || ["Siapkan desain", "Review", "Penawaran", "Cutting", "Bending", "QC"]).map((step, i) => <div key={step}><span>{String(i + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}</div><div className="home-actions"><Link href={quote} className="home-button home-button-primary">Kirim kebutuhan Anda</Link><Link href={serviceHref} className="home-button home-button-ghost">{retail ? "Lihat pilihan material" : "Kenali layanan kami"}</Link></div></div></section>
    <section className="home-section home-order" id="cara-pesan" data-home-section="order"><div className="home-shell"><div className="home-order-heading" data-reveal><h2>Cara pesan di {name}</h2></div><ol className="home-order-steps">{flow.map((step, i) => <li key={step.title} data-reveal><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p><Link href={i === 0 ? serviceHref : quote}>Mulai di sini ↗</Link></div></li>)}</ol><div className="home-order-help"><div className="home-order-card" data-reveal><h3>Sudah punya daftar atau gambar?</h3><p>Kirim spesifikasi dan jumlah agar tim dapat menyiapkan tindak lanjut.</p><Link href={quote} className="home-button home-button-primary">Kirim permintaan penawaran</Link></div><div className="home-order-card" data-reveal><h3>Masih ingin berdiskusi?</h3><p>Ceritakan rencana Anda. Kami bantu mengecek kebutuhan sebelum pemesanan.</p><a className="home-button home-button-primary" href={wa} target="_blank" rel="noopener noreferrer">Tanya lewat WhatsApp</a></div></div></div></section>
    <section className="division-faq-section" data-home-section="faq"><div className="home-shell division-faq-grid"><div data-reveal><p className="industrial-eyebrow">PERTANYAAN / {name}</p><h2>Yang sering ditanyakan.</h2></div><div>{faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>
    <div data-home-section="proof"><SocialProof content={reviewContent(reviews)} companyName={garuda ? name : "Mahameru Baja"} includeImported={!garuda} /></div>
    <div id="galeri-unit" data-home-section="gallery"><ProjectAlbums projects={content.galleryProjects.filter(p => p.published && p.photos.length && (!division || p.division === division.slug))} layout="ribbon" galleryHref={division ? `${base}/galeri` : "/proyek"} /></div>
    <div data-home-section="social"><SocialHub accounts={accounts} posts={posts} companyName={name} moreHref={division ? `/sosial-media?divisi=${division.slug}` : "/sosial-media"} /></div>
    <div data-home-section="team"><ContactDirectory contacts={content.contacts} divisionSlug={division?.slug} /></div>
    <section className="home-section home-location" data-home-section="location"><div className="home-shell home-location-grid"><div className="home-location-copy" data-reveal><p className="home-eyebrow text-brand"><span />LOKASI / {name}</p><h2 id="location-heading">Dekat.<br /><em>Siap melayani Anda.</em></h2><p>{division?.intro || "Kunjungi tim kami untuk kebutuhan material dan pekerjaan baja."}</p><address>{address}</address><p>{garuda ? "Konfirmasikan jam kunjungan dengan admin Garuda." : "Senin–Sabtu · 07.00–17.00 WIB"}</p><div className="home-actions"><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="home-button home-button-dark">Buka Google Maps ↗</a></div></div><div className="home-map"><div className="home-map-heading"><span>Kunjungi kami</span><strong>{garuda ? name : "Mahameru / Tambun"}</strong><a href={mapsUrl} target="_blank" rel="noopener noreferrer">Petunjuk arah ↗</a></div><div className="home-map-canvas"><iframe title={`Lokasi ${name}`} src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div><div className="home-map-caption"><span>Area layanan</span><strong>{division?.area || "Tambun · Cibitung · Bekasi dan sekitarnya"}</strong></div></div></div></section>
    <section className="home-final" data-home-section="callout"><div className="home-shell" data-reveal><Image src={division ? divisionIdentity[division.slug].logo : mainLogo} alt={name} width={160} height={130} /><h2>{retail ? "Siap kirim daftar material?" : "Siap diskusikan kebutuhan atau gambar kerja?"}</h2><p>Hubungi tim {name} untuk mengecek kebutuhan dan mendapatkan penawaran.</p><div className="home-actions"><Link href={quote} className="home-button home-button-primary">Minta penawaran</Link><a href={wa} className="home-button home-button-whatsapp" target="_blank" rel="noopener noreferrer">Chat WhatsApp</a></div></div></section>
    <div data-home-section="divisions">{children}</div>
  </div>;
}
