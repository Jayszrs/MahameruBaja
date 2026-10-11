import "server-only";
import type { AdminIdentity } from "../data/adminAccount";
import { mediaAllowed } from "./cmsMedia";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { get } from "@vercel/blob";
import { articleDataDirectory } from "./articleStore";
import { usingPreviewBlob } from "./previewBlobStore";

const prefix = "mahameru-preview/v1/article-media/";
const directory = path.join(articleDataDirectory, "article-media");
export async function articleImageResponse(filename: string, admin: AdminIdentity | null) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|png|webp)$/.test(filename)) return new Response(null, { status: 404 });
  const url = `/api/articles/media/${filename}`;
  if (!await mediaAllowed(url, admin)) {
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
