"use client";

import Image from "next/image";
import { useState } from "react";
import { Link } from "react-router";
import MotionController from "../components/MotionController";
import { laserImage } from "../data/business";

const filters = ["Semua", "Laser Cutting & Bending", "Retail", "Mesin", "Produk", "Warehouse"];

const galleryItems = [
  { id: 1, src: laserImage, category: "Laser Cutting & Bending", title: "Ilustrasi proses laser cutting", span: "col-span-2" },
  { id: 2, src: laserImage, category: "Mesin", title: "Ilustrasi fasilitas produksi — spesifikasi menunggu verifikasi", span: "" },
  { id: 3, src: "/images/steel-indonesia/toko-mahameru.jpg", category: "Retail", title: "Toko Mahameru Baja, Tambun Selatan", span: "col-span-2 row-span-2" },
  { id: 4, src: "/images/steel-indonesia/besi-beton.jpg", category: "Produk", title: "Besi beton", span: "" },
  { id: 5, src: "/images/steel-indonesia/hollow.jpg", category: "Produk", title: "Besi hollow", span: "" },
  { id: 6, src: "/images/steel-indonesia/wiremesh.jpg", category: "Warehouse", title: "Persediaan wiremesh", span: "col-span-2" },
  { id: 7, src: "/images/steel-indonesia/bondek.jpg", category: "Produk", title: "Bondek untuk kebutuhan konstruksi", span: "" },
  { id: 8, src: "/images/steel-indonesia/baja-ringan.jpg", category: "Produk", title: "Baja ringan", span: "row-span-2" },
  { id: 9, src: "/images/steel-indonesia/spandek.jpg", category: "Produk", title: "Material spandek", span: "" },
  { id: 10, src: "/images/steel-indonesia/plat-hitam.jpg", category: "Warehouse", title: "Plat hitam", span: "" },
  { id: 11, src: "/images/steel-indonesia/pipa-hitam.jpg", category: "Produk", title: "Pipa hitam", span: "" },
];

type GalleryItem = (typeof galleryItems)[number];

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const filtered = activeFilter === "Semua" ? galleryItems : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <>
      <MotionController />
      <section className="projects-hero" aria-labelledby="projects-hero-heading">
        <div className="projects-parallax-media" data-parallax="0.12" aria-hidden="true">
          <Image src={laserImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className="projects-hero-shade" aria-hidden="true" />
        <div className="home-grid" aria-hidden="true" />
        <div className="home-shell projects-hero-content" data-reveal>
          <nav aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>Proyek & Galeri</span></nav>
          <p className="home-eyebrow text-brand"><span />Dokumentasi & kapabilitas</p>
          <h1 id="projects-hero-heading">Material nyata.<br /><em>Proses yang terlihat.</em></h1>
          <p>Galeri media produk, retail, dan ilustrasi produksi. Dokumentasi proyek aktual dapat ditambahkan melalui CMS setelah memperoleh persetujuan publikasi.</p>
        </div>
      </section>

      <section className="projects-gallery" aria-labelledby="gallery-heading">
        <div className="home-shell">
          <div className="home-section-heading" data-reveal>
            <div><p className="home-eyebrow text-brand"><span />Galeri terkurasi</p><h2 id="gallery-heading">Lihat material dari dekat.</h2></div>
            <p>Gunakan filter untuk menjelajahi dokumentasi toko, produk, warehouse, serta ilustrasi layanan produksi.</p>
          </div>
          <div className="projects-filters" aria-label="Filter galeri" data-reveal>
            {filters.map((filter) => (
              <button type="button" onClick={() => setActiveFilter(filter)} className={activeFilter === filter ? "is-active" : ""} key={filter}>{filter}</button>
            ))}
          </div>
          <div className="projects-grid">
            {filtered.map((item, index) => (
              <button type="button" key={item.id} onClick={() => setLightbox(item)} aria-label={`Lihat gambar: ${item.title}`} className={`projects-card ${item.span}`} data-reveal>
                <div className="projects-card-parallax" data-parallax={index % 2 === 0 ? "0.025" : "-0.02"}>
                  <Image src={item.src} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{item.category}</small><strong>{item.title}</strong></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="projects-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lightbox.title}>
          <div onClick={(event) => event.stopPropagation()}>
            <div className="projects-lightbox-media"><Image src={lightbox.src} alt={lightbox.title} fill sizes="90vw" /></div>
            <div className="projects-lightbox-caption">
              <div><small>{lightbox.category}</small><strong>{lightbox.title}</strong></div>
              <button type="button" onClick={() => setLightbox(null)} aria-label="Tutup">×</button>
            </div>
          </div>
        </div>
      )}

      <section className="projects-cta" aria-label="Konsultasi proyek">
        <div className="home-grid" aria-hidden="true" />
        <div className="home-shell" data-reveal>
          <p className="home-eyebrow"><span />Mulai kebutuhan berikutnya</p>
          <h2>Butuh material untuk proyek Anda?</h2>
          <p>Kirim daftar material, volume, lokasi, dan target waktu. Tim kami membantu mengarahkan kebutuhan ke unit yang tepat.</p>
          <div className="home-actions"><Link to="/minta-penawaran" className="home-button home-button-primary">Minta penawaran →</Link><Link to="/produk" className="home-button home-button-ghost">Lihat produk →</Link></div>
        </div>
      </section>
    </>
  );
}
