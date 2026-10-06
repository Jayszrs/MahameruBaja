import "server-only";

import { get, list, put } from "@vercel/blob";
import { z } from "zod";

const prefix = "mahameru-preview/v1/";

export function usingPreviewBlob() {
  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("STORAGE_UNCONFIGURED");
  }
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function latestPath(key: string) {
  let cursor: string | undefined;
  let latest: { revision: number; pathname: string } | undefined;
  do {
    const page = await list({ prefix: `${prefix}${key}/rev-`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = /\/rev-(\d+)\.json$/.exec(blob.pathname);
      if (!match) continue;
      const revision = Number(match[1]);
      if (!latest || revision > latest.revision) latest = { revision, pathname: blob.pathname };
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return latest;
}

export async function readPreviewBlob<S extends z.ZodTypeAny>(key: string, schema: S, fallback: z.output<S>): Promise<{ value: z.output<S>; revision: number }> {
  const latest = await latestPath(key);
  if (!latest) return { value: structuredClone(fallback), revision: 0 };
  const result = await get(latest.pathname, { access: "private" });
  if (!result?.stream) throw new Error("STORAGE_READ_FAILED");
  const value = schema.parse(JSON.parse(await new Response(result.stream).text()));
  return { value, revision: latest.revision };
}

export async function writePreviewBlob<T>(key: string, revision: number, value: T) {
  const pathname = `${prefix}${key}/rev-${String(revision + 1).padStart(10, "0")}.json`;
  try {
    await put(pathname, JSON.stringify(value), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return true;
  } catch (error) {
    // A concurrent writer may have created this revision first.
    const latest = await latestPath(key);
    if (latest && latest.revision >= revision + 1) return false;
    throw error;
  }
}
