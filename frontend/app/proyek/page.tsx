import ProjectsPage from "../../src/screens/ProjectsPage";
import { connection } from "next/server";
import { readSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Galeri Proyek, Material Baja & Fabrikasi", description: "Jelajahi album pengalaman proyek Mahameru Baja: lantai mezanin, fabrikasi, jembatan, konstruksi, serta dokumentasi material dan toko.", alternates: { canonical: "/proyek" } };
export default async function Page() {
  await connection();
  const content = await readSiteContent();
  return <ProjectsPage projects={content.galleryProjects.filter(p => p.published && p.photos.length)} />;
}
