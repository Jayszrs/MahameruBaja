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
export const socialDivisions = ["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting", "fabrikasi-erection"] as const;
export const socialAccountSchema = z.object({ platform: z.enum(socialPlatforms), handle: z.string().trim().max(100), url: z.string().trim().max(1000), published: z.boolean(), divisions: z.array(z.enum(socialDivisions)).max(5).optional() }).superRefine((value, ctx) => {
  if ((value.url || value.published) && !isPlatformUrl(value.url, value.platform)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "URL harus sesuai platform dan menggunakan HTTPS" });
});
export function isSocialVideoUrl(value: string) {
  if (/^\/(?:media|videos)\/[\w/ .-]+\.mp4$/i.test(value) && value.split("/").slice(1).every(part => part && part !== "." && part !== "..")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") && /\.mp4$/i.test(url.pathname); } catch { return false; }
}
export const socialPostSchema = z.object({ id: z.string().min(1).max(80), platform: z.enum(socialPlatforms), title: z.string().trim().min(1).max(180), caption: z.string().trim().max(1500), url: z.string().trim().max(1000), image: z.string().trim().max(1000), videoUrl: z.string().trim().max(1000).optional(), published: z.boolean(), division: z.enum(socialDivisions).default("laser-cutting"), handle: z.string().trim().max(100).default("") }).superRefine((value, ctx) => {
  if (value.videoUrl && !isSocialVideoUrl(value.videoUrl)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["videoUrl"], message: "Gunakan video MP4 dari unggahan media lokal atau Vercel Blob" });
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
  { platform: "youtube", handle: "Mahameru Baja Indonesia", url: "https://www.youtube.com/@MahameruBajaIndonesia", published: true },
  { platform: "youtube", handle: "Garuda Marginal Baja Official", url: "https://www.youtube.com/@GarudaMarginalbaja", published: true, divisions: ["retail-cibitung"] },
];
// Tautan video terdahulu tidak tersedia pada embed; editor dapat menerbitkan ulang setelah diverifikasi.
// Verified from the official profile embed, 10 October 2026. No profile-grid embeds.
export const verifiedInstagramPosts: SocialPost[] = [
  { id: "ig-DeG2uVRh2uq", platform: "instagram", title: "Mahameru Baja Indonesia", caption: "Material konstruksi dan layanan fabrikasi dari Mahameru Baja.", url: "https://www.instagram.com/reel/DeG2uVRh2uq/", image: "", published: true, division: "laser-cutting", handle: "@mbilasercutting" },
  { id: "ig-Dd59WrvhJtC", platform: "instagram", title: "Kenali layanan laser cutting", caption: "Lihat proses laser cutting melalui unggahan resmi tim MBI.", url: "https://www.instagram.com/reel/Dd59WrvhJtC/", image: "", published: true, division: "laser-cutting", handle: "@mbilasercutting" },
  { id: "ig-Dd5a7EzDk9N", platform: "instagram", title: "Siap membantu kebutuhan Anda", caption: "Kabar dari toko dan tim Mahameru Baja.", url: "https://www.instagram.com/p/Dd5a7EzDk9N/", image: "", published: true, division: "retail-tambun", handle: "@mbilasercutting" },
  { id: "ig-Dd3OyLoB_7p", platform: "instagram", title: "Kebutuhan besi untuk bangunan", caption: "Kenali pilihan material bersama Mahameru Baja.", url: "https://www.instagram.com/reel/Dd3OyLoB_7p/", image: "", published: true, division: "retail-tambun", handle: "@mbilasercutting" },
];
// Public YouTube oEmbed metadata checked 10 October 2026: exact Excel channel
// name and a working video endpoint. Playback still depends on platform policy.
export const verifiedYouTubePosts: SocialPost[] = [
  { id: "yt-mbi-IP6GsNxExVU", platform: "youtube", title: "Proses laser cutting", caption: "Proses laser cutting melalui video resmi Mahameru Baja Indonesia.", url: "https://www.youtube.com/shorts/IP6GsNxExVU", image: "", published: true, division: "laser-cutting", handle: "@MahameruBajaIndonesia" },
];
// Checked 11 October 2026: the channel's Wanajaya address and 081287072023
// contact match Garuda's supplied identity. Both videos belong to that channel.
export const verifiedGarudaYouTubePosts: SocialPost[] = [
  { id: "yt-gmb-0onyCem9_qI", platform: "youtube", title: "Pengiriman material Garuda", caption: "Lihat layanan pengiriman material melalui unggahan Garuda Marginal Baja Cibitung.", url: "https://www.youtube.com/shorts/0onyCem9_qI", image: "", published: true, division: "retail-cibitung", handle: "@GarudaMarginalbaja" },
  { id: "yt-gmb-rGpjrXQM92M", platform: "youtube", title: "Pemotongan atap spandek", caption: "Proses pemotongan atap spandek pasir 2,5 meter di Garuda Marginal Baja.", url: "https://www.youtube.com/shorts/rGpjrXQM92M", image: "", published: true, division: "retail-cibitung", handle: "@GarudaMarginalbaja" },
];
export const defaultSocialPosts: SocialPost[] = [...verifiedInstagramPosts, ...verifiedYouTubePosts, ...verifiedGarudaYouTubePosts];
export type SocialAccount = z.infer<typeof socialAccountSchema>;
export type SocialPost = z.infer<typeof socialPostSchema>;
// Excel supplies display names only for TikTok/YouTube, not URLs or video IDs.
// Legacy account records keep their saved values; known official handles have
// a scoped fallback until the editor explicitly selects their divisions.
export function accountDivisionSlugs(account: SocialAccount): readonly string[] {
  if (account.divisions) return account.divisions;
  if (["@gmbgarudaofficial", "@GarudaMarginalbaja", "Garuda Marginal Baja", "Garuda Marginal Baja Official"].includes(account.handle)) return ["retail-cibitung"];
  if (["@mbilasercutting", "Mahameru baja", "Mahameru Baja Indonesia"].includes(account.handle)) return socialDivisions.filter(slug => slug !== "retail-cibitung");
  return [];
}
export function contentId() { return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
