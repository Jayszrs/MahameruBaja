import ProjectsPage from "../../src/screens/ProjectsPage";
import { connection } from "next/server";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Galeri Proyek, Material Baja & Fabrikasi", description: "Jelajahi album pengalaman proyek Mahameru Baja: lantai mezanin, fabrikasi, jembatan, konstruksi, serta dokumentasi material dan toko.", alternates: { canonical: "/proyek" } };
export default async function Page() {
  await connection();
  const content = await readPublicSiteContent();
  const categoryList=content.sectionLists.find(row=>row.page==="gallery"&&row.section==="albums"&&!row.ownerDivision&&row.key==="galleryCategories");
  const categoryOrder=categoryList?.rows.map(row=>String(row.label||"")).filter(Boolean);
  return <ProjectsPage projects={content.galleryProjects.filter(p => p.published && p.kind !== "design" && p.kind !== "activity" && p.photos.length)} categoryOrder={categoryOrder} />;
}
