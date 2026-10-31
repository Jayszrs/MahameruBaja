import Link from "next/link";
import WebsitePhotoGallery from "../../src/components/WebsitePhotoGallery";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { readPublishedArticles } from "../../src/lib/articleStore";
import { collectWebsitePhotos } from "../../src/data/websitePhotos";
export const metadata = { title: "Galeri Foto Mahameru Baja", description: "Seluruh foto publik Mahameru Baja: produk, referensi desain, proyek, kegiatan, divisi, dan layanan.", alternates: { canonical: "/galeri" } };
export default async function Page() {
  const [content, divisions, articles] = await Promise.all([readPublicSiteContent(), readPublicDivisions(), readPublishedArticles()]);
  return <div className="company-activity-page"><div className="home-shell"><p className="industrial-eyebrow">MAHAMERU BAJA INDONESIA</p><h1>Galeri foto</h1><p>Lihat seluruh foto yang sudah diterbitkan di website kami.</p><nav className="home-actions"><Link href="/proyek" className="home-button home-button-dark">Lihat proyek</Link><Link href="/jasa#album-desain" className="home-button">Album desain jasa ↗</Link></nav></div><WebsitePhotoGallery photos={collectWebsitePhotos(content, divisions, articles)} /></div>;
}
