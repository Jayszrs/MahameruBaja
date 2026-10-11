import { z } from "zod";
import { adminActor, apiError, jsonInput, noStore } from "../../../../../src/lib/adminApi";
import { readAccounts, saveAccount, deleteAccount } from "../../../../../src/lib/accountStore";
import { CmsError } from "../../../../../src/lib/cmsError";
import { publicAccount } from "../../../../../src/data/adminAccount";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, {params}: Context) { try { const actor = await adminActor(undefined,true); const id = (await params).id; const record = (await readAccounts()).find(d => d.id === id); if(!record) throw new CmsError("Data tidak ditemukan.",404); return Response.json(publicAccount(record),{headers:noStore}); } catch(error) { return apiError(error); } }
export async function PUT(request: Request, {params}: Context) { try { const actor = await adminActor(request,true); const json = await jsonInput(request); const revision = z.number().int().nonnegative().parse(json.revision); return Response.json(await saveAccount(actor,json,(await params).id,revision),{headers:noStore}); } catch(error) { return apiError(error); } }
export async function DELETE(request: Request, {params}: Context) { try { const actor = await adminActor(request,true); const json = await jsonInput(request); return Response.json(await deleteAccount(actor,(await params).id,z.number().int().nonnegative().parse(json.revision)),{headers:noStore}); } catch(error) { return apiError(error); } }
