import { readFile } from "node:fs/promises";
import path from "node:path";
import { validRequestPdfLink } from "../../../../../src/lib/requestPdfShare";
import { readRequests } from "../../../../../src/lib/requestStore";
import { readDivisions } from "../../../../../src/lib/divisionStore";
import { createRequestPdf } from "../../../../../src/lib/requestPdf";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "Referrer-Policy": "no-referrer" };
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const url = new URL(request.url);
  if (!validRequestPdfLink(id, url.searchParams.get("expires"), url.searchParams.get("token"))) return new Response("Tautan PDF tidak tersedia atau sudah kedaluwarsa.", { status: 404, headers });
  try {
    const record = (await readRequests()).find(row => row.id === id);
    if (!record) return new Response("PDF tidak ditemukan.", { status: 404, headers });
    const [font, logo, divisions] = await Promise.all([readFile(path.join(process.cwd(), "public/fonts/NotoSans-Regular.ttf")), readFile(path.join(process.cwd(), "public/apple-touch-icon.png")), readDivisions()]);
    const bytes = await createRequestPdf(record, record.id, font, record.createdAt, divisions, logo);
    return new Response(Buffer.from(bytes), { headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${record.id}-permintaan-penawaran.pdf"` } });
  } catch { return new Response("PDF belum dapat dimuat. Coba kembali beberapa saat lagi.", { status: 503, headers }); }
}
