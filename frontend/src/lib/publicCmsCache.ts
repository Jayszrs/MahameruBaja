import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache, revalidateTag } from "next/cache";
import { cmsBlobPrefix } from "./cmsStorageConfig";

// Keep fresh reads for authentication, mutations and local/self-hosted development.
// This app has not enabled Cache Components; use the existing Data Cache API.
const publicKeys = new Set(["site-content", "divisions", "articles", "media-index"]);
function scope() {
  return createHash("sha256").update(`${cmsBlobPrefix()}\0${process.env.BLOB_READ_WRITE_TOKEN || ""}`).digest("hex");
}
function tag() { return `mbi-public-cms:${scope()}`; }

export async function cachedPublicCms<T>(key: string, read: () => Promise<T>): Promise<T> {
  if (process.env.VERCEL !== "1" || !process.env.BLOB_READ_WRITE_TOKEN) return read();
  // Shared across function instances. CMS writes expire this immediately; the
  // six-hour bound also picks up changes made outside this deployment.
  return unstable_cache(read, ["mbi-public-cms-v1", scope(), key], { tags: [tag()], revalidate: 21600 })();
}

export function invalidatePublicCms(key: string) {
  if (publicKeys.has(key) && process.env.VERCEL === "1" && process.env.BLOB_READ_WRITE_TOKEN) {
    // Never serve stale unpublished content after an authenticated CMS save.
    revalidateTag(tag(), { expire: 0 });
  }
}
