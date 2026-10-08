"use client";

import { Link } from "react-router"
import { laserImage } from "../data/business"
import { useScrollY } from "../hooks/useReveal"

export default function LaserSpotlight() {
  const scrollY = useScrollY()
  return (
    <section className="laser-hero" aria-labelledby="laser-home-title">
      <div
        className="laser-hero-image"
        style={{ transform: `translateY(${Math.min(scrollY * 0.12, 85)}px)` }}
      >
        <img
          src={laserImage}
          alt="Ilustrasi mesin memotong plat logam, bukan dokumentasi fasilitas Mahameru Baja"
          fetchPriority="high"
        />
      </div>
      <div className="laser-hero-shade" />
      <div className="industrial-container laser-hero-content">
        <div className="laser-hero-top">
          <p className="industrial-eyebrow">
            MAHAMERU BAJA / MATERIAL & MANUFACTURING
          </p>
          <span className="hero-location">TAMBUN · CIBITUNG · BEKASI</span>
        </div>
        <div className="laser-hero-copy">
          <span className="hero-service-label">
            <span /> LASER CUTTING & CNC BENDING
          </span>
          <h1 id="laser-home-title">
            Dari presisi.
            <br />
            Menjadi <em>potensi.</em>
          </h1>
          <p>
            Jasa laser cutting dan bending untuk kebutuhan Anda.
            <br className="hidden sm:block" /> Terhubung dengan material baja,
            fabrikasi, dan supply proyek dalam satu ekosistem.
          </p>
          <div className="industrial-actions">
            <Link className="industrial-button" to="/jasa#request">
              Request cutting & bending <span aria-hidden="true">↗</span>
            </Link>
            <Link className="industrial-button outline" to="/jasa#laser-cutting">
              Jelajahi layanan <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="laser-hero-bottom">
          <div>
            <span className="industrial-eyebrow">01 / LAYANAN UTAMA</span>
            <p>Gambar Anda. Langkah awal produksi.</p>
          </div>
          <Link to="/produk" className="hero-catalog-link">
            Mencari besi & baja?
            <br />
            <strong>
              Buka katalog material <span aria-hidden="true">↗</span>
            </strong>
          </Link>
          <span className="hero-photo-note">
            FOTO ILUSTRASI · CEMRECAN YURTMAN / UNSPLASH
          </span>
        </div>
      </div>
      <div className="laser-service-strip">
        <div className="industrial-container">
          <span>LASER CUTTING</span>
          <i />
          <span>CNC BENDING</span>
          <i />
          <span>FABRIKASI & EREKSION</span>
          <i />
          <span>RETAIL BESI</span>
          <i />
          <span>TRADING PROYEK</span>
        </div>
      </div>
    </section>
  )
}
