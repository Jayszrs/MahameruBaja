import { requestInputSchema } from "../../../src/data/requests";
import { createRequest } from "../../../src/lib/requestStore";
import { adminRequestOrigin } from "../../../src/lib/adminRequestOrigin";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  if (!adminRequestOrigin(request)) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now();
  for (const [ip, value] of attempts) if (value.until < now) attempts.delete(ip);
  const rate = attempts.get(key) || { count: 0, until: now + 600000 };
  if (++rate.count > 30) return Response.json({ message: "Terlalu banyak permintaan. Coba beberapa menit lagi." }, { status: 429 });
  attempts.set(key, rate);
  if (Number(request.headers.get("content-length") || 0) > 100000) return Response.json({ message: "Permintaan terlalu besar." }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 100000) return Response.json({ message: "Permintaan terlalu besar." }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return Response.json({ message: "Format permintaan tidak valid." }, { status: 400 }); }
  const result = requestInputSchema.safeParse(input);
  if (!result.success) return Response.json({ message: "Periksa nama, nomor WhatsApp, email, dan jumlah material.", details: result.error.flatten().fieldErrors }, { status: 422 });
  const idempotencyKey = request.headers.get("idempotency-key") || undefined;
  if (idempotencyKey && !/^[\w-]{8,100}$/.test(idempotencyKey)) return Response.json({ message: "Kunci permintaan tidak valid." }, { status: 400 });
  try {
    const saved = await createRequest(result.data, idempotencyKey);
    return Response.json({ data: { id: saved.id, status: saved.status } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ message: (error as Error).message === "BUSY" ? "Penyimpanan sedang sibuk. Silakan coba kembali." : "Permintaan belum tersimpan. Coba kembali." }, { status: 503 });
  }
}
