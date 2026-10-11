import { adminActor, apiError, jsonInput, noStore } from "../../../../src/lib/adminApi";
import { readAccounts, saveAccount } from "../../../../src/lib/accountStore";
import { publicAccount } from "../../../../src/data/adminAccount";
export const runtime = "nodejs";
export async function GET() { try { const actor = await adminActor(undefined,true); return Response.json((await readAccounts()).map(publicAccount), { headers: noStore }); } catch(error) { return apiError(error); } }
export async function POST(request: Request) { try { const actor = await adminActor(request,true); return Response.json(await saveAccount(actor,await jsonInput(request)), { status: 201, headers: noStore }); } catch(error) { return apiError(error); } }
