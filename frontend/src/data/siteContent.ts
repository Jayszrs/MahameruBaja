import { z } from "zod";
import { socialAccountSchema, socialPostSchema, defaultSocialAccounts, defaultSocialPosts } from "./socialMedia";

export const divisionSlugs = ["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting"] as const;
const text = (max: number) => z.string().trim().max(max);
function isHttps(value: string) { try { return new URL(value).protocol === "https:"; } catch { return false; } }
const webUrl = text(1000).refine(value => !value || isHttps(value), "Gunakan URL HTTPS");
const googleUrl = webUrl.refine(value => {
  try {
    const host = new URL(value).hostname;
    return host === "maps.app.goo.gl" || host === "goo.gl" || host === "google.com" || host.endsWith(".google.com") || host === "google.co.id" || host.endsWith(".google.co.id");
  } catch { return false; }
}, "Gunakan tautan sumber Google Maps");
const photo = text(1000).refine(value => !value || /^\/images\/[a-zA-Z0-9/_ .-]+$/.test(value) || isHttps(value), "Gunakan /images/... atau URL HTTPS");
const phone = text(30).refine(value => !value || /^\+?[\d ()-]{7,30}$/.test(value), "Nomor telepon tidak valid");
export const contactSchema = z.object({
  id: text(80).min(1), name: text(100).min(1), role: text(100).min(1),
  phone, mobile: phone, whatsapp: phone,
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  photo, divisions: z.array(z.enum(divisionSlugs)).max(4), published: z.boolean(),
});
export const reviewSchema = z.object({
  id: text(80).min(1), author: text(100).min(1), rating: z.number().int().min(1).max(5),
  text: text(2000).min(1), when: text(100), url: googleUrl, published: z.boolean(),
});
export const siteContentSchema = z.object({
  revision: z.number().int().min(0),
  contacts: z.array(contactSchema).max(40),
  reviews: z.array(reviewSchema).max(100),
  socialAccounts: z.array(socialAccountSchema).max(4).default(defaultSocialAccounts),
  socialPosts: z.array(socialPostSchema).max(60).default(defaultSocialPosts),
  rating: z.number().min(0).max(5), reviewCount: z.number().int().min(0).nullable(),
  ratingDate: text(80).min(1), mapsUrl: googleUrl,
}).superRefine((data, ctx) => {
  for (const key of ["contacts", "reviews", "socialPosts"] as const) {
    if (new Set(data[key].map(item => item.id)).size !== data[key].length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: "ID harus unik" });
  }
  if (new Set(data.socialAccounts.map(a => a.platform)).size !== data.socialAccounts.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["socialAccounts"], message: "Platform tidak boleh duplikat" });
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export type TeamContact = SiteContent["contacts"][number];

// Nama, jabatan, dan nomor disalin dari screenshot kontak yang diberikan pengguna.
// Penempatan per divisi belum diketahui; daftar kosong berarti kontak bersama.
export const defaultSiteContent: SiteContent = {
  revision: 0, rating: 4.5, reviewCount: 125, ratingDate: "5 Oktober 2026",
  mapsUrl: "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8", reviews: [],
  socialAccounts: defaultSocialAccounts, socialPosts: defaultSocialPosts,
  contacts: [
    { id: "satria", name: "Satria", role: "Marketing", phone: "0813 1409 7771", mobile: "0813 1409 7771", whatsapp: "0813 1409 7771", email: "", photo: "", divisions: [], published: true },
    { id: "ipung", name: "Ipung", role: "Direktur", phone: "082110193640", mobile: "082110193640", whatsapp: "082110193640", email: "", photo: "/images/steel-indonesia/company-logo.jpeg", divisions: [], published: true },
    { id: "andra", name: "Andra", role: "Owner", phone: "021-8830194", mobile: "+62 813 333 8131", whatsapp: "+62 813 333 8131", email: "", photo: "", divisions: [], published: true },
  ],
};

export function internationalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}
