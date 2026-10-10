import { articleInputSchema } from "../../../../src/data/articleCms";
import { createArticle, readArticles } from "../../../../src/lib/articleStore";
import { articleAuthorized, articleFailure, articleJson, articleNoStore } from "../../../../src/lib/articleApi";

export const runtime = "nodejs";
export async function GET() {
  const denied = await articleAuthorized(); if (denied) return denied;
  try { return Response.json(await readArticles(), { headers: articleNoStore }); }
  catch (error) { return articleFailure(error); }
}
export async function POST(request: Request) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try { return Response.json(await createArticle(articleInputSchema.parse(await articleJson(request))), { status: 201, headers: articleNoStore }); }
  catch (error) { return articleFailure(error); }
}
