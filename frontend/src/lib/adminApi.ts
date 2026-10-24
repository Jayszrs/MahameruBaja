import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, readAdminAuthentication } from "./adminAuth";
import { adminRequestOrigin } from "./adminRequestOrigin";
import { CmsError } from "./cmsError";
import { readJsonBody } from "./requestBody";
export const noStore = { "Cache-Control": "private, no-store" };
export async function adminAuthentication(request?: Request, superOnly = false, allowPasswordChange = false) {
  const authentication = await readAdminAuthentication((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!authentication) throw new CmsError("Silakan masuk kembali.", 401);
  const actor = authentication.identity;
  if (actor.mustChangePassword && !allowPasswordChange) throw new CmsError("Ganti password sementara melalui Akun saya terlebih dahulu.", 403);
  if (superOnly && actor.role !== "super_admin") throw new CmsError("Hanya Super Admin dapat mengakses area ini.", 403);
  if (request && request.method !== "GET" && !adminRequestOrigin(request)) throw new CmsError("Asal permintaan tidak valid.", 403);
  return authentication;
}
export async function adminActor(request?: Request, superOnly = false, allowPasswordChange = false) {
  return (await adminAuthentication(request, superOnly, allowPasswordChange)).identity;
}
export async function jsonInput(request: Request, max = 200000) {
  return z.record(z.unknown()).parse(await readJsonBody(request, max));
}
function validationMessage(issue: z.ZodIssue) {
  const labels: Record<string, string> = { contacts: "Kontak", reviews: "Ulasan", heroSlides: "Slide hero", promotions: "Poster / banner", galleryProjects: "Album proyek", socialPosts: "Unggahan", socialAccounts: "Akun sosial", websiteTexts: "Teks website", heroAnnouncements: "Teks berjalan", partnerLogos: "Logo rekanan", name: "nama", title: "judul", author: "nama penulis", text: "komentar", role: "jabatan", media: "gambar / video", image: "gambar", url: "tautan", email: "email", whatsapp: "WhatsApp", phone: "telepon", replacement: "tulisan baru", description: "deskripsi", photos: "foto", messages: "tulisan", newPassword: "password baru" };
  const location = issue.path.filter(part => part !== "_base").map(part => typeof part === "number" ? String(part + 1) : labels[part] || part).join(" · ");
  let message = issue.message;
  if (issue.code === "too_small" && /^String must/.test(message)) message = `Isi minimal ${issue.minimum} karakter.`;
  else if (issue.code === "too_big" && /^String must/.test(message)) message = `Maksimal ${issue.maximum} karakter.`;
  else if (issue.code === "invalid_string" && message === "Invalid email") message = "Masukkan alamat email yang valid.";
  else if (issue.code === "invalid_type" && issue.received === "undefined") message = "Lengkapi isian ini.";
  return location ? `${location}: ${message}` : message;
}
export function apiError(error: unknown): Response {
  if (error instanceof Error && error.message === "TOO_LARGE") return Response.json({message:"Berkas terlalu besar."},{status:413,headers:noStore});
  if (error instanceof CmsError) {
    const retry = "retryAfter" in error ? Number(error.retryAfter) : 0;
    return Response.json({ message: error.message }, { status: error.status, headers: { ...noStore, ...(error.status === 429 && Number.isSafeInteger(retry) && retry > 0 ? { "Retry-After": String(retry) } : {}) } });
  }
  if (error instanceof z.ZodError) return Response.json({ message: error.issues.map(validationMessage).join("; "), fields: error.flatten().fieldErrors }, { status: 400, headers: noStore });
  if (error instanceof Error && ["BUSY", "CMS_BUSY", "CMS_CONFLICT"].includes(error.message)) return Response.json({ message: "Data telah diubah atau sedang disimpan. Muat ulang sebelum menyimpan lagi." }, { status: 409, headers: noStore });
  console.error("CMS operation failed"); return Response.json({ message: "Perubahan belum tersimpan. Coba kembali." }, { status: 500, headers: noStore });
}
