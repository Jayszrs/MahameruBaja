import { z } from "zod";
import { safeHttpsUrl, safeInternalLink, safeLocalAsset } from "./safeUrls";
export const divisionSlugSchema = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const assetUrl = z.string().trim().max(2000).refine(v => !v || safeLocalAsset(v, ["images", "media", "api/cms/media", "api/articles/media"]) || safeHttpsUrl(v), "Gunakan unggahan CMS atau URL HTTPS.");
const text = (max: number) => z.string().trim().max(max);
export const divisionSchema = z.object({
  id: z.string().min(1), slug: divisionSlugSchema, revision: z.number().int().nonnegative(), status: z.enum(["draft", "active", "archived"]),
  sortOrder: z.number().int().safe().optional(),
  useCentralReviews: z.boolean().default(false), name: text(160).min(1), label: text(100).min(1), kind: z.enum(["material", "service"]), area: text(200),
  logo: assetUrl, title: text(250), intro: text(1000), description: text(5000), mission: text(2000),
  aboutHeadline: text(250), values: z.array(text(500)).max(12), hero: assetUrl,
  routeMedia: z.object({type:z.enum(["image","video"]),media:assetUrl,poster:assetUrl.optional()}).nullable().default(null),
  images: z.array(z.object({ src: assetUrl, title: text(200) })).max(20),
  offerings: z.array(text(250)).max(30), process: z.array(text(500)).max(12),
  offeringDescriptions: z.record(text(250).min(1), text(2000)).default({}),
  faq: z.array(z.object({ question: text(300), answer: text(2000) })).max(30),
  address: text(1000), mapsUrl: text(1000).refine(v => !v || /^https:\/\/(?:maps\.app\.goo\.gl|goo\.gl|(?:www\.)?google\.(?:com|co\.id))\//.test(v), "Gunakan tautan Google Maps HTTPS."),
  mapEmbed: text(1500).refine(v => !v || /^https:\/\/(?:www\.)?google\.(?:com|co\.id)\/maps(?:[/?])/.test(v), "Gunakan URL embed Google Maps."),
  primary: z.object({ label: text(100), href: text(250).refine(v => !v || v.startsWith("/") && safeInternalLink(v), "Gunakan tujuan di dalam website.") }), quote: text(250).refine(v => !v || v.startsWith("/") && safeInternalLink(v), "Gunakan tujuan di dalam website."),
  admins: z.array(z.object({ name: text(120), phone: text(40) })).max(20), createdAt: z.string(), updatedAt: z.string(),
});
export const divisionInputSchema = divisionSchema.omit({ id: true, revision: true, sortOrder: true, createdAt: true, updatedAt: true, admins: true });
export type Division = z.infer<typeof divisionSchema>;
export function orderedDivisions(records: Division[]) { return [...records].sort((left, right) => (left.sortOrder ?? Number.MAX_SAFE_INTEGER) - (right.sortOrder ?? Number.MAX_SAFE_INTEGER)); }
export const ownershipFields = { ownerDivision: divisionSlugSchema.nullable().optional(), audience: z.array(divisionSlugSchema).max(100).optional() };
export type ContentOwnership = { ownerDivision?: string | null; audience?: string[] };
export function contentOwner(item: ContentOwnership & { division?: string; divisions?: string[] }) {
  if (item.ownerDivision !== undefined) return item.ownerDivision;
  return item.division || (item.divisions?.length === 1 ? item.divisions[0] : null);
}

export function visibleInDivision(row: ContentOwnership & {division?:string;divisions?:string[]},slug:string) {return row.audience ? row.audience.includes(slug) : contentOwner(row) === slug || row.divisions?.includes(slug) || false;}
