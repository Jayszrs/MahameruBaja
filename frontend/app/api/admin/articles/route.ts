import { articleInputSchema } from "../../../../src/data/articleCms";
import { createArticle, readArticles } from "../../../../src/lib/articleStore";
import { articleAuthorized, articleFailure, articleJson, articleNoStore } from "../../../../src/lib/articleApi";

import { adminActor } from "../../../../src/lib/adminApi";
import { contentOwner } from "../../../../src/data/divisionCms";
export const runtime = "nodejs";
export async function GET() {
  const denied = await articleAuthorized(); if (denied) return denied;
  try { const actor = await adminActor(); return Response.json((await readArticles()).filter(a=>!actor.division || contentOwner(a) === actor.division), { headers: articleNoStore }); }
  catch (error) { return articleFailure(error); }
}
export async function POST(request: Request) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try { const actor=await adminActor(request); return Response.json(await createArticle(articleInputSchema.parse(await articleJson(request)), actor), { status: 201, headers: articleNoStore }); }
  catch (error) { return articleFailure(error); }
}
