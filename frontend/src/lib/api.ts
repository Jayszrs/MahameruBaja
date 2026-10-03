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

export async function createLead(input: CreateLeadInput) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${apiUrl}/api/v1/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "Permintaan belum dapat disimpan. Silakan coba kembali.");
  }
  return body.data as { id: string; status: string };
}
