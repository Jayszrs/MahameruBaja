import { sectionListSchema } from "./sectionLists";
import { sectionEditSchema } from "./sectionEdits";
import { websiteAppearanceSchema } from "./websiteAppearance";
import { contentOwner, divisionSlugSchema, ownershipFields } from "./divisionCms";
import { z } from "zod";
import { safeHttpsUrl, safeLocalAsset, safeInternalLink } from "./safeUrls";
import { socialAccountSchema, socialPostSchema, defaultSocialAccounts, defaultSocialPosts } from "./socialMedia";
import { googleRating, googleReviewCount, googleReviews, googleReviewsCapturedAt } from "./googleReviews";
import { promotionSchema, samplePromotions, additionalPromotions } from "./promotions";
import { groupVision, groupMotto, divisionIdentity } from "./companyIdentity";
import { heroSlides, heroSlideSchema } from "./heroSlides";
import { websiteTextSchema } from "./websiteTexts";
import { clientPosters } from "./clientPosters";
import { heroAnnouncementSchema } from "./heroAnnouncements";
import { defaultGarudaReviews } from "./divisionLocations";
import { laserGoogleReviews } from "./laserGoogleReviews";
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
  text: text(2000), ratingOnly:z.boolean().optional(), when: text(100), url: googleUrl,
  authorPhoto: photo.optional(), authorUrl: googleUrl.optional(), published: z.boolean(),
}).superRefine((review,ctx)=>{if(!review.text && !review.ratingOnly)ctx.addIssue({code:"custom",path:["text"],message:"Isi komentar asli atau tandai sebagai penilaian tanpa komentar."});});
export const reviewProfileSchema = z.object({
  rating: z.number().min(0).max(5), reviewCount: z.number().int().min(0).nullable(),
  ratingDate: text(80).min(1), mapsUrl: googleUrl, reviews: z.array(reviewSchema).max(200),
}).superRefine((profile, ctx) => {
  if (new Set(profile.reviews.map(r => r.id)).size !== profile.reviews.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reviews"], message: "ID ulasan harus unik" });
});
export const defaultArticleIntro = { eyebrow: "Panduan & Edukasi", title: "Artikel & Panduan Material", description: "Panduan teknis seputar material baja, tips memilih besi yang tepat, dan edukasi konstruksi untuk proyek Anda.", image: "/images/steel-indonesia/toko-mahameru.jpg", visualNote: "Visual ilustrasi material" };
export const siteContentSchema = z.object({
  websiteAppearance: z.array(websiteAppearanceSchema).max(100).default([]),
  companyVision: text(2000).default(groupVision),
  companyMission: text(2000).default("Retail, pengadaan material, laser cutting, bending, fabrikasi, dan erection. Pilih tim yang sesuai dengan kebutuhan Anda."),
  companyMotto: text(2000).default(groupMotto),
  sectionLists: z.array(sectionListSchema).max(300).default([]),
  sectionEdits: z.array(sectionEditSchema).max(4000).default([]),
  articleIntro: z.object({ eyebrow: text(180), title: text(300).min(1), description: text(2000), image: photo, visualNote: text(180) }).default(defaultArticleIntro),
  homeQuickLinksTitle: text(200).default("Mulai dari kebutuhan Anda"),
  homeQuickLinks: z.array(z.object({ id: text(80).min(1), label: text(180).min(1), href: text(500).min(1).refine(safeInternalLink, "Gunakan tautan halaman internal") })).max(20).default([
    { id: "retail-tambun", label: "Saya mau beli besi satuan di Tambun", href: "/unit/retail-tambun" },
    { id: "retail-cibitung", label: "Saya cari hollow, pipa, atau plat di Cibitung", href: "/unit/retail-cibitung" },
    { id: "trading-proyek", label: "Saya butuh material untuk proyek", href: "/unit/trading-proyek" },
    { id: "laser-cutting", label: "Saya mau potong atau tekuk plat sesuai gambar", href: "/unit/laser-cutting" },
    { id: "fabrikasi-erection", label: "Saya ingin konsultasi fabrikasi dan erection", href: "/unit/fabrikasi-erection/kontak" },
  ]),
  reviewEyebrow: text(180).default("Cerita & kepercayaan"),
  reviewHeading: text(300).default("Setiap kebutuhan, punya ceritanya."),
  reviewDescription: text(1000).default("Ulasan pelanggan dari Google Maps. Baca cerita lengkapnya di profil toko kami."),
  partnerLogos:partnerLogoListSchema.default(defaultPartnerLogos),
  supplierLogosHomeVisible: z.boolean().default(true),
  heroAnnouncements:z.array(heroAnnouncementSchema).max(100).default([]),
  websiteTexts: z.array(websiteTextSchema).max(2000).default([]),
  clientPosterVersion: z.number().int().nonnegative().default(0),
  referenceAlbumVersion: z.number().int().nonnegative().default(0),
  customerJourneyVersion: z.number().int().nonnegative().default(0),
  laserReviewVersion: z.number().int().nonnegative().default(0),
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
  for (const key of ["homeQuickLinks", "contacts", "reviews", "socialPosts", "heroSlides"] as const) {
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
export type ReviewContent = Pick<SiteContent, "rating" | "reviewCount" | "ratingDate" | "mapsUrl" | "reviews"> & Partial<Pick<SiteContent, "reviewEyebrow" | "reviewHeading" | "reviewDescription">>;
// Only review fields cross the reviews widget's client boundary. Do not ship
// unrelated division projects, contacts or other CMS content in its props.
export function reviewContent(content: ReviewContent): ReviewContent {
  return { rating: content.rating, reviewCount: content.reviewCount, ratingDate: content.ratingDate, mapsUrl: content.mapsUrl, reviews: content.reviews, reviewEyebrow: content.reviewEyebrow, reviewHeading: content.reviewHeading, reviewDescription: content.reviewDescription };
}

// Identitas dan penempatan admin: Excel DAFTAR LOGO DANA NOMOR BARU MBI,
// Sheet1 H11:J28. Nomor tidak dibuat dari data demo sebelumnya.
export const defaultSiteContent: SiteContent = {
  websiteAppearance: [],
  companyVision: groupVision,
  companyMission: "Retail, pengadaan material, laser cutting, bending, fabrikasi, dan erection. Pilih tim yang sesuai dengan kebutuhan Anda.",
  companyMotto: groupMotto,
  sectionLists: [],
  sectionEdits: [],
  articleIntro: defaultArticleIntro,
  homeQuickLinksTitle: "Mulai dari kebutuhan Anda",
  homeQuickLinks: [
    { id: "retail-tambun", label: "Saya mau beli besi satuan di Tambun", href: "/unit/retail-tambun" },
    { id: "retail-cibitung", label: "Saya cari hollow, pipa, atau plat di Cibitung", href: "/unit/retail-cibitung" },
    { id: "trading-proyek", label: "Saya butuh material untuk proyek", href: "/unit/trading-proyek" },
    { id: "laser-cutting", label: "Saya mau potong atau tekuk plat sesuai gambar", href: "/unit/laser-cutting" },
    { id: "fabrikasi-erection", label: "Saya ingin konsultasi fabrikasi dan erection", href: "/unit/fabrikasi-erection/kontak" },
  ],
  reviewEyebrow: "Cerita & kepercayaan",
  reviewHeading: "Setiap kebutuhan, punya ceritanya.",
  reviewDescription: "Ulasan pelanggan dari Google Maps. Baca cerita lengkapnya di profil toko kami.",
  partnerLogos:defaultPartnerLogos,
  supplierLogosHomeVisible:true,
  heroAnnouncements:[],
  websiteTexts: [],
  clientPosterVersion: 1,
  referenceAlbumVersion: 1,
  customerJourneyVersion: 1, laserReviewVersion: 1,
  divisionReviews: { "laser-cutting": laserGoogleReviews },
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
