import "server-only";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Serialise writers inside one Next process, then lock across processes too.
// Global state also covers independently bundled route handlers in Next.
const shared = globalThis as typeof globalThis & { mbiFileWrites?: Map<string, Promise<void>> };
const queues = shared.mbiFileWrites ??= new Map();
export async function withCmsFileLock<T>(file: string, update: () => Promise<T>) {
  const previous = queues.get(file) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>(resolve => { release = resolve; });
  queues.set(file, current);
  await previous;
  const lock = `${file}.lock`;
  let acquired = false;
  try {
    await mkdir(path.dirname(file), { recursive: true });
    for (let attempt = 0; attempt < 32; attempt++) {
      try { await writeFile(lock, "locked", { flag: "wx" }); acquired = true; break; }
      catch(error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        if (attempt === 31) throw new Error("BUSY");
        await new Promise(resolve => setTimeout(resolve, Math.min(250,30*(attempt+1)) + Math.random()*30));
      }
    }
    return await update();
  } finally {
    if (acquired) await unlink(lock).catch(() => {});
    release();
    if (queues.get(file) === current) queues.delete(file);
  }
}

// Antivirus/readers on Windows may temporarily block replacing a file.
// Keep the old document intact and retry the atomic rename, never unlink it.
export async function replaceCmsFile(temp: string, file: string) {
  for (let attempt = 0; ; attempt++) {
    try { await rename(temp,file); return; }
    catch(error) {
      if (attempt >= 12 || !["EPERM","EACCES","EBUSY"].includes((error as NodeJS.ErrnoException).code || "")) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.min(250,40*(attempt+1))));
    }
  }
}
