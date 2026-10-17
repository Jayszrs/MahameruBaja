import "server-only";
import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { contentOwner, type ContentOwnership } from "../data/divisionCms";
import { accountDivisionSlugs } from "../data/socialMedia";
import type { AdminIdentity } from "../data/adminAccount";
import type { SiteContent } from "../data/siteContent";
import { CmsError } from "./cmsError";
import { readDivisions } from "./divisionStore";

export const emptyReviews = () => ({ rating: 0, reviewCount: null, ratingDate: "Belum dicatat", mapsUrl: "https://maps.google.com/", reviews: [] });
export const collectionKeys = ["contacts", "reviews", "socialAccounts", "socialPosts", "promotions", "heroSlides", "galleryProjects", "websiteTexts"] as const;
type Owned = ContentOwnership & { id?: string; division?: string; divisions?: string[]; platform?: string; handle?: string };
export function normalizeOwnership(content: SiteContent): SiteContent {
  const next = structuredClone(content);
  for (const key of collectionKeys) Object.assign(next, { [key]: next[key].map((row: Owned) => {
    const fallback = key === "socialAccounts" ? accountDivisionSlugs(row as SiteContent["socialAccounts"][number]) : [];
    return { ...row, ...(key === "socialAccounts" && !row.id ? { id: `social-${createHash("sha256").update(`${row.platform}:${row.handle}`).digest("hex").slice(0, 20)}` } : {}), ownerDivision: row.ownerDivision !== undefined ? row.ownerDivision : contentOwner(row) || (fallback.length === 1 ? fallback[0] : null) };
  }) });
  return next;
}
export function scopeContent(content: SiteContent, actor: AdminIdentity): SiteContent {
  if (!actor.division) return content;
  const slug = actor.division;
  const next = structuredClone(content);
  for (const key of collectionKeys) Object.assign(next, { [key]: next[key].filter(row => contentOwner(row) === slug) });
  next.inventory = next.inventory.filter(row => row.division === slug);
  Object.assign(next, emptyReviews());
  next.garudaReviews = slug === "retail-cibitung" ? content.garudaReviews : emptyReviews();
  next.divisionReviews = content.divisionReviews[slug] ? { [slug]: content.divisionReviews[slug] } : {};
  return next;
}
export function reviewProfileFor(content: SiteContent, slug: string) { return slug === "retail-cibitung" ? content.garudaReviews : content.divisionReviews[slug] || emptyReviews(); }
function equal(a: unknown, b: unknown) { return isDeepStrictEqual(a,b); }
function mergeRows(current: Owned[], input: Owned[], base: Owned[]) {
  const a = new Map(current.map(row => [row.id, row])); const b = new Map(base.map(row => [row.id, row])); const c = new Map(input.map(row => [row.id, row]));
  for (const id of new Set([...b.keys(), ...c.keys()])) {
    if (!id || equal(b.get(id), c.get(id))) continue;
    if (!equal(a.get(id), b.get(id))) throw new CmsError("Konten telah diubah admin lain. Muat ulang sebelum menyimpan.", 409);
    if (c.has(id)) a.set(id, c.get(id)!); else a.delete(id);
  }
  // Reorder only the slots owned by this editor. Moving a division's rows to
  // the front would silently reorder the public feed for every other division.
  // Concurrent additions absent from this editor keep their existing position.
  const ids = new Set(input.map(row => row.id));
  const ordered = input.map(row => a.get(row.id)).filter((row): row is Owned => Boolean(row));
  let index = 0;
  return [...a.values()].map(row => ids.has(row.id) ? ordered[index++] : row);
}
export async function mergeScopedContent(current: SiteContent, input: SiteContent, base: SiteContent | undefined, actor: AdminIdentity): Promise<SiteContent> {
  if (!base || base.revision !== input.revision) throw new CmsError("Muat ulang halaman sebelum menyimpan.", 409);
  await (await import("./cmsMedia")).validateMediaOwnership(input,actor);
  const before = scopeContent(current, actor); const slug = actor.division;
  if (!equal(input.inventory, base.inventory)) throw new CmsError("Ubah stok melalui Produk & stok.", 403);
  const known = new Set((await readDivisions()).map(d => d.slug));
  const next = { ...current };
  for (const key of collectionKeys) {
    const rows = input[key] as Owned[]; const baseRows = base[key] as Owned[];
    const originals = new Map((current[key] as Owned[]).map(row => [row.id, row]));
    if (new Set(rows.map(row => row.id)).size !== rows.length || rows.some(row => !row.id)) throw new CmsError("ID konten harus terisi dan unik.");
    for (const row of rows) {
      const previous = originals.get(row.id);
      if (slug && previous && contentOwner(previous) !== slug) throw new CmsError("Konten ini milik divisi lain.", 403);
      if (slug && ((row.ownerDivision !== undefined && row.ownerDivision !== slug) || row.division !== previous?.division && row.division && row.division !== slug || !equal(row.divisions, previous?.divisions) && row.divisions?.some(d => d !== slug) || !equal(row.audience, previous?.audience) && row.audience?.some(d => d !== slug) || previous?.audience !== undefined && !equal(row.audience,previous.audience))) throw new CmsError("Penugasan dan penayangan lintas divisi hanya dapat diatur Super Admin.", 403);
      if (slug) row.ownerDivision = slug;
      if ([contentOwner(row), ...(row.divisions || []), ...(row.audience || [])].some(d => d && !known.has(d))) throw new CmsError("Divisi tidak dikenal.");
    }
    if (slug && baseRows.some(row => contentOwner(row) !== slug)) throw new CmsError("Data dasar memuat divisi lain.", 403);
    // Only merge rows actually changed by this editor. Unrelated collections stay current.
    if (!equal(rows, baseRows)) Object.assign(next, { [key]: mergeRows(current[key] as Owned[], rows, baseRows) });
  }
  const scalarKeys = ["rating", "reviewCount", "ratingDate", "mapsUrl", "garudaReviews", "divisionReviews"] as const;
  for (const key of scalarKeys) {
    if (equal(input[key], base[key])) continue;
    if (slug && !["garudaReviews", "divisionReviews"].includes(key)) throw new CmsError("Ringkasan ulasan pusat hanya dapat dikelola Super Admin.", 403);
    if (key === "divisionReviews") {
      if (slug && [...Object.keys(input.divisionReviews), ...Object.keys(base.divisionReviews)].some(d => d !== slug)) throw new CmsError("Profil ulasan ini milik divisi lain.", 403);
      const profiles = { ...current.divisionReviews };
      for (const d of new Set([...Object.keys(input.divisionReviews), ...Object.keys(base.divisionReviews)])) {
        if (!known.has(d)) throw new CmsError("Divisi tidak dikenal.");
        if (equal(input.divisionReviews[d], base.divisionReviews[d])) continue;
        if (!equal(current.divisionReviews[d], base.divisionReviews[d])) throw new CmsError("Profil ulasan telah diubah.", 409);
        if (input.divisionReviews[d]) profiles[d] = input.divisionReviews[d]; else delete profiles[d];
      }
      next.divisionReviews = profiles; continue;
    }
    if (slug && key === "garudaReviews" && slug !== "retail-cibitung") throw new CmsError("Profil Garuda milik Retail Cibitung.", 403);
    if (!equal(before[key], base[key])) throw new CmsError("Ringkasan ulasan telah diubah. Muat ulang.", 409);
    Object.assign(next, { [key]: input[key] });
  }
  return next;
}
export function publicOwned(row: ContentOwnership & { division?: string; divisions?: string[] }, active: Set<string>) { const owner = contentOwner(row); return !owner || active.has(owner); }
export function visibleInDivision(row: ContentOwnership & { division?: string; divisions?: string[] }, slug: string) { return row.audience ? row.audience.includes(slug) : contentOwner(row) === slug || row.divisions?.includes(slug) || false; }
