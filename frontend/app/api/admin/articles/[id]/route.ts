import { ArticleError, articleRevisionSchema, articleUpdateSchema } from "../../../../../src/data/articleCms";
import { deleteArticle, readArticles, updateArticle } from "../../../../../src/lib/articleStore";
import { articleAuthorized, articleFailure, articleJson, articleNoStore } from "../../../../../src/lib/articleApi";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  const denied = await articleAuthorized(); if (denied) return denied;
  try {
    const { id } = await params;
    const article = (await readArticles()).find(record => record.id === id);
    if (!article) throw new ArticleError("NOT_FOUND");
    return Response.json(article, { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
export async function PUT(request: Request, { params }: Context) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try {
    const input = articleUpdateSchema.parse(await articleJson(request));
    return Response.json(await updateArticle((await params).id, input.revision, input), { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
export async function DELETE(request: Request, { params }: Context) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try {
    const input = articleRevisionSchema.parse(await articleJson(request));
    return Response.json(await deleteArticle((await params).id, input.revision), { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
