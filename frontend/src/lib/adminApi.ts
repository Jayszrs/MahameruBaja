import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, readAdminIdentity } from "./adminAuth";
import { adminRequestOrigin } from "./adminRequestOrigin";
import { CmsError } from "./cmsError";
export const noStore = { "Cache-Control": "private, no-store" };
export async function adminActor(request?: Request, superOnly = false, allowPasswordChange = false) {
  const actor = await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!actor) throw new CmsError("Silakan masuk kembali.", 401);
  if (actor.mustChangePassword && !allowPasswordChange) throw new CmsError("Ganti password sementara melalui Akun saya terlebih dahulu.", 403);
  if (superOnly && actor.role !== "super_admin") throw new CmsError("Hanya Super Admin dapat mengakses area ini.", 403);
  if (request && request.method !== "GET" && !adminRequestOrigin(request)) throw new CmsError("Asal permintaan tidak valid.", 403);
  return actor;
}
export async function jsonInput(request: Request, max = 200000) {
  if (Number(request.headers.get("content-length") || 0) > max) throw new CmsError("Data terlalu besar.", 413);
  const text = await request.text(); if (text.length > max) throw new CmsError("Data terlalu besar.", 413);
  try { return JSON.parse(text); } catch { throw new CmsError("Format data tidak valid."); }
}
export function apiError(error: unknown): Response {
  if (error instanceof Error && error.message === "TOO_LARGE") return Response.json({message:"Berkas terlalu besar."},{status:413,headers:noStore});
  if (error instanceof CmsError) return Response.json({ message: error.message }, { status: error.status, headers: noStore });
  if (error instanceof z.ZodError) return Response.json({ message: error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; "), fields: error.flatten().fieldErrors }, { status: 400, headers: noStore });
  if (error instanceof Error && ["BUSY", "CMS_BUSY", "CMS_CONFLICT"].includes(error.message)) return Response.json({ message: "Data telah diubah atau sedang disimpan. Muat ulang sebelum menyimpan lagi." }, { status: 409, headers: noStore });
  console.error("CMS operation failed"); return Response.json({ message: "Perubahan belum tersimpan. Coba kembali." }, { status: 500, headers: noStore });
}
