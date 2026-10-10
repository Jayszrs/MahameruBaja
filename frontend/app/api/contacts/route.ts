import { readSiteContent } from "../../../src/lib/siteContentStore";

export const runtime = "nodejs";
export async function GET() {
  const content = await readSiteContent();
  return Response.json(content.contacts.filter(c => c.published && c.whatsapp).map(c => ({ id: c.id, name: c.name, whatsapp: c.whatsapp, divisions: c.divisions })), { headers: { "Cache-Control": "no-store" } });
}
