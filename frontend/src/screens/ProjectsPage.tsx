"use client";
import PublicText, { PublicSection } from "../components/PublicText";
import RotatingHeroMedia from "../components/RotatingHeroMedia";
import { Link } from "react-router";
import { laserImage } from "../data/business";
import ProjectAlbums from "../components/ProjectAlbums";
import type { GalleryProject } from "../data/projectGallery";

export default function ProjectsPage({ projects = [], categoryOrder }: { projects?: GalleryProject[]; categoryOrder?: string[] }) {
  return <PublicText>
    <PublicSection section="project-opening" page="gallery"><section id="galeri-proyek-pembuka" className="projects-hero" aria-labelledby="projects-hero-heading">
      <RotatingHeroMedia className="projects-parallax-media" images={[laserImage,"/images/steel-indonesia/toko-mahameru.jpg","/images/steel-indonesia/besi-beton.jpg"]} />
      <div className="projects-hero-shade" aria-hidden="true" />
      <div className="home-grid" aria-hidden="true" />
      <div className="home-shell projects-hero-content" data-reveal>
        <nav aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>Proyek</span></nav>
        <h1 id="projects-hero-heading">Dari proses sampai hasil pekerjaan.</h1>
        <p>Jelajahi dokumentasi proyek Mahameru Baja.</p>
      </div>
    </section></PublicSection>
    <PublicSection section="albums" page="gallery"><ProjectAlbums projects={projects} categoryOrder={categoryOrder} /></PublicSection>
    <PublicSection section="cta" page="gallery"><section id="proyek-cta" className="projects-cta" aria-label="Konsultasi proyek">
      <div className="home-shell" data-reveal>
        <h2>Punya rencana proyek?</h2><p>Kirim daftar kebutuhan atau gambar kerja ke tim kami.</p>
        <div className="home-actions"><Link to="/minta-penawaran" className="home-button home-button-primary">Minta penawaran</Link><Link to="/produk" className="home-button home-button-ghost">Lihat produk</Link></div>
      </div>
    </section></PublicSection>
  </PublicText>;
}
