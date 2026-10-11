import { adminActor, apiError, jsonInput, noStore } from "../../../../src/lib/adminApi";
import { editableDivisions, saveDivision } from "../../../../src/lib/divisionStore";

export const runtime = "nodejs";
export async function GET() { try { const actor = await adminActor(undefined,false); return Response.json(await editableDivisions(actor), { headers: noStore }); } catch(error) { return apiError(error); } }
export async function POST(request: Request) { try { const actor = await adminActor(request,false); return Response.json(await saveDivision(actor,await jsonInput(request)), { status: 201, headers: noStore }); } catch(error) { return apiError(error); } }
