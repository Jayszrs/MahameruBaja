export interface CreateLeadInput {
  kind: "GENERAL" | "QUOTATION" | "LASER" | "TRADING";
  businessUnitSlug?: string;
  name: string;
  company?: string;
  whatsapp: string;
  email?: string;
  city?: string;
  request?: string;
  consent: true;
  source?: string;
  metadata?: Record<string, unknown>;
  items?: Array<{
    productName: string;
    specification?: string;
    quantity?: number;
    unit?: string;
  }>;
}

const pendingKeys = new Map<string, string>();
export async function createLead(input: CreateLeadInput, photos: File[] = []) {
  const bodyKey = JSON.stringify([input, photos.map(file => [file.name, file.size, file.lastModified])]);
  if (!pendingKeys.has(bodyKey)) {
    if (pendingKeys.size > 30) pendingKeys.clear();
    pendingKeys.set(bodyKey, globalThis.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  }
  let body: string | FormData = JSON.stringify(input);
  if (photos.length) {
    body = new FormData();
    body.set("input", JSON.stringify(input));
    for (const photo of photos) body.append("photos", photo);
  }
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { ...(photos.length ? {} : { "content-type": "application/json" }), "idempotency-key": pendingKeys.get(bodyKey)! },
    body,
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message ?? "Permintaan belum dapat disimpan. Silakan coba kembali.");
  }
  return result.data as { id: string; status: string; photoCount?: number; pdfUrl?: string };
}
