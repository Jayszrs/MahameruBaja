import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";
import { readRequests, createRequest, updateRequest } from "../../../../src/lib/requestStore";
import { requestInputSchema, requestPatchSchema } from "../../../../src/data/requests";

export const runtime = "nodejs";
async function authorized() { return readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value); }
export async function GET() {
  const identity = await authorized();
  if (!identity) return Response.json({ message: "Silakan login." }, { status: 401 });
  return Response.json((await readRequests()).filter(r => !identity.division || r.businessUnitSlug === identity.division), { headers: { "Cache-Control": "no-store" } });
}
async function change(request: Request) {
  const identity = await authorized();
  if (!identity) return Response.json({ message: "Silakan login." }, { status: 401 });
  if (!adminRequestOrigin(request)) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 100000) return Response.json({ message: "Data terlalu besar." }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 100000) return Response.json({ message: "Data terlalu besar." }, { status: 413 });
  try {
    const body = JSON.parse(raw);
    if (request.method === "POST") {
      const input = requestInputSchema.parse(body);
      if (identity.division && input.businessUnitSlug !== identity.division) return Response.json({ message: "Permintaan hanya untuk divisi akun Anda." }, { status: 403 });
      return Response.json(await createRequest(input), { status: 201 });
    }
    const patch = requestPatchSchema.parse(body);
    const id = new URL(request.url).searchParams.get("id") || "";
    if (!/^MBI-\d{8}-[A-F0-9]{8}$/.test(id)) return Response.json({ message: "ID tidak valid." }, { status: 400 });
    return Response.json(await updateRequest(id, patch.revision, request.method === "DELETE" ? { archived: true } : { ...patch.input, ...(patch.status ? { status: patch.status } : {}), ...(patch.notes !== undefined ? { notes: patch.notes } : {}), ...(patch.archived !== undefined ? { archived: patch.archived } : {}), ...(patch.invoice ? { invoice: patch.invoice } : {}) }, identity.division));
  } catch (error) {
    const code = (error as Error).message;
    if (code === "FORBIDDEN") return Response.json({ message: "Permintaan ini milik divisi lain." }, { status: 403 });
    const status = code === "NOT_FOUND" ? 404 : ["CONFLICT", "BUSY"].includes(code) ? 409 : 400;
    return Response.json({ message: status === 409 ? "Data berubah atau sedang disimpan. Muat ulang sebelum mengedit." : status === 404 ? "Permintaan tidak ditemukan." : "Data tidak valid. Periksa kembali isian." }, { status });
  }
}
export const POST = change;
export const PATCH = change;
export const DELETE = change;
