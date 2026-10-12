import "server-only";
import path from "node:path";
import type { AdminIdentity } from "../data/adminAccount";
import { mediaAllowed } from "./cmsMedia";
import { articleDataDirectory } from "./articleStore";
import { usingPreviewBlob } from "./previewBlobStore";
import { cmsBlobPrefix } from "./cmsStorageConfig";
import { mediaFilename } from "./mediaReferences";
import { blobMediaSource, localMediaSource, missingMedia, respondWithMedia } from "./mediaResponse";

export async function articleImageResponse(filename: string, actor: AdminIdentity | null, request = new Request("http://localhost/")) {
  if (!mediaFilename.test(filename) || filename.endsWith(".mp4")) return missingMedia();
  const source = usingPreviewBlob() ? await blobMediaSource(`${cmsBlobPrefix()}article-media/${filename}`) : await localMediaSource(path.join(articleDataDirectory, "article-media", filename));
  if (!source || !await mediaAllowed(`/api/articles/media/${filename}`, actor)) return missingMedia();
  const mime = filename.endsWith(".jpg") ? "image/jpeg" : filename.endsWith(".png") ? "image/png" : "image/webp";
  return respondWithMedia(request, source, mime, filename);
}
