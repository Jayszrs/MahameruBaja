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
export async function createLead(input: CreateLeadInput) {
  const bodyKey = JSON.stringify(input);
  if (!pendingKeys.has(bodyKey)) {
    if (pendingKeys.size > 30) pendingKeys.clear();
    pendingKeys.set(bodyKey, globalThis.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  }
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": pendingKeys.get(bodyKey)! },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "Permintaan belum dapat disimpan. Silakan coba kembali.");
  }
  return body.data as { id: string; status: string };
}
