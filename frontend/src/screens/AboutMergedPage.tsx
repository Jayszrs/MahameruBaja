import Image from "next/image";
import Link from "next/link";
import { divisions } from "../data/divisionContent";
import type { SiteContent } from "../data/siteContent";
import { clientPartners } from "../data/clientPartners";

const directions = [
  {
    need: "Untuk pembelian material secara langsung",
    focus: "Material satuan di Tambun",
    desc: "Mahameru Baja melayani pelanggan yang membutuhkan besi dan material bangunan untuk rumah, toko, bengkel, renovasi, maupun kebutuhan lainnya. Pelanggan dapat membeli material sesuai ukuran dan jumlah yang dibutuhkan melalui toko di Tambun.",
    vision: "Menjadi toko besi yang dapat diandalkan untuk kebutuhan material di Tambun dan sekitarnya.",
    mission: "Menyediakan berbagai pilihan material dan membantu pelanggan mendapatkan barang sesuai kebutuhan, ukuran, jumlah, dan anggaran.",
  },
  {
    need: "Untuk kebutuhan material di Cibitung",
    focus: "Kebutuhan retail area Cibitung",
    desc: "Garuda Marginal Baja melayani pembelian besi dan material di Cibitung dan sekitarnya. Unit ini menangani kebutuhan seperti besi hollow, pipa, plat, dan material baja lainnya, baik untuk kebutuhan pribadi maupun pekerjaan.",
    vision: "Menjadi pilihan toko besi yang dapat diandalkan oleh pelanggan di Cibitung dan sekitarnya.",
    mission: "Menyediakan pilihan material yang dibutuhkan pelanggan serta membantu proses pemilihan dan pembelian sesuai kebutuhan.",
  },
  {
    need: "Untuk pengadaan dan suplai proyek",
    focus: "Pengadaan dan suplai proyek",
    desc: "Mahameru Baja Indonesia menangani kebutuhan material dalam jumlah lebih besar untuk proyek. Berbeda dari pembelian di toko, kebutuhan proyek biasanya melibatkan daftar material, spesifikasi, volume, lokasi, dan jadwal pengiriman yang perlu disiapkan bersama.",
    vision: "Menjadi mitra penyedia material yang dapat diandalkan untuk kebutuhan proyek.",
    mission: "Menyediakan material sesuai spesifikasi dan jumlah yang dibutuhkan serta membantu pengadaan dan pengiriman sesuai kebutuhan proyek.",
  },
  {
    need: "Untuk material yang perlu diproses sesuai gambar",
    focus: "Jasa laser cutting dan CNC bending",
    desc: "MBI Laser Cutting menangani pekerjaan yang membutuhkan proses setelah material tersedia, seperti laser cutting, CNC bending, pembuatan komponen custom, panel, ornamen, dan fabrikasi. Pelanggan dapat mengirim gambar, spesifikasi material, ukuran, dan jumlah untuk diperiksa sebelum pekerjaan dimulai.",
    vision: "Menjadi partner produksi yang dapat diandalkan untuk kebutuhan laser cutting, bending, dan fabrikasi.",
    mission: "Mengerjakan pesanan berdasarkan gambar, spesifikasi material, ukuran, dan kebutuhan pelanggan dengan proses kerja yang terukur.",
  },
] as const;

