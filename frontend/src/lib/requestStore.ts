import "server-only";
import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requestRecordSchema, type RequestInput, type RequestRecord } from "../data/requests";
import { readPreviewBlob, usingPreviewBlob, writePreviewBlob } from "./previewBlobStore";

const directory = process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data");
const file = path.join(directory, "requests.json");
export async function readRequests() {
  if (usingPreviewBlob()) return (await readPreviewBlob("requests", z.array(requestRecordSchema), [] as RequestRecord[])).value;
  try { return z.array(requestRecordSchema).parse(JSON.parse(await readFile(file, "utf8"))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
async function mutate<T>(update: (records: RequestRecord[]) => { records: RequestRecord[]; result: T }): Promise<T> {
  if (usingPreviewBlob()) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const current = await readPreviewBlob("requests", z.array(requestRecordSchema), [] as RequestRecord[]);
      const { records, result } = update(current.value);
      if (await writePreviewBlob("requests", current.revision, records)) return result;
    }
    throw new Error("BUSY");
  }
  await mkdir(directory, { recursive: true });
  const lock = `${file}.lock`; const temp = `${file}.${randomUUID()}.tmp`;
  for (let attempt = 0; attempt < 6; attempt++) {
    try { await writeFile(lock, "locked", { flag: "wx" }); break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (attempt === 5) throw new Error("BUSY");
      await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1)));
    }
  }
  try {
    const { records, result } = update(await readRequests());
    await writeFile(temp, JSON.stringify(records), "utf8"); await rename(temp, file); return result;
  } finally { await unlink(temp).catch(() => {}); await unlink(lock).catch(() => {}); }
}
export async function createRequest(input: RequestInput, idempotencyKey?: string) {
  return mutate(records => {
    const existing = idempotencyKey && records.find(r => r.idempotencyKey === idempotencyKey);
    if (existing) return { records, result: existing };
    const now = new Date().toISOString();
    const record = requestRecordSchema.parse({ ...input, id: `MBI-${now.slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`, revision: 0, createdAt: now, updatedAt: now, status: "Baru", notes: "", archived: false, idempotencyKey });
    return { records: [record, ...records], result: record };
  });
}
export async function updateRequest(id: string, revision: number, update: Partial<RequestInput> & { status?: RequestRecord["status"]; notes?: string; archived?: boolean }) {
  return mutate(records => {
    const current = records.find(r => r.id === id);
    if (!current) throw new Error("NOT_FOUND");
    if (current.revision !== revision) throw new Error("CONFLICT");
    const saved = requestRecordSchema.parse({ ...current, ...update, id, revision: revision + 1, updatedAt: new Date().toISOString() });
    return { records: records.map(r => r.id === id ? saved : r), result: saved };
  });
}
