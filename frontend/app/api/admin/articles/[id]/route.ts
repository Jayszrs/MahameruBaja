import { ArticleError, articleRevisionSchema, articleUpdateSchema } from "../../../../../src/data/articleCms";
import { deleteArticle, readArticles, updateArticle } from "../../../../../src/lib/articleStore";
import { articleAuthorized, articleFailure, articleJson, articleNoStore } from "../../../../../src/lib/articleApi";

import { adminActor } from "../../../../../src/lib/adminApi";
import { contentOwner } from "../../../../../src/data/divisionCms";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  const denied = await articleAuthorized(); if (denied) return denied;
  try {
    const actor = await adminActor();
    const { id } = await params;
    const article = (await readArticles()).find(record => record.id === id && (!actor.division || contentOwner(record) === actor.division));
    if (!article) throw new ArticleError("NOT_FOUND");
    return Response.json(article, { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
export async function PUT(request: Request, { params }: Context) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try {
    const actor=await adminActor(request);
    const input = articleUpdateSchema.parse(await articleJson(request));
    return Response.json(await updateArticle((await params).id, input.revision, input, actor), { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
export async function DELETE(request: Request, { params }: Context) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try {
    const actor=await adminActor(request);
    const input = articleRevisionSchema.parse(await articleJson(request));
    return Response.json(await deleteArticle((await params).id, input.revision, actor), { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
