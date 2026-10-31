"use client";
import PublicText from "./PublicText";
import { useDivisionDirectory } from "./DivisionDirectory";
import Image from "./CmsImage";
import Link from "next/link";

import { mainLogo, groupMotto } from "../data/companyIdentity";

import type { Division } from "../data/divisionContent";
import { divisionNavigation } from "./DivisionChrome";
import FooterDivisions from "./FooterDivisions";
import FooterLocalServices from "./FooterLocalServices";

export default function Footer({ division,backgroundImage="" }: { division?: Division;backgroundImage?:string }) {
  const { divisions, divisionWhatsApp, divisionIdentity } = useDivisionDirectory();
  const base = division ? `/unit/${division.slug}` : "/";
  const contactHref = division ? `${base}/kontak` : "/kontak";
  const name = division?.name || "Mahameru Baja Indonesia";
  const logo = division ? divisionIdentity[division.slug].logo : mainLogo;
  const quote = division?.quote || "/minta-penawaran";
  const adminSlug = division?.slug || "laser-cutting";
  return <PublicText><footer className="company-footer">
    <div className="company-footer-photo" aria-hidden="true"><Image src={backgroundImage || "/images/steel-indonesia/toko-mahameru.jpg"} alt="" fill sizes="100vw" /></div>
    <div className="home-shell">
    <section className="company-footer-cta"><div><p className="industrial-eyebrow">MATERIAL, CUTTING & PROYEK</p><h2>{division ? <>Bicarakan kebutuhan<br />{division.label.toLowerCase()} Anda.</> : <>Kebutuhan Anda,<br />ditangani tim yang tepat.</>}</h2><p>Sampaikan kebutuhan Anda. Tim kami membantu mengecek spesifikasi, menyiapkan penawaran, dan mengatur langkah berikutnya.</p></div><div><Link className="home-button home-button-primary" href={quote}>Minta penawaran</Link>{division?<a className="footer-contact-link" href={divisionWhatsApp(adminSlug)} target="_blank" rel="noopener noreferrer">Hubungi admin divisi</a>:<a className="footer-contact-link" href="#footer-divisi">Pilih admin divisi</a>}</div></section>
    {!division&&<><p className="company-footer-motto footer-group-motto">{groupMotto}</p><FooterDivisions divisions={divisions}/></>}
    <div className={`company-footer-grid${!division?" company-footer-group-links":""}`}>{division&&<><div className="company-footer-brand"><Link href={base}><Image src={logo} alt={name} width={170} height={140} className="footer-company-logo" transparentLogo /></Link><address>{division.address}</address><p>{division.slug === "retail-cibitung" ? "Jam kunjungan: konfirmasi dengan admin" : "Senin–Sabtu · 07.00–17.00 WIB"}</p><Link href={contactHref}>Lokasi & kontak admin</Link></div>
    <nav aria-label="Website divisi"><h3>Website divisi</h3>{divisions.map(item => <Link key={item.slug} href={`/unit/${item.slug}`}>{item.name}</Link>)}</nav></>}
    <nav aria-label="Navigasi perusahaan"><h3>{division ? "Jelajahi divisi" : "Perusahaan"}</h3>{division ? divisionNavigation(division).map(link => <Link href={link.href} key={link.href}>{link.label}</Link>) : <><Link href="/tentang-kami">Tentang kami</Link><Link href="/produk">Katalog produk</Link><Link href="/jasa">Jasa laser cutting & bending</Link><Link href="/proyek">Galeri pekerjaan</Link><Link href="/informasi">Artikel</Link><Link href="/sosial-media">Sosial media</Link></>}</nav>
    <nav aria-label="Bantuan"><h3>Bantuan</h3><Link href={`${base === "/" ? "" : base}/#cara-pesan`}>Cara pemesanan</Link><Link href={quote}>Permintaan penawaran</Link><Link href={contactHref}>Hubungi kami</Link></nav></div>
    <FooterLocalServices divisions={divisions} />
    {division&&<p className="company-footer-motto">{groupMotto}</p>}
    <div className="company-footer-wordmark" aria-label={`Identitas ${division?.name || "Mahameru Baja Indonesia"}`}><span>{division?.name || "Mahameru Baja Indonesia"}</span><span className="company-footer-wordmark-dot" aria-hidden="true">.</span></div>
    <div className="company-footer-bottom"><p>© {new Date().getFullYear()} Mahameru Baja Indonesia.</p><div><Link href="/kebijakan-privasi">Kebijakan privasi</Link><Link href="/syarat-ketentuan">Syarat & ketentuan</Link></div></div>
  </div></footer></PublicText>;
}
