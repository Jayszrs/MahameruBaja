import Link from "next/link";
import PublicText from "../../src/components/PublicText";
import WebsitePhotoGallery from "../../src/components/WebsitePhotoGallery";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { readPublishedArticles } from "../../src/lib/articleStore";
import { collectWebsitePhotos } from "../../src/data/websitePhotos";
export const metadata = { title: "Galeri Kegiatan Mahameru Baja", description: "Album kegiatan dan kebersamaan tim Mahameru Baja Indonesia.", alternates: { canonical: "/galeri" } };
export default async function Page() {
  const [content, divisions, articles] = await Promise.all([readPublicSiteContent(), readPublicDivisions(), readPublishedArticles()]);
  const photos = collectWebsitePhotos(content, divisions, articles).filter(photo => !photo.categories.some(category => ["Logo & identitas", "Tim", "Promosi"].includes(category)));
  return <PublicText><div className="company-activity-page"><div className="home-shell"><h1>Galeri kegiatan Mahameru</h1><p>Jelajahi foto kegiatan, pekerjaan, material, dan referensi yang sudah dipublikasikan.</p><nav className="home-actions"><Link href="/proyek" className="home-button home-button-dark">Lihat hasil pekerjaan</Link><Link href="/jasa#album-desain" className="home-button">Jelajahi desain ↗</Link></nav></div><WebsitePhotoGallery photos={photos} /></div></PublicText>;
}
