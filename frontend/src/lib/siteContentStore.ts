import "server-only";
import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { defaultSiteContent, siteContentSchema, type SiteContent } from "../data/siteContent";
import { readPreviewBlob, usingPreviewBlob, writePreviewBlob } from "./previewBlobStore";

// Local/self-hosted storage. Mount this directory on a persistent volume in production.
const file = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "site-content.json");
export async function readSiteContent(): Promise<SiteContent> {
  if (usingPreviewBlob()) return (await readPreviewBlob("site-content", siteContentSchema, defaultSiteContent)).value;
  try { return siteContentSchema.parse(JSON.parse(await readFile(file, "utf8"))); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(defaultSiteContent);
    throw error;
  }
}
export async function writeSiteContent(input: SiteContent) {
  if (usingPreviewBlob()) {
    const current = await readPreviewBlob("site-content", siteContentSchema, defaultSiteContent);
    if (current.value.revision !== input.revision) throw new Error("CMS_CONFLICT");
    const saved = siteContentSchema.parse({ ...input, revision: input.revision + 1 });
    if (!await writePreviewBlob("site-content", current.revision, saved)) throw new Error("CMS_CONFLICT");
    return saved;
  }
  await mkdir(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  try { await writeFile(lock, "locked", { flag: "wx" }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error("CMS_BUSY"); throw error; }
  const temp = `${file}.${randomUUID()}.tmp`;
  try {
    const current = await readSiteContent();
    if (current.revision !== input.revision) throw new Error("CMS_CONFLICT");
    const saved = siteContentSchema.parse({ ...input, revision: current.revision + 1 });
    await writeFile(temp, JSON.stringify(saved, null, 2), "utf8");
    await rename(temp, file);
    return saved;
  } finally {
    await unlink(temp).catch(() => {});
    await unlink(lock).catch(() => {});
  }
}
