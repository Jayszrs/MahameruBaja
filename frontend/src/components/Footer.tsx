import Image from "next/image";
import Link from "next/link";
import { divisions } from "../data/divisionContent";
import { mainLogo, groupMotto, divisionWhatsApp } from "../data/companyIdentity";

export default function Footer() {
  return <footer className="company-footer"><div className="home-shell">
    <section className="company-footer-cta"><div><p className="industrial-eyebrow">MATERIAL & JASA BAJA</p><h2>Butuh material atau<br />jasa laser cutting?</h2><p>Sampaikan kebutuhan Anda. Tim kami membantu mengecek spesifikasi, menyiapkan penawaran, dan mengatur langkah berikutnya.</p></div><div><Link className="home-button home-button-primary" href="/minta-penawaran">Minta penawaran ↗</Link><a className="footer-contact-link" href={divisionWhatsApp("laser-cutting")} target="_blank" rel="noopener noreferrer">Chat admin laser cutting ↗</a></div></section>
    <div className="company-footer-grid"><div className="company-footer-brand"><Link href="/"><Image src={mainLogo} alt="Mahameru Baja Indonesia — MBI Laser Cutting" width={170} height={140} /></Link><p>{groupMotto}</p><address>Jl. Permata Regensi Blok K1 No. 38–39,<br />Tambun Selatan, Kabupaten Bekasi 17510</address><p>Senin–Sabtu · 07.00–17.00 WIB</p><Link href="/kontak">Lokasi & kontak admin ↗</Link></div>
    <nav aria-label="Website divisi"><h3>Website divisi</h3>{divisions.map(division => <Link key={division.slug} href={`/unit/${division.slug}`}>{division.name} ↗</Link>)}</nav>
    <nav aria-label="Navigasi perusahaan"><h3>Perusahaan</h3><Link href="/tentang-kami">Tentang kami</Link><Link href="/produk">Katalog produk</Link><Link href="/jasa">Jasa laser cutting & bending</Link><Link href="/proyek">Galeri pekerjaan</Link><Link href="/informasi">Artikel</Link><Link href="/sosial-media">Sosial media</Link></nav>
    <nav aria-label="Bantuan"><h3>Bantuan</h3><Link href="/#cara-pesan">Cara pemesanan</Link><Link href="/minta-penawaran">Permintaan penawaran</Link><Link href="/kontak">Hubungi kami</Link><Link href="/admin/login">Portal admin</Link></nav></div>
    <div className="company-footer-bottom"><p>© {new Date().getFullYear()} Mahameru Baja Indonesia.</p><div><Link href="/kebijakan-privasi">Kebijakan privasi</Link><Link href="/syarat-ketentuan">Syarat & ketentuan</Link></div></div>
  </div></footer>;
}
