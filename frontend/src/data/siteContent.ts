import { z } from "zod";
import { socialAccountSchema, socialPostSchema, defaultSocialAccounts, defaultSocialPosts } from "./socialMedia";
import { googleRating, googleReviewCount, googleReviews, googleReviewsCapturedAt } from "./googleReviews";
import { promotionSchema, samplePromotions, additionalPromotions } from "./promotions";
import { divisionIdentity } from "./companyIdentity";
import { heroSlides, heroSlideSchema } from "./heroSlides";
import { defaultGarudaReviews } from "./divisionLocations";
import { inventoryListSchema, defaultInventory } from "./inventory";
import { galleryProjectsSchema, defaultGalleryProjects } from "./projectGallery";

export const divisionSlugs = ["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting", "fabrikasi-erection"] as const;
const text = (max: number) => z.string().trim().max(max);
function isHttps(value: string) { try { return new URL(value).protocol === "https:"; } catch { return false; } }
const webUrl = text(1000).refine(value => !value || isHttps(value), "Gunakan URL HTTPS");
const googleUrl = webUrl.refine(value => {
  try {
    const host = new URL(value).hostname;
    return host === "maps.app.goo.gl" || host === "goo.gl" || host === "google.com" || host.endsWith(".google.com") || host === "google.co.id" || host.endsWith(".google.co.id");
  } catch { return false; }
}, "Gunakan tautan sumber Google Maps");
const photo = text(1000).refine(value => !value || /^\/(?:images|media)\/[a-zA-Z0-9/_ .-]+$/.test(value) || isHttps(value), "Gunakan /images/... atau URL HTTPS");
const phone = text(30).refine(value => !value || /^\+?[\d ()-]{7,30}$/.test(value), "Nomor telepon tidak valid");
export const contactSchema = z.object({
  id: text(80).min(1), name: text(100).min(1), role: text(100).min(1),
  phone, mobile: phone, whatsapp: phone,
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  photo, divisions: z.array(z.enum(divisionSlugs)).max(5), published: z.boolean(),
});
export const reviewSchema = z.object({
  id: text(80).min(1), author: text(100).min(1), rating: z.number().int().min(1).max(5),
  text: text(2000).min(1), when: text(100), url: googleUrl,
  authorPhoto: photo.optional(), authorUrl: googleUrl.optional(), published: z.boolean(),
});
export const reviewProfileSchema = z.object({
  rating: z.number().min(0).max(5), reviewCount: z.number().int().min(0).nullable(),
  ratingDate: text(80).min(1), mapsUrl: googleUrl, reviews: z.array(reviewSchema).max(200),
}).superRefine((profile, ctx) => {
  if (new Set(profile.reviews.map(r => r.id)).size !== profile.reviews.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reviews"], message: "ID ulasan harus unik" });
});
export const siteContentSchema = z.object({
  revision: z.number().int().min(0),
  identityVersion: z.number().int().min(0).default(0),
  showcaseVersion: z.number().int().min(0).default(0),
  garudaReviewVersion: z.number().int().min(0).default(0),
  inventory: inventoryListSchema.default(defaultInventory),
  galleryProjects: galleryProjectsSchema.default(defaultGalleryProjects),
  heroSlides: z.array(heroSlideSchema).min(1).max(10).default(heroSlides),
  contacts: z.array(contactSchema).max(40),
  reviews: z.array(reviewSchema).max(200),
  garudaReviews: reviewProfileSchema.default(defaultGarudaReviews),
  socialAccounts: z.array(socialAccountSchema).max(20).default(defaultSocialAccounts),
  socialPosts: z.array(socialPostSchema).max(60).default(defaultSocialPosts),
  promotions: z.array(promotionSchema).max(20).default([...samplePromotions, ...additionalPromotions]),
  rating: z.number().min(0).max(5), reviewCount: z.number().int().min(0).nullable(),
  ratingDate: text(80).min(1), mapsUrl: googleUrl,
}).superRefine((data, ctx) => {
  for (const key of ["contacts", "reviews", "socialPosts", "heroSlides"] as const) {
    if (new Set(data[key].map(item => item.id)).size !== data[key].length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: "ID harus unik" });
  }
  if (new Set(data.socialAccounts.map(a => `${a.platform}:${a.handle}`)).size !== data.socialAccounts.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["socialAccounts"], message: "Akun sosial tidak boleh duplikat" });
  if (new Set(data.promotions.map(p => p.id)).size !== data.promotions.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["promotions"], message: "ID banner harus unik" });
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export type TeamContact = SiteContent["contacts"][number];

// Identitas dan penempatan admin: Excel DAFTAR LOGO DANA NOMOR BARU MBI,
// Sheet1 H11:J28. Nomor tidak dibuat dari data demo sebelumnya.
export const defaultSiteContent: SiteContent = {
  garudaReviews: defaultGarudaReviews,
  inventory: defaultInventory,
  galleryProjects: defaultGalleryProjects,
  identityVersion: 1, showcaseVersion: 1, garudaReviewVersion: 1, heroSlides,
  revision: 0, rating: googleRating, reviewCount: googleReviewCount, ratingDate: googleReviewsCapturedAt,
  mapsUrl: "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8", reviews: googleReviews,
  socialAccounts: defaultSocialAccounts, socialPosts: defaultSocialPosts,
  promotions: [...samplePromotions, ...additionalPromotions],
  contacts: divisionSlugs.flatMap(slug => divisionIdentity[slug].admins.map(admin => ({ id: `${slug}-${admin.name.toLowerCase()}`, name: admin.name, role: "Admin divisi", phone: admin.phone, mobile: admin.phone, whatsapp: admin.phone, email: "", photo: "", divisions: [slug], published: true }))),
};

export function internationalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}