export default function AboutMergedPage({ content }: { content: SiteContent }) {
  return <div className="merged-page about-merged">

    {/* ── HERO ── */}
    <section className="laser-page-hero jasa-hero" aria-labelledby="about-title">
      <div className="industrial-container">
        <nav aria-label="Breadcrumb"><Link href="/">Beranda</Link><span>/</span><span>Tentang Kami</span></nav>
        <div className="laser-page-grid">
          <div>
            <h1 id="about-title">Mahameru Baja dan <span>empat unit</span> untuk kebutuhan yang berbeda.</h1>
            <p>Mulai dari pembelian material, pengadaan proyek, hingga laser cutting dan fabrikasi, setiap unit Mahameru Baja menangani kebutuhan yang berbeda.</p>
            <div className="home-actions"><a className="industrial-button" href="#divisi">Pilih unit sesuai kebutuhan <span aria-hidden="true">↗</span></a></div>
          </div>
          <figure>
            <img src="/images/hero-steel-warehouse-v2.png" alt="Gudang material Mahameru Baja" />
            <figcaption>Foto ilustrasi gudang dan material baja.</figcaption>
          </figure>
        </div>
      </div>
    </section>

    {/* ── EMPAT UNIT ── */}
    <section className="merged-division-section" id="divisi" aria-labelledby="division-title">
      <div className="merged-shell">
        <div className="merged-section-head merged-section-head-inline"><h2 id="division-title">Pilih unit dari jenis pekerjaan Anda.</h2><p>Setiap unit memiliki halaman sendiri untuk melihat ruang lingkup dan cara menghubungi tim yang tepat.</p></div>
        <div className="merged-division-list">
          {divisions.map((division, index) => <article className="merged-division" key={division.slug}>
            <div className="merged-division-photo"><Image src={division.hero} alt="" fill sizes="(max-width: 720px) 100vw, 32vw" /><span>{division.area}</span></div>
            <div className="merged-division-body"><span className="merged-division-number">0{index + 1} / {directions[index].focus}</span><h3>{division.name}</h3><p className="merged-division-need">{directions[index].need}</p><p>{directions[index].desc}</p><div className="merged-division-purpose"><div><strong>Visi</strong><p>{directions[index].vision}</p></div><div><strong>Misi</strong><p>{directions[index].mission}</p></div></div><Link href={`/unit/${division.slug}`} className="merged-text-link">Lihat halaman {division.name} <span aria-hidden="true">↗</span></Link></div>
          </article>)}
        </div>
      </div>
    </section>

    {/* ── VISI MISI ── */}
    <section className="merged-purpose" aria-labelledby="purpose-title">
      <div className="merged-shell">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 48px" }}>
          {[
            { label: "Visi perusahaan", body: "Menjadi tempat pelanggan dapat memahami pilihan material baja dan jalur pengerjaannya sebelum membuat keputusan." },
            { label: "Misi perusahaan", body: "Menerima kebutuhan dengan jelas, meninjau spesifikasi bersama tim yang sesuai, lalu memberi penawaran dan tindak lanjut yang dapat dipahami pelanggan." },
          ].map((item) => (
            <div key={item.label} style={{ padding: "24px 0", borderTop: "2px solid #dc303a" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{item.label}</h3>
              <p style={{ fontSize: "13px", color: "rgb(195 201 200 / .8)", lineHeight: 1.7 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── KEPERCAYAAN ── */}
    <section className="merged-trust" id="kepercayaan" aria-labelledby="trust-title">
      <div className="merged-shell">
        <div className="merged-section-head" style={{ marginBottom: "24px" }}>
          <div>
            <h2 id="trust-title">Dikenal lewat pekerjaan dan pengalaman pelanggan.</h2>
            <p>Nama perusahaan yang pernah bekerja sama ditampilkan bersama penilaian publik toko Mahameru Baja di Google Maps.</p>
          </div>
        </div>

        {/* compact row: rating + clients side by side */}
        <div style={{ display: "flex", gap: "16px", alignItems: "stretch", flexWrap: "wrap" }}>

          {/* Maps rating */}
          <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer"
            aria-label={`Lihat rating Google Maps ${content.rating.toFixed(1)} dari 5`}
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "6px", minWidth: "200px", padding: "20px 22px", background: "#1a1d1f", borderRadius: "12px", color: "inherit", textDecoration: "none", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: "#aaa" }}>Penilaian Google Maps</span>
            <strong style={{ fontSize: "40px", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{content.rating.toFixed(1)}<small style={{ fontSize: "16px", fontWeight: 500, color: "#888" }}>/5</small></strong>
            <span style={{ fontSize: "11px", color: "#888" }}>{content.reviewCount === null ? "Baca ulasan pelanggan" : `${content.reviewCount} ulasan`} · dilihat {content.ratingDate}</span>
            <em style={{ fontSize: "12px", fontWeight: 600, color: "#fff", fontStyle: "normal", marginTop: "8px" }}>Lihat sumber penilaian ↗</em>
          </a>

          {/* Client logos */}
          <div style={{ flex: 1, padding: "20px 22px", border: "1px solid #e8e9e5", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "16px", color: "#444" }}>Perusahaan yang pernah bekerja sama</h3>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${clientPartners.length}, 1fr)`, gap: "0" }}>
              {clientPartners.map(client => (
                <div key={client.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px 4px", borderLeft: "1px solid #f0f0ec" }}>
                  <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
                    <Image src={client.logo} alt={client.name} fill sizes="44px" style={{ objectFit: "contain" }} />
                  </div>
                  <strong style={{ fontSize: "11px", fontWeight: 700, color: "#333", textAlign: "center" }}>{client.name}</strong>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>;
}
