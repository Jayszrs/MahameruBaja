import Image from "next/image";
import Link from "next/link";

type Props = { variant?: "workshop" | "company" | "services"; href?: string };
const stories = {
  workshop: { eyebrow: "IDE, MATERIAL, KEMUNGKINAN", title: "Dibayangkan Anda.", accent: "Dibentuk bersama.", description: "Dari potongan plat sampai detail arsitektur. Jelajahi material, bicarakan gambar kerja, lalu temukan proses yang sesuai untuk ide Anda.", main: "/images/laser-cutting-illustration.jpg", detail: "/images/cnc-bending-visual-v1.png", label: "CUT / FOLD / FORM", cta: "Jelajahi laser cutting" },
  company: { eyebrow: "MENGENAL MAHAMERU BAJA", title: "Bertemu material.", accent: "Terhubung manusia.", description: "Di balik setiap kebutuhan ada rencana yang berbeda. Kami mempertemukan konsultasi, material, dan proses melalui lima jalur layanan Mahameru Baja.", main: "/images/steel-indonesia/toko-mahameru.jpg", detail: "/images/steel-indonesia/besi-beton.jpg", label: "RETAIL / TRADING / PRODUCTION", cta: "Kenali lima divisi" },
  services: { eyebrow: "DARI SKETSA KE PEKERJAAN", title: "Satu ide.", accent: "Banyak kemungkinan.", description: "Material bangunan, suplai proyek, atau komponen custom. Mulai dari kebutuhan Anda, lalu pilih jalur konsultasi dan pengerjaan yang tepat.", main: "/images/cnc-bending-visual-v1.png", detail: "/images/laser-cutting-illustration.jpg", label: "MATERIAL / PROCESS / DETAIL", cta: "Diskusikan kebutuhan" },
};

export default function MaterialCollage({ variant = "workshop", href }: Props) {
  const story = stories[variant];
  return <section className={`material-editorial material-editorial-${variant}`} id={`material-${variant}`}>
    <div className="industrial-container material-editorial-layout">
      <div className="material-editorial-copy" data-reveal>
        <p className="industrial-eyebrow">{story.eyebrow}</p>
        <h2>{story.title}<br /><em>{story.accent}</em></h2>
        <p>{story.description}</p>
        <Link className="editorial-link" href={href || (variant === "company" ? "/tentang-kami#divisi" : variant === "services" ? "/minta-penawaran" : "/jasa#laser-cutting")}><span>{story.cta}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></Link>
        <div className="material-editorial-foot"><span>01 / MATERIAL</span><span>02 / PROSES</span><span>03 / BENTUK</span></div>
      </div>
      <div className="material-collage" aria-label="Kolase material dan proses Mahameru Baja">
        <div className="collage-orbit" aria-hidden="true" />
        <figure className="collage-main" data-reveal><div data-parallax="0.13"><Image src={story.main} alt={variant === "company" ? "Toko Mahameru Baja di Tambun" : "Ilustrasi proses pengerjaan material logam"} fill sizes="(max-width: 760px) 75vw, 38vw" /></div></figure>
        <figure className="collage-detail" data-reveal><div data-parallax="0.08"><Image src={story.detail} alt={variant === "company" ? "Detail material besi beton" : "Ilustrasi detail produksi logam"} fill sizes="(max-width: 760px) 45vw, 22vw" /></div><figcaption>{variant === "company" ? "DARI MATERIAL, UNTUK RENCANA ANDA" : "EKSPLORASI BENTUK & MATERIAL"}</figcaption></figure>
        <span className="collage-stamp" aria-hidden="true"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M30 6v48M6 30h48M13 13l34 34M13 47 47 13M21 8l18 44M8 21l44 18M8 39l44-18M21 52 39 8" /></svg><small>MAHAMERU<br />BAJA INDONESIA</small></span>
        <span className="collage-side-note">{story.label}</span>
      </div>
    </div>
  </section>;
}
