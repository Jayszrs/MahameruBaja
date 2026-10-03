"use client";

import { Link, useParams } from "react-router"
import { businessUnits } from "../data/business"
import NotFoundPage from "./NotFoundPage"

export default function BusinessUnitPage() {
  const { slug } = useParams()
  const unit = businessUnits.find((item) => item.slug === slug)
  if (!unit) return <NotFoundPage />
  return (
    <>
      <section className="laser-page-hero">
        <div className="industrial-container">
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
          <div className="section-heading">
            <div>
              <p className="industrial-eyebrow">INFORMASI UNIT</p>
              <h2>{unit.label}</h2>
            </div>
            <p>Satu perusahaan, jalur layanan yang terarah.</p>
          </div>
          <div className="business-grid">
            {[
              "Lokasi",
              "Jam operasional",
              "Kontak WhatsApp",
              "Galeri unit",
            ].map((label) => (
              <article className="business-card" key={label}>
                <h3>{label}</h3>
                <p>
                  {label === "Kontak WhatsApp"
                    ? "Nomor khusus unit menunggu verifikasi. Gunakan kontak utama untuk meminta arahan."
                    : "Placeholder — informasi terverifikasi akan ditambahkan oleh pengelola."}
                </p>
                {label === "Kontak WhatsApp" && (
                  <a
                    className="business-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/6281218052017?text=${encodeURIComponent(`Halo, mohon arahkan saya ke ${unit.name} (${unit.label}).`)}`}
                  >
                    Hubungi kontak utama ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
