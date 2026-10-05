import Image from "next/image";
import Link from "next/link";
import { divisions } from "../../src/data/divisionContent";

export const metadata = {
  title: "Empat Divisi: Retail, Trading & Laser Cutting",
  description: "Pilih divisi Mahameru Baja: retail besi Tambun, Garuda Marginal Baja Cibitung, trading material proyek, atau jasa laser cutting dan CNC bending di Bekasi.",
  alternates: { canonical: "/divisi" },
};

export default function DivisiPage() {
  return <div className="division-index-page">
    <section className="division-index-hero"><div className="division-index-hero-media" data-parallax="0.2"><Image src="/images/hero-steel-warehouse-v2.png" alt="" fill priority sizes="100vw" /></div><div className="industrial-container" data-reveal><p className="industrial-eyebrow">MAHAMERU BAJA / EKOSISTEM BISNIS</p><h1>Empat divisi.<br /><span>Satu jalur yang jelas.</span></h1><p>Pilih unit sesuai jenis pekerjaan. Dari pembelian material hingga pemotongan plat berdasarkan gambar kerja.</p></div></section>
    <section className="division-index-list"><div className="industrial-container"><div className="division-section-heading" data-reveal><p className="industrial-eyebrow">TEMUKAN UNIT YANG TEPAT</p><h2>Ke mana kebutuhan Anda?</h2></div><div className="division-index-cards">{divisions.map((division, index) => <Link href={`/unit/${division.slug}`} prefetch key={division.slug} data-reveal><div className="division-index-image" data-parallax="0.1"><Image src={division.hero} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="division-index-card-shade" /><span className="division-index-number">0{index + 1} / 04</span><div><small>{division.label} / {division.area}</small><h2>{division.name}</h2><p>{division.intro}</p><strong>Masuk ke divisi <span aria-hidden="true">↗</span></strong></div></Link>)}</div></div></section>
  </div>;
}
