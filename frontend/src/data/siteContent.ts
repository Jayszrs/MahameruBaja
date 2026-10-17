import { contentOwner, divisionSlugSchema, ownershipFields } from "./divisionCms";
import { z } from "zod";
import { safeHttpsUrl, safeLocalAsset } from "./safeUrls";
import { socialAccountSchema, socialPostSchema, defaultSocialAccounts, defaultSocialPosts } from "./socialMedia";
import { googleRating, googleReviewCount, googleReviews, googleReviewsCapturedAt } from "./googleReviews";
import { promotionSchema, samplePromotions, additionalPromotions } from "./promotions";
import { divisionIdentity } from "./companyIdentity";
import { heroSlides, heroSlideSchema } from "./heroSlides";
import { websiteTextSchema } from "./websiteTexts";
import { clientPosters } from "./clientPosters";
import { heroAnnouncementSchema } from "./heroAnnouncements";
import { defaultGarudaReviews } from "./divisionLocations";
import { inventoryListSchema, defaultInventory } from "./inventory";
import { galleryProjectsSchema, defaultGalleryProjects } from "./projectGallery";
import { partnerLogoListSchema, defaultPartnerLogos } from "./partnerLogos";

export const divisionSlugs = ["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting", "fabrikasi-erection"] as const;
const text = (max: number) => z.string().trim().max(max);
const isHttps = safeHttpsUrl;
const webUrl = text(1000).refine(value => !value || isHttps(value), "Gunakan URL HTTPS");
const googleUrl = webUrl.refine(value => {
  try {
    const host = new URL(value).hostname;
    return host === "maps.app.goo.gl" || host === "goo.gl" || host === "google.com" || host.endsWith(".google.com") || host === "google.co.id" || host.endsWith(".google.co.id");
  } catch { return false; }
}, "Gunakan tautan sumber Google Maps");
const photo = text(1000).refine(value => !value || safeLocalAsset(value, ["images", "media", "api/cms/media"]) || isHttps(value), "Gunakan /images/... atau URL HTTPS");
const phone = text(30).refine(value => !value || /^\+?[\d ()-]{7,30}$/.test(value), "Nomor telepon tidak valid");
export const contactSchema = z.object({ ...ownershipFields,
  id: text(80).min(1), name: text(100).min(1), role: text(100).min(1),
  illustration:z.enum(["male","female"]).optional(),
  phone, mobile: phone, whatsapp: phone,
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  photo, divisions: z.array(divisionSlugSchema).max(100), published: z.boolean(),
});
export const reviewSchema = z.object({ ...ownershipFields,
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
  partnerLogos:partnerLogoListSchema.default(defaultPartnerLogos),
  heroAnnouncements:z.array(heroAnnouncementSchema).max(100).default([]),
  websiteTexts: z.array(websiteTextSchema).max(500).default([]),
  clientPosterVersion: z.number().int().nonnegative().default(0),
  revision: z.number().int().min(0),
  identityVersion: z.number().int().min(0).default(0),
  showcaseVersion: z.number().int().min(0).default(0),
  garudaReviewVersion: z.number().int().min(0).default(0),
  socialSourceVersion: z.number().int().min(0).default(0),
  inventory: inventoryListSchema.default(defaultInventory),
  galleryProjects: galleryProjectsSchema.default(defaultGalleryProjects),
  heroSlides: z.array(heroSlideSchema).max(100).default(heroSlides),
  contacts: z.array(contactSchema).max(40),
  reviews: z.array(reviewSchema).max(200),
  garudaReviews: reviewProfileSchema.default(defaultGarudaReviews),
  divisionReviews: z.record(divisionSlugSchema, reviewProfileSchema).default({}),
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
  if (new Set(data.heroAnnouncements.map(row => contentOwner(row))).size !== data.heroAnnouncements.length) ctx.addIssue({ code:z.ZodIssueCode.custom, path:["heroAnnouncements"], message:"Setiap website hanya memiliki satu pengaturan teks berjalan." });
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export type TeamContact = SiteContent["contacts"][number];
export function contactVisibleInDivision(contact: TeamContact, slug: string) {
  return contact.audience ? contact.audience.includes(slug) : contact.divisions.length ? contact.divisions.includes(slug) : !contentOwner(contact) || contentOwner(contact) === slug;
}
export type ReviewContent = Pick<SiteContent, "rating" | "reviewCount" | "ratingDate" | "mapsUrl" | "reviews">;
// Only review fields cross the reviews widget's client boundary. Do not ship
// unrelated division projects, contacts or other CMS content in its props.
export function reviewContent(content: ReviewContent): ReviewContent {
  return { rating: content.rating, reviewCount: content.reviewCount, ratingDate: content.ratingDate, mapsUrl: content.mapsUrl, reviews: content.reviews };
}

// Identitas dan penempatan admin: Excel DAFTAR LOGO DANA NOMOR BARU MBI,
// Sheet1 H11:J28. Nomor tidak dibuat dari data demo sebelumnya.
export const defaultSiteContent: SiteContent = {
  partnerLogos:defaultPartnerLogos,
  heroAnnouncements:[],
  websiteTexts: [],
  clientPosterVersion: 1,
  divisionReviews: {},
  garudaReviews: defaultGarudaReviews,
  inventory: defaultInventory,
  galleryProjects: defaultGalleryProjects,
  identityVersion: 1, showcaseVersion: 1, garudaReviewVersion: 1, socialSourceVersion: 2, heroSlides,
  revision: 0, rating: googleRating, reviewCount: googleReviewCount, ratingDate: googleReviewsCapturedAt,
  mapsUrl: "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8", reviews: googleReviews,
  socialAccounts: defaultSocialAccounts, socialPosts: defaultSocialPosts,
  promotions: [...samplePromotions, ...additionalPromotions, ...clientPosters],
  contacts: divisionSlugs.flatMap(slug => divisionIdentity[slug].admins.map(admin => ({ id: `${slug}-${admin.name.toLowerCase()}`, name: admin.name, role: "Admin divisi", phone: admin.phone, mobile: admin.phone, whatsapp: admin.phone, email: "", photo: "", divisions: [slug], published: true }))),
};

export function internationalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}
