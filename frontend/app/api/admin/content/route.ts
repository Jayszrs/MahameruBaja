import { adminActor, apiError, jsonInput, noStore } from "../../../../src/lib/adminApi";
import { siteContentSchema } from "../../../../src/data/siteContent";
import { readSiteContent, writeSiteContent } from "../../../../src/lib/siteContentStore";
import { scopeContent, normalizeOwnership } from "../../../../src/lib/contentScope";
export const runtime = "nodejs";
export async function GET() { try { const actor = await adminActor(); return Response.json(scopeContent(await readSiteContent(), actor), { headers: noStore }); } catch(error) { return apiError(error); } }
export async function PUT(request: Request) { try { const actor = await adminActor(request); const json = await jsonInput(request,2000000); const input = normalizeOwnership(siteContentSchema.parse(json)); const base = json._base ? normalizeOwnership(siteContentSchema.parse(json._base)) : scopeContent(await readSiteContent(),actor); return Response.json(await writeSiteContent(input,base,actor), { headers: noStore }); } catch(error) { return apiError(error); } }
