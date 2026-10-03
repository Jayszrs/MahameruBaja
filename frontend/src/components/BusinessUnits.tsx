"use client";

import { Link } from "react-router"
import { businessUnits } from "../data/business"

export default function BusinessUnits() {
  return (
    <section className="business-section" aria-labelledby="business-heading">
      <div className="industrial-container">
        <div className="section-heading">
          <div>
            <p className="industrial-eyebrow">
              SATU EKOSISTEM · EMPAT JALUR LAYANAN
            </p>
            <h2 id="business-heading">
              Kebutuhan berbeda.
              <br />
              Solusi yang terhubung.
            </h2>
          </div>
          <p>
            Material, pengadaan, hingga pengerjaan custom.
            <br />
            Pilih jalur yang sesuai dengan proyek Anda.
          </p>
        </div>
        <div className="business-grid">
          {businessUnits.map((unit, index) => (
            <article key={unit.slug} className="business-card">
              <span className="industrial-eyebrow">
                0{index + 1} / {unit.category}
              </span>
              <h3>{unit.name}</h3>
              <p className="business-label">{unit.label}</p>
              <p>{unit.description}</p>
              <Link to={`/unit/${unit.slug}`} className="business-link">
                Jelajahi unit <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
