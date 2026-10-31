import ProjectAlbums from "./ProjectAlbums";
import type { GalleryProject } from "../data/projectGallery";
export default function ServiceAlbums({ projects }: { projects: GalleryProject[] }) {
  const services = projects.filter(project => project.published && project.photos.length && ["laser-cutting", "fabrikasi-erection"].includes(project.division));
  return <div className="service-albums">
    <ProjectAlbums sectionId="album-desain" title="Album desain & referensi" description="Pilih ide ornamen, panel, atau komponen untuk dibahas dengan tim. Album ini berisi referensi desain, bukan bukti hasil pekerjaan." projects={services.filter(project => project.kind === "design")} />
    <ProjectAlbums sectionId="portofolio-jasa" title="Portofolio hasil pekerjaan" description="Dokumentasi proyek nyata: material, proses pengerjaan, dan hasil di lapangan. Pilih kategori atau buka album untuk melihat foto." projects={services.filter(project => !project.kind || project.kind === "portfolio")} />
  </div>;
}
