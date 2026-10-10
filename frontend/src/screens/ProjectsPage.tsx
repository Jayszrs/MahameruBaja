"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { laserImage } from "../data/business";
import ProjectAlbums from "../components/ProjectAlbums";
import type { GalleryProject } from "../data/projectGallery";

const filters = ["Semua", "Laser Cutting & Bending", "Retail", "Mesin", "Produk", "Warehouse", "Ilustrasi"];

const galleryItems = [
  { id: 1, src: laserImage, category: "Laser Cutting & Bending", title: "Ilustrasi proses laser cutting", span: "col-span-2", desc: "Contoh pengerjaan: memotong plat mengikuti gambar kerja untuk panel, ornamen, dan komponen custom.", unit: { label: "Jasa laser cutting", href: "/jasa" } },
  { id: 2, src: "/images/cnc-bending-visual-v1.png", category: "Mesin", title: "Ilustrasi proses CNC bending", span: "", desc: "Contoh pengerjaan: menekuk plat sesuai ukuran dan sudut dari gambar yang disetujui.", unit: { label: "Jasa laser cutting", href: "/jasa" } },
  { id: 3, src: "/images/steel-indonesia/toko-mahameru.jpg", category: "Retail", title: "Toko Mahameru Baja, Tambun Selatan", span: "col-span-2 row-span-2", desc: "Contoh layanan: pembelian besi satuan langsung di toko, dibantu cek ukuran dan stok.", unit: { label: "Toko Tambun", href: "/unit/retail-tambun" } },
  { id: 4, src: "/images/steel-indonesia/besi-beton.jpg", category: "Produk", title: "Besi beton", span: "", desc: "Contoh pengadaan: besi beton sesuai daftar kebutuhan, jumlah, dan jadwal proyek.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 5, src: "/images/steel-indonesia/hollow.jpg", category: "Produk", title: "Besi hollow", span: "", desc: "Contoh pengadaan: hollow untuk rangka dan konstruksi, tersedia berbagai ukuran.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 6, src: "/images/steel-indonesia/wiremesh.jpg", category: "Warehouse", title: "Persediaan wiremesh", span: "col-span-2", desc: "Contoh stok: wiremesh untuk pengecoran, disiapkan sesuai volume kebutuhan.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 7, src: "/images/steel-indonesia/bondek.jpg", category: "Produk", title: "Bondek untuk kebutuhan konstruksi", span: "", desc: "Contoh pengadaan: bondek untuk dak dan lantai kerja proyek.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 8, src: "/images/steel-indonesia/baja-ringan.jpg", category: "Produk", title: "Baja ringan", span: "row-span-2", desc: "Contoh pengadaan: baja ringan untuk rangka atap renovasi maupun proyek.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 9, src: "/images/steel-indonesia/spandek.jpg", category: "Produk", title: "Material spandek", span: "", desc: "Contoh pengadaan: spandek untuk atap dan dinding bangunan.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 10, src: "/images/steel-indonesia/plat-hitam.jpg", category: "Warehouse", title: "Plat hitam", span: "", desc: "Contoh material: plat untuk kebutuhan cutting, fabrikasi, dan konstruksi.", unit: { label: "Jasa laser cutting", href: "/jasa" } },
  { id: 11, src: "/images/steel-indonesia/pipa-hitam.jpg", category: "Produk", title: "Pipa hitam", span: "", desc: "Contoh pengadaan: pipa untuk instalasi dan konstruksi sesuai spesifikasi.", unit: { label: "Lihat produk", href: "/produk" } },
  { id: 12, src: "/images/hero-steel-logistics-v1.png", category: "Ilustrasi", title: "Ilustrasi alur pengiriman material", span: "col-span-2", desc: "Contoh layanan: pengiriman material ke lokasi mengikuti jadwal yang disepakati.", unit: { label: "Minta penawaran", href: "/minta-penawaran" } },
  { id: 13, src: "/images/hero-steel-warehouse-v2.png", category: "Ilustrasi", title: "Ilustrasi persediaan baja konstruksi", span: "col-span-2", desc: "Contoh layanan: stok material disiapkan untuk kebutuhan retail maupun proyek.", unit: { label: "Minta penawaran", href: "/minta-penawaran" } },
];

type GalleryItem = (typeof galleryItems)[number];

