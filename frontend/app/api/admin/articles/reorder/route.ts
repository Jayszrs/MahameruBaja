import { adminActor, apiError, jsonInput, noStore } from "../../../../../src/lib/adminApi";
import { recordOrderSchema } from "../../../../../src/lib/recordOrder";
import { reorderArticles } from "../../../../../src/lib/articleStore";
export const runtime = "nodejs";
export async function PUT(request: Request) {
  try { const actor = await adminActor(request); const { items } = recordOrderSchema.parse(await jsonInput(request)); return Response.json(await reorderArticles(actor, items), { headers: noStore }); }
  catch (error) { return apiError(error); }
}
