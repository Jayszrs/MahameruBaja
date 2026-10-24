export type CmsUploadKind = "image" | "video";
export const imageUploadHelp = "JPG, PNG, atau WebP. Maksimal 4 MB per gambar.";
export function clientVideoByteLimit() { return process.env.NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES === "4000000" ? 4_000_000 : 30_000_000; }
export const videoUploadHelp = `MP4 (H.264). Maksimal ${clientVideoByteLimit() / 1_000_000} MB per video.`;
export const cmsUploadEvent = "mahameru:cms-upload";
export type CmsUploadActivity = { id: string; name: string; active: boolean };
function announceUpload(activity: CmsUploadActivity) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(cmsUploadEvent, { detail: activity }));
}

export function validateUploadFile(file: File, kind: CmsUploadKind) {
  const accepted = kind === "image" ? ["image/jpeg", "image/png", "image/webp"] : ["video/mp4"];
  if (!accepted.includes(file.type)) throw new Error(kind === "image" ? "Gunakan gambar JPG, PNG, atau WebP." : "Gunakan video MP4 (H.264).");
  const limit = kind === "image" ? 4_000_000 : clientVideoByteLimit();
  if (!file.size || file.size > limit) throw new Error(kind === "image" ? "Gambar maksimal 4 MB dan tidak boleh kosong." : `Video maksimal ${limit / 1_000_000} MB dan tidak boleh kosong.`);
}

export async function uploadCmsFile(file: File, kind: CmsUploadKind, ownerDivision?: string | null, endpoint = "/api/admin/media") {
  validateUploadFile(file, kind);
  const body = new FormData();
  body.set(endpoint === "/api/admin/articles/upload" ? "image" : "media", file);
  body.set("kind", kind);
  if (ownerDivision !== undefined) body.set("ownerDivision", ownerDivision || "");
  const activity = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: file.name, active: true };
  announceUpload(activity);
  try {
    const response = await fetch(endpoint, { method: "POST", body });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || "Unggahan gagal. Periksa koneksi dan coba kembali.");
    if (result?.type !== kind || typeof result.url !== "string") throw new Error(kind === "image" ? "Hasil unggahan bukan gambar yang valid." : "Hasil unggahan bukan video yang valid.");
    return result.url as string;
  } finally { announceUpload({ ...activity, active: false }); }
}
