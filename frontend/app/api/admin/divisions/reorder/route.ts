import { adminActor, apiError, jsonInput, noStore } from "../../../../../src/lib/adminApi";
import { recordOrderSchema } from "../../../../../src/lib/recordOrder";
import { reorderDivisions } from "../../../../../src/lib/divisionStore";
export const runtime = "nodejs";
export async function PUT(request: Request) {
  try { const actor = await adminActor(request, true); const { items } = recordOrderSchema.parse(await jsonInput(request)); return Response.json(await reorderDivisions(actor, items), { headers: noStore }); }
  catch (error) { return apiError(error); }
}
