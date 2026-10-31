import ProjectAlbums from "./ProjectAlbums";
import type { GalleryProject } from "../data/projectGallery";
export default function ServiceAlbums({ projects }: { projects: GalleryProject[] }) {
  const services = projects.filter(project => project.published && project.photos.length && ["laser-cutting", "fabrikasi-erection"].includes(project.division));
  return <div className="service-albums">
    <ProjectAlbums sectionId="album-desain" title="Jelajahi desain" description="Cari ide ornamen, panel, dan komponen untuk kebutuhan Anda. Foto ini merupakan referensi desain dari sumber yang dicantumkan pada album." projects={services.filter(project => project.kind === "design")} />
    <ProjectAlbums sectionId="portofolio-jasa" title="Portofolio hasil pekerjaan" description="Dokumentasi proyek nyata: material, proses pengerjaan, dan hasil di lapangan. Pilih kategori atau buka album untuk melihat foto." projects={services.filter(project => !project.kind || project.kind === "portfolio")} />
  </div>;
}
