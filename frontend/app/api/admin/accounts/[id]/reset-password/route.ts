import { z } from "zod";
import { adminActor, apiError, jsonInput, noStore } from "../../../../../../src/lib/adminApi";
import { resetAccount } from "../../../../../../src/lib/accountStore";
export async function POST(request: Request, {params}: {params:Promise<{id:string}>}) { try { const actor = await adminActor(request,true); const body = await jsonInput(request); return Response.json(await resetAccount(actor,(await params).id,z.number().int().nonnegative().parse(body.revision)),{headers:noStore}); } catch(error) { return apiError(error); } }
