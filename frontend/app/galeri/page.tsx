import Link from "next/link";
import ProjectAlbums from "../../src/components/ProjectAlbums";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Galeri Kegiatan | Mahameru Baja", description: "Dokumentasi kegiatan, acara, dan aktivitas perusahaan Mahameru Baja Indonesia.", alternates: { canonical: "/galeri" } };
export default async function Page() {
  const content = await readPublicSiteContent();
  return <div className="company-activity-page"><div className="home-shell"><p className="industrial-eyebrow">MAHAMERU BAJA INDONESIA</p><h1>Galeri kegiatan</h1><p>Kabar dalam gambar: kegiatan, acara, dan kebersamaan tim Mahameru.</p><nav className="home-actions"><Link href="/proyek" className="home-button home-button-dark">Lihat proyek</Link><Link href="/jasa#album-desain" className="home-button">Album desain jasa ↗</Link></nav></div><ProjectAlbums title="Kegiatan perusahaan" description="Foto kegiatan yang diterbitkan tim Mahameru." projects={content.galleryProjects.filter(project => project.kind === "activity")} /></div>;
}
