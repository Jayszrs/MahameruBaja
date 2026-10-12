import { readPublicSiteContent } from "../../../src/lib/siteContentStore";
import { contactVisibleInDivision } from "../../../src/data/siteContent";
import { readDivisions } from "../../../src/lib/divisionStore";
import { contentOwner } from "../../../src/data/divisionCms";

export const runtime = "nodejs";
export async function GET() {
  const [content, divisions] = await Promise.all([readPublicSiteContent(), readDivisions()]);
  const active = divisions.filter(d => d.status === "active");
  return Response.json(content.contacts.filter(c => c.published && c.whatsapp && active.some(d => contactVisibleInDivision(c,d.slug))).map(c => ({ id: c.id, name: c.name, whatsapp: c.whatsapp, divisions: c.audience === undefined && !c.divisions.length && !contentOwner(c) ? [] : active.filter(d => contactVisibleInDivision(c,d.slug)).map(d => d.slug) })), { headers: { "Cache-Control": "no-store" } });
}
