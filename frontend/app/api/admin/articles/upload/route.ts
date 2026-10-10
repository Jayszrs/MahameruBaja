import { ArticleError } from "../../../../../src/data/articleCms";
import { articleAuthorized, articleBodyBytes, articleFailure, articleNoStore } from "../../../../../src/lib/articleApi";
import { saveArticleImage } from "../../../../../src/lib/articleMedia";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const denied = await articleAuthorized(request); if (denied) return denied;
  try {
    const bytes = await articleBodyBytes(request, 4_300_000);
    let form: FormData;
    try { form = await new Response(bytes.buffer as ArrayBuffer, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData(); }
    catch { throw new ArticleError("INVALID_IMAGE"); }
    return Response.json(await saveArticleImage(form.get("image")), { headers: articleNoStore });
  } catch (error) { return articleFailure(error); }
}
