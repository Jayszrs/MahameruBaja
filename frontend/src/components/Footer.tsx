"use client";
import { useSectionList, sectionListAttributes, useCompanyProfile } from "./PublicText";
import { PublicSection } from "./PublicText";
import PublicText from "./PublicText";
import { useDivisionDirectory } from "./DivisionDirectory";
import Image from "./CmsImage";
import Link from "next/link";

import { mainLogo, groupMotto } from "../data/companyIdentity";

import type { Division } from "../data/divisionContent";
import { divisionNavigation } from "./DivisionChrome";
import FooterDivisions from "./FooterDivisions";
import FooterLocalServices from "./FooterLocalServices";

export default function Footer({ division }: { division?: Division }) {
  const { divisions, divisionWhatsApp, divisionIdentity } = useDivisionDirectory();
  const company=useCompanyProfile();
  const base = division ? `/unit/${division.slug}` : "/";
  const contactHref = division ? `${base}/kontak` : "/kontak";
  const name = division?.name || "Mahameru Baja Indonesia";
  const logo = division ? divisionIdentity[division.slug].logo : mainLogo;
  const quote = division?.quote || "/minta-penawaran";
  const adminSlug = division?.slug || "laser-cutting";
  const companyLinks=useSectionList("footerCompanyLinks",division ? divisionNavigation(division) : [{href:"/tentang-kami",label:"Tentang kami"},{href:"/produk",label:"Katalog produk"},{href:"/jasa",label:"Jasa laser cutting & bending"},{href:"/proyek",label:"Galeri pekerjaan"},{href:"/informasi",label:"Artikel"},{href:"/sosial-media",label:"Sosial media"}],"navigation","all");
  const helpLinks=useSectionList("footerHelpLinks",[{href:`${base === "/" ? "" : base}/#cara-pesan`,label:"Cara pemesanan"},{href:quote,label:"Permintaan penawaran"},{href:contactHref,label:"Hubungi kami"}],"navigation","all");
  return <PublicText><PublicSection section="footer" page="all"><footer className="company-footer">
    <div className="company-footer-photo" id="footer-foto" aria-hidden="true"><Image src="/images/steel-indonesia/toko-mahameru.jpg" alt="" fill sizes="100vw" /></div>
    <div className="home-shell">
    <PublicSection section="cta" page="all"><section className="company-footer-cta" id="footer-cta"><div><p className="industrial-eyebrow">MATERIAL, CUTTING & PROYEK</p><h2>{division ? <>Bicarakan kebutuhan<br />{division.label.toLowerCase()} Anda.</> : <>Kebutuhan Anda,<br />ditangani tim yang tepat.</>}</h2><p>Sampaikan kebutuhan Anda. Tim kami membantu mengecek spesifikasi, menyiapkan penawaran, dan mengatur langkah berikutnya.</p></div><div><Link className="home-button home-button-primary" href={quote}>Minta penawaran</Link>{division?<a className="footer-contact-link" href={divisionWhatsApp(adminSlug)} target="_blank" rel="noopener noreferrer">Hubungi admin divisi</a>:<a className="footer-contact-link" href="#footer-divisi">Pilih admin divisi</a>}</div></section></PublicSection>
    {!division&&<><PublicSection section="motto" page="all"><p className="company-footer-motto footer-group-motto" id="footer-motto" data-cms-field="companyMotto">{company.motto}</p></PublicSection><FooterDivisions divisions={divisions}/></>}
    <PublicSection section="navigation" page="all"><div id="footer-navigasi" className={`company-footer-grid${!division?" company-footer-group-links":""}`}>{division&&<><div className="company-footer-brand"><Link href={base}><Image src={logo} alt={name} width={170} height={140} className="footer-company-logo" transparentLogo /></Link><address>{division.address}</address><p>{division.slug === "retail-cibitung" ? "Jam kunjungan: konfirmasi dengan admin" : "Senin–Sabtu · 07.00–17.00 WIB"}</p><Link href={contactHref}>Lokasi & kontak admin</Link></div>
    <nav aria-label="Website divisi"><h3>Website divisi</h3>{divisions.map(item => <Link key={item.slug} href={`/unit/${item.slug}`}>{item.name}</Link>)}</nav></>}
    <nav aria-label="Navigasi perusahaan" {...sectionListAttributes("footerCompanyLinks",companyLinks)}><h3>{division ? "Jelajahi divisi" : "Perusahaan"}</h3>{companyLinks.map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
    <nav aria-label="Bantuan" {...sectionListAttributes("footerHelpLinks",helpLinks)}><h3>Bantuan</h3>{helpLinks.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div></PublicSection>
    <FooterLocalServices divisions={divisions} />
    {division&&<p className="company-footer-motto" data-cms-field="companyMotto">{company.motto}</p>}
    <PublicSection section="identity" page="all"><div className="company-footer-wordmark" id="footer-identitas" aria-label={`Identitas ${division?.name || "Mahameru Baja Indonesia"}`}><span>{division?.name || "Mahameru Baja Indonesia"}</span><span className="company-footer-wordmark-dot" aria-hidden="true">.</span></div></PublicSection>
    <PublicSection section="legal" page="all"><div className="company-footer-bottom" id="footer-legal"><p>© {new Date().getFullYear()} Mahameru Baja Indonesia.</p><div><Link href="/kebijakan-privasi">Kebijakan privasi</Link><Link href="/syarat-ketentuan">Syarat & ketentuan</Link></div></div></PublicSection>
  </div></footer></PublicSection></PublicText>;
}
