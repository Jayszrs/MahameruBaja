"use client";
import { useDivisionDirectory } from "../components/DivisionDirectory";
import Image from "../components/CmsImage";
import DivisionVision from "../components/DivisionVision";
import DivisionCollage from "../components/DivisionCollage";
import ProjectAlbums from "../components/ProjectAlbums";
import type { GalleryProject } from "../data/projectGallery";
import Link from "next/link";
import type { Division } from "../data/divisionContent";
import type { TeamContact } from "../data/siteContent";
import { resolvedInventoryProducts, stockSummary, type InventoryItem } from "../data/inventory";
import ContactDirectory from "../components/ContactDirectory";
import DivisionLocation from "../components/DivisionLocation";
import RotatingHeroMedia from "../components/RotatingHeroMedia";
import PublicText from "../components/PublicText";
import { serviceDescription } from "../data/serviceDescriptions";
import { groupVision } from "../data/companyIdentity";

import { unitSections, unitSectionLabels, type UnitSection } from "../data/unitSections";

export default function DivisionSubPage({ division, section, contacts, inventory = [], projects = [] }: { division: Division; section: UnitSection; contacts: TeamContact[]; inventory?: InventoryItem[]; projects?: GalleryProject[] }) {
  const base = `/unit/${division.slug}`;
  const copy = {headline:division.aboutHeadline || division.title,values:division.values.length ? division.values : [division.intro]};
  const catalog = resolvedInventoryProducts(inventory).filter(p => inventory.some(i => i.division === division.slug && i.productId === p.id && i.listed));
  const title = section === "tentang" ? copy.headline : section === "produk" ? "Cari material untuk pekerjaan Anda." : section === "layanan" ? "Layanan yang membantu pekerjaan Anda." : section === "galeri" ? "Lihat material dan hasil pekerjaan kami." : "Hubungi tim kami.";
  return <PublicText><div className={`unit-subpage unit-theme-${division.slug}`}>
    <section className="unit-sub-hero"><RotatingHeroMedia className="unit-sub-hero-image" images={[division.hero, ...division.images.map(image => image.src)]} /><div className="industrial-container"><nav aria-label="Jejak halaman"><Link href="/">Beranda</Link><span>/</span><Link href={base}>{division.name}</Link><span>/</span><span>{unitSectionLabels[section]}</span></nav><p className="industrial-eyebrow">{unitSectionLabels[section]} / {division.label}</p><h1>{title}</h1><p>{section === "kontak" ? "Tanyakan pilihan produk, harga, pengiriman, atau jasa yang Anda butuhkan. Tim kami siap membantu." : division.intro}</p></div></section>
    {section === "tentang" && <><section className="unit-about industrial-container company-division-main"><DivisionCollage division={division} projects={projects} /><div data-reveal><p className="industrial-eyebrow">MENGENAL {division.name}</p><h2>Kenali tim dan layanan kami.</h2><p>{division.description}</p><Link href={`${base}/${division.kind === "material" ? "produk" : "layanan"}`}>Lihat pilihan produk & layanan ↗</Link></div></section><section className="unit-values"><div className="industrial-container"><p className="industrial-eyebrow">CARA KAMI MEMBANTU</p><div>{copy.values.map((value, i) => <article key={value} data-reveal><span>0{i + 1}</span><h3>{value}</h3></article>)}</div></div></section></>}
    {section === "layanan" && <section className="unit-service-list industrial-container">{division.offerings.map((offering, index) => <article key={offering}><div className="unit-service-photo"><div data-parallax="0.13"><Image src={division.images[index % division.images.length]?.src || division.hero} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" /></div></div><div data-reveal><p className="industrial-eyebrow">LAYANAN / 0{index + 1}</p><h2>{offering}</h2><p>{division.offeringDescriptions[offering] || serviceDescription(division.slug, offering)}</p><Link href={`${base}/kontak`} className="industrial-button">Tanyakan layanan ini ↗</Link></div></article>)}</section>}
    {section === "produk" && <section className="unit-catalog industrial-container"><div className="unit-section-intro"><p className="industrial-eyebrow">PILIHAN MATERIAL / {division.label}</p><h2>Temukan produk yang sesuai.</h2><p>Pilihan kategori untuk kebutuhan divisi ini. Konfirmasikan ukuran, ketersediaan, serta harga dengan tim.</p></div><div className="unit-product-grid">{catalog.map(product => <article key={product.id}><Link href={`/produk/${product.slug}?unit=${division.slug}`}><div><Image src={product.image} alt={product.name} fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" /></div><small>{product.category}</small><h3>{product.name}</h3><p>{product.shortSpec}</p><p className="unit-product-stock">{stockSummary(inventory.find(i => i.productId === product.id && i.division === division.slug)!)}</p><span>Lihat spesifikasi ↗</span></Link></article>)}</div>{!catalog.length && <p className="unit-catalog-empty">Belum ada produk material yang diterbitkan untuk divisi ini. Hubungi admin untuk kebutuhan produk atau layanan; stok divisi lain tidak otomatis ditampilkan di sini.</p>}<Link className="industrial-button" href={`${base}/kontak`}>Tanyakan produk lainnya ↗</Link></section>}
    {section === "galeri" && <section className="unit-gallery industrial-container"><div className="unit-section-intro" data-reveal><p className="industrial-eyebrow">GALERI / {division.label}</p><h2>Lihat dari dekat.</h2><p>{division.description}</p></div><div className="unit-gallery-grid">{division.images.map((photo, i) => <figure key={photo.src} data-reveal><div><div data-parallax={i % 2 ? "0.1" : "0.18"}><Image src={photo.src} alt={photo.title} fill sizes="(max-width: 760px) 100vw, 66vw" /></div></div><figcaption><span>0{i + 1}</span>{photo.title}</figcaption></figure>)}</div></section>}
    {section === "galeri" && projects.length > 0 && <ProjectAlbums projects={projects} />}
    {section === "tentang" && <DivisionVision slug={division.slug} />}
    {section === "kontak" && <ContactDirectory contacts={contacts} divisionSlug={division.slug} />}
    {section === "kontak" && <DivisionLocation slug={division.slug} />}
    {section !== "kontak" && <section className="unit-sub-cta industrial-container" data-reveal><h2>Sudah punya<br />gambaran kebutuhan?</h2><Link href={`${base}/kontak`} className="industrial-button">Hubungi tim {division.name} ↗</Link></section>}
  </div></PublicText>;
}
