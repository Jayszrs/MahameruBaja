"use client";

import { Link, useParams } from "react-router"
import { businessUnits } from "../data/business"
import NotFoundPage from "./NotFoundPage"
import MotionController from "../components/MotionController"

const unitDetails: Record<string, { image: string; needs: string; start: string; area: string }> = {
  "retail-tambun": { image: "/images/steel-indonesia/toko-mahameru.jpg", needs: "Besi beton, hollow, plat, profil baja, pipa dan material konstruksi untuk pembelian satuan.", start: "Telusuri katalog, catat ukuran dan jumlah, lalu minta konfirmasi stok serta harga.", area: "Toko di Tambun Selatan, Kabupaten Bekasi." },
  "retail-cibitung": { image: "/images/steel-indonesia/hollow.jpg", needs: "Konsultasi material untuk renovasi, bengkel dan kebutuhan retail di wilayah Cibitung.", start: "Kirim jenis material, ukuran, jumlah dan lokasi kebutuhan agar diarahkan ke tim retail.", area: "Area layanan Cibitung dan sekitarnya. Detail lokasi dikonfirmasi melalui kontak utama." },
  "trading-proyek": { image: "/images/steel-indonesia/wiremesh.jpg", needs: "Pengadaan material dalam volume proyek dan penjadwalan kebutuhan bertahap.", start: "Kirim daftar material, spesifikasi, volume, lokasi proyek dan target pengiriman.", area: "Jangkauan pengiriman dan jadwal dikonfirmasi setelah kebutuhan ditinjau." },
  "laser-cutting": { image: "/images/laser-cutting-illustration.jpg", needs: "Laser cutting, CNC bending dan pengerjaan komponen sesuai gambar teknik.", start: "Siapkan file gambar, material, ketebalan, ukuran dan jumlah untuk review teknis.", area: "Kapasitas, kelayakan desain dan jadwal dikonfirmasi oleh tim produksi." },
}

export default function BusinessUnitPage() {
  const { slug } = useParams()
  const unit = businessUnits.find((item) => item.slug === slug)
  if (!unit) return <NotFoundPage />
  const detail = unitDetails[unit.slug]
  return (
    <>
      <MotionController />
      <section className="laser-page-hero">
        <div className="industrial-container" data-reveal>
          <p className="industrial-eyebrow">
            EKOSISTEM MAHAMERU BAJA / {unit.label}
          </p>
          <h1>{unit.name}</h1>
          <p>{unit.description}</p>
          <div className="industrial-actions">
            <Link className="industrial-button" to={unit.destination}>
              {unit.slug === "laser-cutting"
                ? "Lihat jasa dan mesin"
                : "retail" === unit.slug.split("-")[0]
                  ? "Lihat katalog produk"
                  : "Request penawaran"}{" "}
              ↗
            </Link>
            <Link
              className="industrial-button outline"
              to={`/minta-penawaran?unit=${unit.slug}`}
            >
              Minta harga →
            </Link>
          </div>
        </div>
      </section>
      <section className="business-section">
        <div className="industrial-container">
          <div className="section-heading" data-reveal>
            <div>
              <p className="industrial-eyebrow">INFORMASI UNIT</p>
              <h2>{unit.label}</h2>
            </div>
            <p>Satu perusahaan, jalur layanan yang terarah.</p>
          </div>
          <div className="business-grid">
            {[
              { title: "Kebutuhan yang ditangani", text: detail.needs },
              { title: "Cara memulai", text: detail.start },
              { title: "Area & konfirmasi", text: detail.area },
              { title: "Hubungi tim", text: "Sampaikan kebutuhan melalui kontak utama. Tim akan mengarahkan permintaan ke unit yang sesuai." },
            ].map((item) => (
              <article className="business-card" key={item.title} data-reveal>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.title === "Hubungi tim" && <a className="business-link" target="_blank" rel="noopener noreferrer" href={`https://wa.me/6281218052017?text=${encodeURIComponent(`Halo, mohon arahkan saya ke ${unit.name} (${unit.label}).`)}`}>Chat kontak utama ↗</a>}
              </article>
            ))}
          </div>
          <div className="unit-visual" data-reveal><img src={detail.image} alt={`Ilustrasi ${unit.label}`} /><div><strong>{unit.name}</strong><span>{unit.label}</span></div></div>
        </div>
      </section>
    </>
  )
}
