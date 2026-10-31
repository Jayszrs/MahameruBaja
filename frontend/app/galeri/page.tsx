import Link from "next/link";
import PublicText from "../../src/components/PublicText";
import ProjectAlbums from "../../src/components/ProjectAlbums";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Galeri Kegiatan Mahameru Baja", description: "Album kegiatan dan kebersamaan tim Mahameru Baja Indonesia.", alternates: { canonical: "/galeri" } };
export default async function Page() {
  const content = await readPublicSiteContent();
  return <PublicText><div className="company-activity-page"><div className="home-shell"><h1>Galeri kegiatan Mahameru</h1><p>Kebersamaan tim, acara perusahaan, dan aktivitas sehari-hari di Mahameru Baja.</p><nav className="home-actions"><Link href="/proyek" className="home-button home-button-dark">Lihat hasil pekerjaan</Link><Link href="/jasa#album-desain" className="home-button">Jelajahi desain ↗</Link></nav></div><ProjectAlbums sectionId="kegiatan-mahameru" title="Album kegiatan" description="Foto kegiatan asli Mahameru yang sudah diterbitkan oleh tim." projects={content.galleryProjects.filter(project=>project.kind === "activity")} /></div></PublicText>;
}
