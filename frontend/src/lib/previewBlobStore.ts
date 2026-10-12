import "server-only";

import { get, list, put } from "@vercel/blob";
import { z } from "zod";
import { cmsBlobPrefix } from "./cmsStorageConfig";
import { invalidatePublicCms } from "./publicCmsCache";

type Snapshot = { revision: number; etag?: string };
const envelopeSchema = z.object({ format: z.literal(1), revision: z.number().int().nonnegative().safe(), value: z.unknown() }).strict();
const currentPath = (key: string) => `${cmsBlobPrefix()}${key}/current.json`;

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
    const page = await list({ prefix: `${cmsBlobPrefix()}${key}/rev-`, limit: 1000, cursor });
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

const inFlightDocuments = new Map<string, Promise<{ format: 1; revision: number; value?: unknown; etag: string } | null>>();

async function currentDocument(key: string) {
  const pending = inFlightDocuments.get(key);
  if (pending) return pending;

  const readPromise = (async () => {
    const result = await get(currentPath(key), { access: "private", useCache: false });
    if (!result) return null;
    if (!result.stream || !result.blob.etag) throw new Error("STORAGE_READ_FAILED");
    const envelope = envelopeSchema.parse(JSON.parse(await new Response(result.stream).text()));
    return { ...envelope, etag: result.blob.etag };
  })();

  inFlightDocuments.set(key, readPromise);
  try {
    return await readPromise;
  } finally {
    inFlightDocuments.delete(key);
  }
}

function isBlobUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Vercel Blob|403 Forbidden|STORAGE_READ_FAILED/.test(message);
}

export async function readPreviewBlob<S extends z.ZodTypeAny>(key: string, schema: S, fallback: z.output<S>): Promise<{ value: z.output<S> } & Snapshot> {
  try {
    const current = await currentDocument(key);
    if (current) return { value: schema.parse(current.value), revision: current.revision, etag: current.etag };
    // Backward-compatible read only: existing revision files are never deleted
    // or silently replaced by defaults. The first successful CMS save migrates
    // this collection to its single CAS-protected current document.
    const latest = await latestPath(key);
    if (!latest) return { value: structuredClone(fallback), revision: 0 };
    const result = await get(latest.pathname, { access: "private", useCache: false });
    if (!result?.stream) throw new Error("STORAGE_READ_FAILED");
    const value = schema.parse(JSON.parse(await new Response(result.stream).text()));
    return { value, revision: latest.revision };
  } catch (error) {
    if (isBlobUnavailable(error)) {
      console.error(`Preview Blob unavailable for ${key}; serving fallback data`, error);
      return { value: structuredClone(fallback), revision: 0 };
    }
    throw error;
  }
}

export async function writePreviewBlob<T>(key: string, snapshot: Snapshot, value: T) {
  inFlightDocuments.delete(key);
  const revision = snapshot.revision + 1;
  if (!Number.isSafeInteger(revision) || revision < 1) throw new Error("STORAGE_REVISION_INVALID");
  try {
    await put(currentPath(key), JSON.stringify({ format: 1, revision, value }), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
      ...(snapshot.etag ? { allowOverwrite: true, ifMatch: snapshot.etag } : { allowOverwrite: false }),
    });
  } catch (error) {
    // Conditional create/update conflicts never overwrite another admin's
    // changes. No list() is needed, including an uncertain write result.
    const current = await currentDocument(key);
    if (current && current.revision >= revision) {
      // The write may have committed before its response timed out. Expire
      // public projections even when the caller receives a conflict result.
      invalidatePublicCms(key);
      return false;
    }
    throw error;
  }
  invalidatePublicCms(key);
  return true;
}
