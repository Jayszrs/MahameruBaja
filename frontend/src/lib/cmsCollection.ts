import "server-only";
import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { readPreviewBlob, writePreviewBlob, usingPreviewBlob } from "./previewBlobStore";
import { replaceCmsFile, withCmsFileLock } from "./cmsFileLock";

export function cmsCollection<S extends z.ZodTypeAny>(key: string, schema: S, fallback: () => z.output<S>) {
  type T = z.output<S>;
  const file = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), `${key}.json`);
  async function read(): Promise<T> {
    if (usingPreviewBlob()) return (await readPreviewBlob(key, schema, fallback())).value;
    try { return schema.parse(JSON.parse(await readFile(file, "utf8"))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback(); throw error; }
  }
  async function mutate<R>(update: (value: T) => Promise<{ value: T; result: R }> | { value: T; result: R }): Promise<R> {
    if (usingPreviewBlob()) {
      for (let attempt = 0; attempt < 6; attempt++) {
        const current = await readPreviewBlob(key, schema, fallback());
        const next = await update(current.value);
        if (await writePreviewBlob(key, current.revision, schema.parse(next.value))) return next.result;
      }
      throw new Error("BUSY");
    }
    return withCmsFileLock(file, async () => {
      const next = await update(await read()); const temp = `${file}.${randomUUID()}.tmp`;
      try { await writeFile(temp, JSON.stringify(schema.parse(next.value)), { encoding: "utf8", mode: 0o600 }); await replaceCmsFile(temp, file); }
      finally { await unlink(temp).catch(() => {}); }
      return next.result;
    });
  }
  return { read, mutate };
}
