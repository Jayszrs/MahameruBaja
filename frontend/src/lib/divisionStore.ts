import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { z } from "zod";
import { divisions as seeds } from "../data/divisionContent";
import { divisionIdentity } from "../data/companyIdentity";
import { divisionAbout } from "../data/divisionAbout";
import { garudaLocation } from "../data/divisionLocations";
import { contentOwner, divisionInputSchema, divisionSchema, type Division } from "../data/divisionCms";
import { contactVisibleInDivision } from "../data/siteContent";
import type { AdminIdentity } from "../data/adminAccount";
import { cmsCollection } from "./cmsCollection";
import { CmsError } from "./cmsError";

const epoch = "2026-10-10T00:00:00.000Z";
const initial = () => seeds.map(seed => divisionSchema.parse({ ...seed, ...divisionIdentity[seed.slug],
  useCentralReviews:seed.slug !== "retail-cibitung", id: seed.slug, revision: 0, status: "active", kind: ["retail-tambun", "retail-cibitung", "trading-proyek"].includes(seed.slug) ? "material" : "service",
  aboutHeadline: divisionAbout[seed.slug].headline, values: divisionAbout[seed.slug].values,
  address: seed.slug === "retail-cibitung" ? garudaLocation.address : "Jl. Permata Regensi Blok K1 No. 38–39, Tambun Selatan, Kabupaten Bekasi 17510",
  mapsUrl: seed.slug === "retail-cibitung" ? garudaLocation.mapsUrl : "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8",
  mapEmbed: seed.slug === "retail-cibitung" ? garudaLocation.embedUrl : "https://www.google.com/maps?q=Toko+Besi+Mahameru+Baja+Tambun+Selatan&output=embed",
  createdAt: epoch, updatedAt: epoch,
}));
const collection = cmsCollection("divisions", z.array(divisionSchema), initial);
export const readDivisions = collection.read;
export const readPublicDivisions = cache(async () => {
  const [records, { readSiteContent }] = await Promise.all([readDivisions(), import("./siteContentStore")]);
  const content = await readSiteContent();
  const active = new Set(records.filter(d => d.status === "active").map(d => d.slug));
  const contacts = content.contacts.filter(c => c.published && (!contentOwner(c) || active.has(contentOwner(c)!)));
  return records.filter(d => d.status === "active").map(d => ({ ...d, admins: contacts.filter(c => contactVisibleInDivision(c,d.slug)).map(c => ({ name: c.name, phone: c.whatsapp || c.mobile || c.phone })).filter(c => c.phone) }));
});
export async function editableDivisions(actor: AdminIdentity) { return (await readDivisions()).filter(d => !actor.division || d.slug === actor.division); }
export async function ensureDivision(slug: string, active = false) {
  const division = (await readDivisions()).find(d => d.slug === slug);
  if (!division || (active && division.status !== "active")) throw new CmsError("Divisi tidak tersedia.", 400);
  return division;
}
export function assertDivisionScope(actor: AdminIdentity, slug: string | null | undefined) {
  if (actor.division && actor.division !== slug) throw new CmsError("Anda tidak memiliki akses ke divisi ini.", 403);
}
export async function saveDivision(actor: AdminIdentity, input: unknown, id?: string, revision?: number) {
  const parsed = divisionInputSchema.parse(input);
  await (await import("./cmsMedia")).validateMediaOwnership(parsed,actor);
  return collection.mutate(records => {
    const current = id ? records.find(d => d.id === id) : undefined;
    if (id && !current) throw new CmsError("Divisi tidak ditemukan.", 404);
    if (!current && actor.role !== "super_admin") throw new CmsError("Hanya Super Admin dapat membuat divisi.", 403);
    if (current) {
      assertDivisionScope(actor, current.slug);
      if (current.revision !== revision) throw new CmsError("Profil telah diubah. Muat ulang sebelum menyimpan.", 409);
      if (parsed.slug !== current.slug) throw new CmsError("Alamat divisi terkunci.");
      if (actor.division && parsed.useCentralReviews !== current.useCentralReviews) throw new CmsError("Hanya Super Admin dapat mengatur ulasan pusat.", 403);
      if (actor.division && parsed.status !== current.status) throw new CmsError("Hanya Super Admin dapat mengubah status divisi.", 403);
    }
    if (records.some(d => d.slug === parsed.slug && d.id !== id)) throw new CmsError("Alamat divisi sudah digunakan.", 409);
    if (!current && parsed.status !== "draft") throw new CmsError("Divisi baru harus disimpan sebagai draf terlebih dahulu.");
    if (parsed.status === "active" && [parsed.area, parsed.logo, parsed.title, parsed.intro, parsed.description, parsed.mission, parsed.hero, parsed.address].some(v => !v.trim())) throw new CmsError("Lengkapi area, logo, judul, pengantar, deskripsi, misi, gambar utama, dan alamat sebelum mengaktifkan divisi.");
    if (parsed.status === "active" && (parsed.images.some(image => !image.src.trim() || !image.title.trim()) || parsed.faq.some(item => !item.question.trim() || !item.answer.trim()))) throw new CmsError("Lengkapi gambar dan FAQ yang ditambahkan, atau hapus baris kosong.");
    const now = new Date().toISOString();
    const saved = divisionSchema.parse({ ...current, ...parsed, id: id || randomUUID(), revision: current ? current.revision + 1 : 0, admins: current?.admins || [], createdAt: current?.createdAt || now, updatedAt: now });
    return { value: current ? records.map(d => d.id === id ? saved : d) : [...records, saved], result: saved };
  });
}
export async function deleteDivision(actor: AdminIdentity, id: string, revision: number) {
  if (actor.role !== "super_admin") throw new CmsError("Akses ditolak.", 403);
  return collection.mutate(async records => {
    const current = records.find(d => d.id === id);
    if (!current) throw new CmsError("Divisi tidak ditemukan.", 404);
    if (current.revision !== revision) throw new CmsError("Profil telah diubah. Muat ulang.", 409);
    const [{ readAccounts }, { readSiteContent }, { readRequests }, { readArticles }] = await Promise.all([import("./accountStore"), import("./siteContentStore"), import("./requestStore"), import("./articleStore")]);
    const [accounts, content, requests, articles] = await Promise.all([readAccounts(), readSiteContent(), readRequests(), readArticles()]);
    const slug = current.slug;
    const refers = (v: unknown): boolean => Array.isArray(v) ? v.some(refers) : v !== null && typeof v === "object" ? Object.values(v).some(refers) : typeof v === "string" && (v === slug || v.includes(`/unit/${slug}`) || v.includes(`unit=${slug}`));
    if (accounts.some(a => a.division === slug) || refers(content) || refers(requests) || refers(articles) || records.some(d => d.id !== id && refers(d))) throw new CmsError("Divisi masih memiliki akun, konten, stok, permintaan, atau referensi. Arsipkan untuk mempertahankan riwayat.", 409);
    if (current.status === "active") throw new CmsError("Arsipkan divisi sebelum menghapus.");
    return { value: records.filter(d => d.id !== id), result: { deleted: id } };
  });
}
