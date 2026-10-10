import "server-only";
import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { defaultSiteContent, siteContentSchema, type SiteContent } from "../data/siteContent";
import { readPreviewBlob, usingPreviewBlob, writePreviewBlob } from "./previewBlobStore";
import { additionalPromotions } from "../data/promotions";
import { mergeInventory } from "../data/inventory";
import { verifiedInstagramPosts } from "../data/socialMedia";
import { replaceCmsFile, withCmsFileLock } from "./cmsFileLock";

// Local/self-hosted storage. Mount this directory on a persistent volume in production.
const file = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "site-content.json");
function updatedIdentity(content: SiteContent): SiteContent {
  if (content.garudaReviewVersion < 1) {
    // Populate only the old empty Garuda profile. Preserve curated reviews and
    // aggregate edits; once saved, deleted/unpublished quotes stay that way.
    content = { ...content, garudaReviewVersion: 1, garudaReviews: {
      ...content.garudaReviews,
      reviews: content.garudaReviews.reviews.length ? content.garudaReviews.reviews : defaultSiteContent.garudaReviews.reviews,
    } };
  }
  if (content.showcaseVersion < 1) {
    const ids = new Set(content.promotions.map(p => p.id));
    const postIds = new Set(content.socialPosts.map(p => p.id));
    content = { ...content, showcaseVersion: 1, promotions: [...content.promotions, ...additionalPromotions.filter(p => !ids.has(p.id))].slice(0, 20), socialPosts: [...content.socialPosts, ...verifiedInstagramPosts.filter(p => !postIds.has(p.id))].slice(0, 60) };
  }
  if (content.identityVersion >= 1) return content;
  const known = new Set(defaultSiteContent.contacts.map(c => c.id));
  const demoIds = new Set(["tema-merdeka", "tema-ramadan", "promo-proyek", "promo-laser"]);
  const legacyHandles = new Set(["@mahamerubajaindonesia", "@mahameru.baja.ind", "@MahameruBajaIndonesia", ""]);
  const newHandles = new Set(defaultSiteContent.socialAccounts.map(a=>`${a.platform}:${a.handle}`));
  return { ...content, identityVersion: 1, contacts: [...defaultSiteContent.contacts, ...content.contacts.filter(c => !known.has(c.id) && !["satria", "ipung", "andra"].includes(c.id))], socialAccounts: [...defaultSiteContent.socialAccounts, ...content.socialAccounts.filter(a=>!legacyHandles.has(a.handle) && !newHandles.has(`${a.platform}:${a.handle}`))], promotions: [...(content.promotions.some(p=>p.id === "layanan-laser") ? [] : defaultSiteContent.promotions.filter(p=>p.id === "layanan-laser")), ...content.promotions.map(p=>demoIds.has(p.id) ? {...p,published:false}:p)] };
}
function mergeContent(current: SiteContent, input: SiteContent, base?: SiteContent): SiteContent {
  if (current.revision === input.revision) return { ...input, revision: current.revision + 1 };
  if (!base || base.revision !== input.revision) throw new Error("CMS_CONFLICT");
  const merged = { ...current };
  for (const key of Object.keys(input) as (keyof SiteContent)[]) {
    if (key === "revision" || JSON.stringify(input[key]) === JSON.stringify(base[key])) continue;
    if (key === "inventory") { merged.inventory = mergeInventory(current.inventory, input.inventory, base.inventory); continue; }
    if (JSON.stringify(current[key]) !== JSON.stringify(base[key])) throw new Error("CMS_CONFLICT");
    Object.assign(merged, { [key]: input[key] });
  }
  return { ...merged, revision: current.revision + 1 };
}
export async function readSiteContent(): Promise<SiteContent> {
  if (usingPreviewBlob()) return updatedIdentity((await readPreviewBlob("site-content", siteContentSchema, defaultSiteContent)).value);
  try { return updatedIdentity(siteContentSchema.parse(JSON.parse(await readFile(file, "utf8")))); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(defaultSiteContent);
    throw error;
  }
}
export async function writeSiteContent(input: SiteContent, base?: SiteContent) {
  if (usingPreviewBlob()) {
    const current = await readPreviewBlob("site-content", siteContentSchema, defaultSiteContent);
    const saved = siteContentSchema.parse(mergeContent(updatedIdentity(current.value), input, base));
    if (!await writePreviewBlob("site-content", current.revision, saved)) throw new Error("CMS_CONFLICT");
    return saved;
  }
  return withCmsFileLock(file, async () => {
    const temp = `${file}.${randomUUID()}.tmp`;
    try {
      const current = await readSiteContent();
      const saved = siteContentSchema.parse(mergeContent(current, input, base));
      await writeFile(temp, JSON.stringify(saved, null, 2), "utf8");
      await replaceCmsFile(temp, file);
      return saved;
    } finally { await unlink(temp).catch(() => {}); }
  });
}
