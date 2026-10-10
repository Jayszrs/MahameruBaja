import { z } from "zod";
export const socialPlatforms = ["instagram", "tiktok", "youtube", "facebook"] as const;
export type SocialPlatform = typeof socialPlatforms[number];
export const platformLabels = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };
export function isPlatformUrl(value: string, platform: SocialPlatform) {
  try {
    const url = new URL(value); const host = url.hostname.replace(/^www\./, "");
    return url.protocol === "https:" && (platform === "instagram" ? host === "instagram.com" : platform === "tiktok" ? host === "tiktok.com" || host === "vm.tiktok.com" : platform === "facebook" ? ["facebook.com", "m.facebook.com", "fb.watch"].includes(host) : ["youtube.com", "m.youtube.com", "youtu.be"].includes(host));
  } catch { return false; }
}
export function socialEmbedUrl(platform: SocialPlatform, value: string) {
  if (!isPlatformUrl(value, platform)) return null;
  const url = new URL(value);
  if (platform === "youtube") {
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0` : null;
  }
  if (platform === "tiktok") {
    const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
    return id ? `https://www.tiktok.com/player/v1/${id}?autoplay=0&description=1` : null;
  }
  if (platform === "instagram") {
    const code = url.pathname.match(/^\/(?:p|reel|tv)\/([\w-]+)\/?$/)?.[1];
    return code ? `https://www.instagram.com/p/${code}/embed/` : null;
  }
  return null;
}
export const socialAccountSchema = z.object({ platform: z.enum(socialPlatforms), handle: z.string().trim().max(100), url: z.string().trim().max(1000), published: z.boolean() }).superRefine((value, ctx) => {
  if ((value.url || value.published) && !isPlatformUrl(value.url, value.platform)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "URL harus sesuai platform dan menggunakan HTTPS" });
});
export const socialPostSchema = z.object({ id: z.string().min(1).max(80), platform: z.enum(socialPlatforms), title: z.string().trim().min(1).max(180), caption: z.string().trim().max(1500), url: z.string().trim().max(1000), image: z.string().trim().max(1000), published: z.boolean(), division: z.enum(["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting", "fabrikasi-erection"]).default("laser-cutting"), handle: z.string().trim().max(100).default("") }).superRefine((value, ctx) => {
  if ((value.url || value.published) && !isPlatformUrl(value.url, value.platform)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "Gunakan tautan unggahan sesuai platform" });
  if (value.published && value.platform !== "facebook" && !socialEmbedUrl(value.platform, value.url)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "Gunakan URL post/reel/video, bukan URL profil akun" });
  if (value.image && !/^\/(?:images|media)\/[\w/ .-]+$/.test(value.image)) {
    try { if (new URL(value.image).protocol !== "https:") throw new Error(); }
    catch { ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["image"], message: "Gambar harus /images/... atau URL HTTPS" }); }
  }
});
export const defaultSocialAccounts: SocialAccount[] = [
  { platform: "instagram", handle: "@mbilasercutting", url: "https://www.instagram.com/mbilasercutting/", published: true },
  { platform: "instagram", handle: "@gmbgarudaofficial", url: "https://www.instagram.com/gmbgarudaofficial/", published: true },
  { platform: "tiktok", handle: "Mahameru baja", url: "", published: false },
  { platform: "tiktok", handle: "Garuda Marginal Baja", url: "", published: false },
  { platform: "youtube", handle: "Mahameru Baja Indonesia", url: "", published: false },
  { platform: "youtube", handle: "Garuda Marginal Baja Official", url: "", published: false },
];
// Tautan video terdahulu tidak tersedia pada embed; editor dapat menerbitkan ulang setelah diverifikasi.
// Verified from the official profile embed, 10 October 2026. No profile-grid embeds.
export const verifiedInstagramPosts: SocialPost[] = [
  { id: "ig-DeG2uVRh2uq", platform: "instagram", title: "Mahameru Baja Indonesia", caption: "Material konstruksi dan layanan fabrikasi dari Mahameru Baja.", url: "https://www.instagram.com/reel/DeG2uVRh2uq/", image: "", published: true, division: "laser-cutting", handle: "@mbilasercutting" },
  { id: "ig-Dd59WrvhJtC", platform: "instagram", title: "Kenali layanan laser cutting", caption: "Lihat proses laser cutting melalui unggahan resmi tim MBI.", url: "https://www.instagram.com/reel/Dd59WrvhJtC/", image: "", published: true, division: "laser-cutting", handle: "@mbilasercutting" },
  { id: "ig-Dd5a7EzDk9N", platform: "instagram", title: "Siap membantu kebutuhan Anda", caption: "Kabar dari toko dan tim Mahameru Baja.", url: "https://www.instagram.com/p/Dd5a7EzDk9N/", image: "", published: true, division: "retail-tambun", handle: "@mbilasercutting" },
  { id: "ig-Dd3OyLoB_7p", platform: "instagram", title: "Kebutuhan besi untuk bangunan", caption: "Kenali pilihan material bersama Mahameru Baja.", url: "https://www.instagram.com/reel/Dd3OyLoB_7p/", image: "", published: true, division: "retail-tambun", handle: "@mbilasercutting" },
];
export const defaultSocialPosts: SocialPost[] = verifiedInstagramPosts;
export type SocialAccount = z.infer<typeof socialAccountSchema>;
export type SocialPost = z.infer<typeof socialPostSchema>;
export function contentId() { return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
