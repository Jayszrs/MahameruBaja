import { z } from "zod";

const asset = z.string().trim().max(1000).refine(value => {
  if (/^\/(?:images|media)\/[a-zA-Z0-9/_ .-]+\.(?:jpg|jpeg|png|webp)$/i.test(value) && !value.split("/").some(part => part === ".." || part === ".")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") && /\.(?:jpg|jpeg|png|webp)$/i.test(url.pathname); } catch { return false; }
}, "Gunakan gambar JPG, PNG, atau WebP yang diunggah melalui CMS.");
const photoSchema = z.object({ id: z.string().trim().min(1).max(100), src: asset, alt: z.string().trim().min(1).max(200), caption: z.string().trim().max(400) });
export const galleryProjectSchema = z.object({
  id: z.string().trim().min(1).max(100), title: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  division: z.enum(["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting", "fabrikasi-erection"]),
  description: z.string().trim().max(2000), location: z.string().trim().max(160), year: z.string().trim().max(30),
  photos: z.array(photoSchema).max(40), coverId: z.string().trim().max(100), published: z.boolean(),
}).superRefine((project, ctx) => {
  if (project.published && !project.photos.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["photos"], message: "Tambahkan minimal satu foto sebelum diterbitkan." });
  if (new Set(project.photos.map(p => p.id)).size !== project.photos.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["photos"], message: "ID foto harus unik." });
  if (project.coverId && !project.photos.some(p => p.id === project.coverId)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coverId"], message: "Sampul harus merupakan foto dalam proyek ini." });
});
export const galleryProjectsSchema = z.array(galleryProjectSchema).max(80).superRefine((projects, ctx) => {
  if (new Set(projects.map(p => p.id)).size !== projects.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID proyek harus unik." });
});
export type GalleryProject = z.infer<typeof galleryProjectSchema>;
// Exact albums from supplied company profile pp. 7–17. No client, date,
// completion status or location is inferred when the document does not say it.
const sourceAlbums = [
  ["rumah-villa", "Rumah Tinggal & Villa", "Konstruksi", 8, ""],
  ["welding-robot", "Welding Robot Station", "Fabrikasi & erection", 6, ""],
  ["tower-monopol", "Tower Monopol & ERP", "Fabrikasi & erection", 7, ""],
  ["gedung-arsip", "Gedung Arsip", "Konstruksi", 6, ""],
  ["painting", "Painting", "Finishing", 6, ""],
  ["floor-coating", "Floor Coating", "Finishing", 9, ""],
  ["perkuatan-gedung", "Perkuatan Gedung", "Konstruksi", 9, ""],
  ["lantai-mezanin", "Lantai Mezanin", "Konstruksi", 9, ""],
  ["railing-stainless", "Railing Stainless Steel", "Fabrikasi & erection", 7, ""],
  ["jembatan-ajibata", "Beautifikasi Jembatan Ajibata", "Infrastruktur", 10, "Toba – Samosir"],
  ["jembatan-tanjung-lesung", "Jembatan Pelengkung Tanjung Lesung", "Infrastruktur", 9, "Tanjung Lesung, Banten"],
] as const;
export const defaultGalleryProjects: GalleryProject[] = sourceAlbums.map(([id, title, category, count, location]) => ({
  id, title, category, division: "fabrikasi-erection", description: `Dokumentasi pekerjaan ${title.toLowerCase()} dari pengalaman proyek Mahameru Baja Indonesia. Jelajahi foto untuk melihat material, proses pengerjaan, dan detail di lapangan.`,
  location, year: "", published: true, coverId: `${id}-01`,
  photos: Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return { id: `${id}-${number}`, src: `/images/compro/${id}-${number}.webp`, alt: `${title} — dokumentasi ${index + 1}`, caption: "" };
  }),
}));
export function projectCover(project: GalleryProject) { return project.photos.find(p => p.id === project.coverId) ?? project.photos[0]; }
