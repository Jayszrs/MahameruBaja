"use client";
import Link from "next/link";
import RotatingHeroMedia from "./RotatingHeroMedia";
import PublicText, { PublicSection } from "./PublicText";

export default function SocialPageHero({ images, divisionName, activeDivision = "", divisions }: { images: string[]; divisionName?: string; activeDivision?: string; divisions: { slug: string; name: string }[] }) {
  return <PublicText><PublicSection section="opening"><section className="social-page-hero" id="sosial-hero">
    <RotatingHeroMedia className="social-hero-media" images={images} />
    <div className="industrial-container"><nav aria-label="Breadcrumb" data-cms-static><Link href="/">Beranda</Link><span>/</span><span>Sosial media</span></nav>
      <p className="industrial-eyebrow" data-cms-static>{divisionName || "MAHAMERU BAJA"} / SOSIAL MEDIA</p><h1>Ikuti kabar<br /><em>dan kegiatan kami.</em></h1><p>Lihat produk, proses pengerjaan, dan kabar terbaru melalui akun resmi kami.</p>
      <nav className="social-division-filter" aria-label="Pilih divisi sosial media" data-cms-static><Link href="/sosial-media" aria-current={!activeDivision ? "page" : undefined}>Semua divisi</Link>{divisions.map(d=><Link key={d.slug} href={`/sosial-media?divisi=${d.slug}`} aria-current={activeDivision===d.slug?"page":undefined}>{d.name}</Link>)}</nav>
    </div></section></PublicSection></PublicText>;
}
