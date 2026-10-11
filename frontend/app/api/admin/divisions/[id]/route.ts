import { z } from "zod";
import { adminActor, apiError, jsonInput, noStore } from "../../../../../src/lib/adminApi";
import { editableDivisions, saveDivision, deleteDivision } from "../../../../../src/lib/divisionStore";
import { CmsError } from "../../../../../src/lib/cmsError";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, {params}: Context) { try { const actor = await adminActor(undefined,false); const id = (await params).id; const record = (await editableDivisions(actor)).find(d => d.id === id); if(!record) throw new CmsError("Data tidak ditemukan.",404); return Response.json(record,{headers:noStore}); } catch(error) { return apiError(error); } }
export async function PUT(request: Request, {params}: Context) { try { const actor = await adminActor(request,false); const json = await jsonInput(request); const revision = z.number().int().nonnegative().parse(json.revision); return Response.json(await saveDivision(actor,json,(await params).id,revision),{headers:noStore}); } catch(error) { return apiError(error); } }
export async function DELETE(request: Request, {params}: Context) { try { const actor = await adminActor(request,false); const json = await jsonInput(request); return Response.json(await deleteDivision(actor,(await params).id,z.number().int().nonnegative().parse(json.revision)),{headers:noStore}); } catch(error) { return apiError(error); } }
