import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { ArticleError } from "../data/articleCms";
import { articleDataDirectory, readArticles } from "./articleStore";
import { usingPreviewBlob } from "./previewBlobStore";

const prefix = "mahameru-preview/v1/article-media/";
const directory = path.join(articleDataDirectory, "article-media");
function imageType(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return { extension: "jpg", mime: "image/jpeg" };
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { extension: "png", mime: "image/png" };
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return { extension: "webp", mime: "image/webp" };
  return null;
}

export async function saveArticleImage(media: FormDataEntryValue | null) {
  if (!(media instanceof File) || media.size < 1 || media.size > 4_000_000) throw new ArticleError("INVALID_IMAGE");
  const bytes = Buffer.from(await media.arrayBuffer());
  const type = imageType(bytes);
  if (!type || media.type !== type.mime) throw new ArticleError("INVALID_IMAGE");
  const filename = `${randomUUID()}.${type.extension}`;
  if (usingPreviewBlob()) await put(`${prefix}${filename}`, bytes, { access: "private", addRandomSuffix: false, contentType: type.mime });
  else { await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, filename), bytes, { flag: "wx" }); }
  return { url: `/api/articles/media/${filename}` };
}

export async function articleImageResponse(filename: string, admin: boolean) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|png|webp)$/.test(filename)) return new Response(null, { status: 404 });
  const url = `/api/articles/media/${filename}`;
  if (!admin && !(await readArticles()).some(record => record.status === "published" && (record.image === url || record.content.includes(`](${url})`) || record.content.includes(`](${url} \"`)))) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }
  const type = filename.endsWith(".jpg") ? "image/jpeg" : filename.endsWith(".png") ? "image/png" : "image/webp";
  const headers = { "Content-Type": type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  if (usingPreviewBlob()) {
    const blob = await get(`${prefix}${filename}`, { access: "private" });
    if (!blob?.stream) return new Response(null, { status: 404, headers });
    return new Response(blob.stream, { headers });
  }
  try { const bytes = await readFile(path.join(directory, filename)); return new Response(new Uint8Array(bytes), { headers }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Response(null, { status: 404, headers }); throw error; }
}
