import Image from "next/image";
import DivisionVision from "../components/DivisionVision";
import Link from "next/link";
import type { Division } from "../data/divisionContent";
import type { TeamContact } from "../data/siteContent";
import { stockSummary, type InventoryItem } from "../data/inventory";
import { products } from "../data/products";
import ContactDirectory from "../components/ContactDirectory";
import DivisionLocation from "../components/DivisionLocation";
import { groupVision, divisionIdentity } from "../data/companyIdentity";

export const unitSections = ["tentang", "layanan", "produk", "galeri", "kontak"] as const;
export type UnitSection = typeof unitSections[number];
export const unitSectionLabels: Record<UnitSection, string> = { tentang: "Tentang Kami", layanan: "Layanan", produk: "Produk", galeri: "Galeri", kontak: "Kontak" };
const aboutCopy: Record<string, { headline: string; values: string[] }> = {
  "retail-tambun": { headline: "Dekat dengan kebutuhan bangunan Anda.", values: ["Konsultasi spesifikasi sebelum membeli", "Pilihan material untuk renovasi dan konstruksi", "Konfirmasi stok serta pengiriman langsung dengan tim"] },
  "retail-cibitung": { headline: "Jalur material untuk pekerjaan di Cibitung.", values: ["Membantu memilih ukuran dan profil material", "Menghubungkan kebutuhan bengkel dan konstruksi", "Meninjau ketersediaan sesuai daftar permintaan"] },
  "trading-proyek": { headline: "Satu koordinasi untuk kebutuhan proyek.", values: ["Meninjau daftar kebutuhan dan volume", "Menyiapkan alur penawaran serta pemesanan", "Mengoordinasikan suplai dengan lokasi pekerjaan"] },
  "laser-cutting": { headline: "Gambar kerja sebagai awal setiap proses.", values: ["Review material, ketebalan, dan dimensi", "Cutting, bending, dan fabrikasi dalam satu konsultasi", "Konfirmasi proses serta jadwal sebelum produksi"] },
  "fabrikasi-erection": { headline: "Fabrikasi dan erection bersama tim proyek.", values: ["Review gambar struktur", "Koordinasi keselamatan dan jadwal", "Konsultasi langsung dengan admin proyek"] },
};

export default function DivisionSubPage({ division, section, contacts, inventory = [] }: { division: Division; section: UnitSection; contacts: TeamContact[]; inventory?: InventoryItem[] }) {
  const base = `/unit/${division.slug}`;
  const copy = aboutCopy[division.slug];
  const catalog = products.filter(p => inventory.some(i => i.division === division.slug && i.productId === p.id && i.listed));
  const title = section === "tentang" ? copy.headline : section === "produk" ? "Material untuk rencana Anda." : section === "layanan" ? "Dari kebutuhan ke langkah kerja." : section === "galeri" ? "Material. Proses. Perspektif." : "Mulai dari percakapan.";
  return <div className={`unit-subpage unit-theme-${division.slug}`}>
    <section className="unit-sub-hero"><div className="unit-sub-hero-image" {...(section !== "produk" ? { "data-parallax": "0.22" } : {})}><Image src={division.hero} alt="" fill sizes="100vw" priority /></div><div className="industrial-container"><nav aria-label="Jejak halaman"><Link href="/">Beranda</Link><span>/</span><Link href={base}>{division.name}</Link><span>/</span><span>{unitSectionLabels[section]}</span></nav><p className="industrial-eyebrow">{unitSectionLabels[section]} / {division.label}</p><h1>{title}</h1><p>{section === "kontak" ? "Hubungi tim untuk membahas spesifikasi, jumlah, gambar, dan lokasi kebutuhan." : division.intro}</p></div></section>
    {section === "tentang" && <><section className="unit-about industrial-container"><div className="unit-about-photo"><div data-parallax="0.15"><Image src={division.images[0].src} alt={division.images[0].title} fill sizes="(max-width: 760px) 100vw, 50vw" /></div></div><div data-reveal><p className="industrial-eyebrow">MENGENAL {division.name}</p><h2>Bagian dari satu ekosistem.</h2><p>{division.description}</p><Link href={`${base}/${division.slug.startsWith("retail") ? "produk" : "layanan"}`}>Jelajahi kebutuhan Anda ↗</Link></div></section><section className="unit-values"><div className="industrial-container"><p className="industrial-eyebrow">CARA KAMI MEMBANTU</p><div>{copy.values.map((value, i) => <article key={value} data-reveal><span>0{i + 1}</span><h3>{value}</h3></article>)}</div></div></section></>}
    {section === "layanan" && <section className="unit-service-list industrial-container">{division.offerings.map((offering, index) => <article key={offering}><div className="unit-service-photo"><div data-parallax="0.13"><Image src={division.images[index % division.images.length].src} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" /></div></div><div data-reveal><p className="industrial-eyebrow">LAYANAN / 0{index + 1}</p><h2>{offering}</h2><p>{copy.values[index % copy.values.length]}. Sampaikan spesifikasi agar tim dapat meninjau kebutuhan dan langkah berikutnya.</p><Link href={`${base}/kontak`} className="industrial-button">Konsultasikan kebutuhan ↗</Link></div></article>)}</section>}
    {section === "produk" && <section className="unit-catalog industrial-container"><div className="unit-section-intro"><p className="industrial-eyebrow">PILIHAN MATERIAL / {division.label}</p><h2>Temukan produk yang sesuai.</h2><p>Pilihan kategori untuk kebutuhan divisi ini. Konfirmasikan ukuran, ketersediaan, serta harga dengan tim.</p></div><div className="unit-product-grid">{catalog.map(product => <article key={product.id}><Link href={`/produk/${product.slug}?unit=${division.slug}`}><div><Image src={product.image} alt={product.name} fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" /></div><small>{product.category}</small><h3>{product.name}</h3><p>{product.shortSpec}</p><p className="unit-product-stock">{stockSummary(inventory.find(i => i.productId === product.id && i.division === division.slug)!)}</p><span>Lihat spesifikasi ↗</span></Link></article>)}</div>{!catalog.length && <p className="unit-catalog-empty">Belum ada produk material yang diterbitkan untuk divisi ini. Hubungi admin untuk kebutuhan produk atau layanan; stok divisi lain tidak otomatis ditampilkan di sini.</p>}<Link className="industrial-button" href={`${base}/kontak`}>Tanyakan produk lainnya ↗</Link></section>}
    {section === "galeri" && <section className="unit-gallery industrial-container"><div className="unit-section-intro" data-reveal><p className="industrial-eyebrow">GALERI / {division.label}</p><h2>Lihat dari dekat.</h2><p>{division.description}</p></div><div className="unit-gallery-grid">{division.images.map((photo, i) => <figure key={photo.src} data-reveal><div><div data-parallax={i % 2 ? "0.1" : "0.18"}><Image src={photo.src} alt={photo.title} fill sizes="(max-width: 760px) 100vw, 66vw" /></div></div><figcaption><span>0{i + 1}</span>{photo.title}</figcaption></figure>)}</div></section>}
    {section === "tentang" && <DivisionVision slug={division.slug} />}
    {section === "kontak" && <ContactDirectory contacts={contacts} divisionSlug={division.slug} />}
    {section === "kontak" && <DivisionLocation slug={division.slug} />}
    {section !== "kontak" && <section className="unit-sub-cta industrial-container" data-reveal><h2>Sudah punya<br />gambaran kebutuhan?</h2><Link href={`${base}/kontak`} className="industrial-button">Hubungi tim {division.name} ↗</Link></section>}
  </div>;
}