export default function ProjectsPage({ projects = [] }: { projects?: GalleryProject[] }) {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [armedId, setArmedId] = useState<number | null>(null);
  const filtered = activeFilter === "Semua" ? galleryItems : galleryItems.filter((item) => item.category === activeFilter);

  const coarsePointer = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  const handleCard = (item: GalleryItem) => {
    // Layar sentuh: ketukan pertama hanya menyalakan veil,
    // ketukan kedua baru membuka detail.
    if (coarsePointer() && armedId !== item.id) {
      setArmedId(item.id);
      window.setTimeout(() => setArmedId((current) => (current === item.id ? null : current)), 3000);
      return;
    }
    setArmedId(null);
    setLightbox(item);
  };

  useEffect(() => {
    if (!lightbox) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightbox]);

  return (
    <>
      <section className="projects-hero" aria-labelledby="projects-hero-heading">
        <div className="projects-parallax-media" data-parallax="0.26" aria-hidden="true">
          <Image src={laserImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className="projects-hero-shade" aria-hidden="true" />
        <div className="home-grid" aria-hidden="true" />
        <div className="home-shell projects-hero-content" data-reveal>
          <nav aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>Galeri</span></nav>
          <p className="home-eyebrow text-brand"><span />Dokumentasi & pekerjaan</p>
          <h1 id="projects-hero-heading">Lihat langsung material dan proses pekerjaan kami.</h1>
          <p>Galeri Mahameru Baja menampilkan material, aktivitas toko, proses produksi, hingga hasil pekerjaan yang kami kerjakan.</p>
        </div>
      </section>

      <ProjectAlbums projects={projects} />

      <section className="projects-gallery" aria-labelledby="gallery-heading">
        <div className="home-shell">
          <div className="home-section-heading" data-reveal>
            <div><p className="home-eyebrow text-brand"><span />Galeri terkurasi</p><h2 id="gallery-heading">Lihat material dari dekat.</h2></div>
            <p>Gunakan filter untuk menjelajahi dokumentasi toko, produk, warehouse, dan pekerjaan produksi. Klik gambar untuk melihat detailnya.</p>
          </div>
          <div className="projects-filters" aria-label="Filter galeri" data-reveal>
            {filters.map((filter) => (
              <button type="button" onClick={() => { setActiveFilter(filter); setArmedId(null); }} aria-pressed={activeFilter === filter} className={activeFilter === filter ? "is-active" : ""} key={filter}>{filter}</button>
            ))}
          </div>
          <div className="projects-grid">
            {filtered.map((item, index) => (
              <button type="button" key={item.id} onClick={() => handleCard(item)} aria-label={`Lihat gambar: ${item.title}`} className={`projects-card ${item.span}${armedId === item.id ? " is-armed" : ""}`} data-reveal>
                <div className="projects-card-parallax" data-parallax={index % 2 === 0 ? "0.13" : "-0.1"}>
                  <Image src={item.src} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <span className="projects-card-veil" aria-hidden="true"><b>Lihat detail</b></span>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{item.category}</small><strong>{item.title}</strong></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="projects-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lightbox.title}>
          <div className="projects-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <div className="projects-lightbox-media"><Image src={lightbox.src} alt={lightbox.title} fill sizes="(max-width: 900px) 90vw, 60vw" /></div>
            <aside className="projects-lightbox-detail">
              <div className="projects-lightbox-detail-head">
                <small>{lightbox.category}</small>
                <button type="button" onClick={() => setLightbox(null)} aria-label="Tutup">×</button>
              </div>
              <h3>{lightbox.title}</h3>
              <p>{lightbox.desc}</p>
              <div className="projects-lightbox-actions">
                <Link to="/minta-penawaran" className="home-button home-button-primary">Minta penawaran serupa</Link>
                <Link to={lightbox.unit.href} className="projects-lightbox-unit">{lightbox.unit.label} ↗</Link>
              </div>
            </aside>
          </div>
        </div>
      )}

      <section className="projects-cta" aria-label="Konsultasi proyek">
        <div className="home-grid" aria-hidden="true" />
        <div className="home-shell" data-reveal>
          <p className="home-eyebrow"><span />Mulai kebutuhan berikutnya</p>
          <h2>Butuh material untuk proyek Anda?</h2>
          <p>Kirim daftar material, volume, lokasi, dan target waktu. Tim kami membantu mengarahkan kebutuhan ke divisi yang tepat.</p>
          <div className="home-actions"><Link to="/minta-penawaran" className="home-button home-button-primary">Minta penawaran →</Link><Link to="/produk" className="home-button home-button-ghost">Lihat produk →</Link></div>
        </div>
      </section>
    </>
  );
}
