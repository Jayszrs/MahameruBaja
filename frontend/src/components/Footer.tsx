import Image from "next/image";
import Link from "next/link";
import { divisions } from "../data/divisionContent";
import { mainLogo, groupMotto, divisionWhatsApp, divisionIdentity } from "../data/companyIdentity";

import type { Division } from "../data/divisionContent";
import { divisionNavigation } from "./DivisionChrome";
import { garudaLocation } from "../data/divisionLocations";

export default function Footer({ division }: { division?: Division }) {
  const base = division ? `/unit/${division.slug}` : "/";
  const contactHref = division ? `${base}/kontak` : "/kontak";
  const name = division?.name || "MBI Laser Cutting";
  const logo = division ? divisionIdentity[division.slug].logo : mainLogo;
  const quote = division?.quote || "/minta-penawaran";
  const adminSlug = division?.slug || "laser-cutting";
  return <footer className="company-footer"><div className="home-shell">
    <section className="company-footer-cta"><div><p className="industrial-eyebrow">MATERIAL & JASA BAJA</p><h2>{division ? <>Bicarakan kebutuhan<br />{division.label.toLowerCase()} Anda.</> : <>Butuh material atau<br />jasa laser cutting?</>}</h2><p>Sampaikan kebutuhan Anda. Tim kami membantu mengecek spesifikasi, menyiapkan penawaran, dan mengatur langkah berikutnya.</p></div><div><Link className="home-button home-button-primary" href={quote}>Minta penawaran ↗</Link><a className="footer-contact-link" href={divisionWhatsApp(adminSlug)} target="_blank" rel="noopener noreferrer">Hubungi admin divisi ↗</a></div></section>
    <div className="company-footer-grid"><div className="company-footer-brand"><Link href={base}><Image src={logo} alt={name} width={170} height={140} /></Link><p>{division?.intro || groupMotto}</p><address>{division?.slug === "retail-cibitung" ? garudaLocation.address : <>Jl. Permata Regensi Blok K1 No. 38–39,<br />Tambun Selatan, Kabupaten Bekasi 17510</>}</address><p>{division?.slug === "retail-cibitung" ? "Jam kunjungan: konfirmasi dengan admin" : "Senin–Sabtu · 07.00–17.00 WIB"}</p><Link href={contactHref}>Lokasi & kontak admin ↗</Link></div>
    <nav aria-label="Website divisi"><h3>Website divisi</h3>{divisions.map(division => <Link key={division.slug} href={`/unit/${division.slug}`}>{division.name} ↗</Link>)}</nav>
    <nav aria-label="Navigasi perusahaan"><h3>{division ? "Jelajahi divisi" : "Perusahaan"}</h3>{division ? divisionNavigation(division).map(link => <Link href={link.href} key={link.href}>{link.label}</Link>) : <><Link href="/tentang-kami">Tentang kami</Link><Link href="/produk">Katalog produk</Link><Link href="/jasa">Jasa laser cutting & bending</Link><Link href="/proyek">Galeri pekerjaan</Link><Link href="/informasi">Artikel</Link><Link href="/sosial-media">Sosial media</Link></>}</nav>
    <nav aria-label="Bantuan"><h3>Bantuan</h3><Link href={`${base === "/" ? "" : base}/#cara-pesan`}>Cara pemesanan</Link><Link href={quote}>Permintaan penawaran</Link><Link href={contactHref}>Hubungi kami</Link></nav></div>
    <div className="company-footer-wordmark" aria-label={`Identitas ${division?.name || "Mahameru Baja Indonesia"}`}><span>{division?.name || "Mahameru Baja Indonesia"}</span><span className="company-footer-wordmark-dot" aria-hidden="true">.</span></div>
    <div className="company-footer-bottom"><p>© {new Date().getFullYear()} Mahameru Baja Indonesia.</p><div><Link href="/kebijakan-privasi">Kebijakan privasi</Link><Link href="/syarat-ketentuan">Syarat & ketentuan</Link></div></div>
  </div></footer>;
}
