import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { articles } from "../data/articles";
import { ArticleError, articleCollectionSchema, articleInputSchema, articleReadTime, articleRecordSchema, articleSlug, publicArticle, type ArticleInput, type ArticleRecord } from "../data/articleCms";
import { readPreviewBlob, usingPreviewBlob, writePreviewBlob } from "./previewBlobStore";

export const articleDataDirectory = process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data");
const file = path.join(articleDataDirectory, "articles.json");
const seed: ArticleRecord[] = articles.map(article => articleRecordSchema.parse({ ...article, imageAlt: article.title,
  status: "published", revision: 0, firstPublishedAt: `${article.date}T00:00:00.000Z`,
  createdAt: `${article.date}T00:00:00.000Z`, updatedAt: `${article.date}T00:00:00.000Z` }));

export async function readArticles(): Promise<ArticleRecord[]> {
  if (usingPreviewBlob()) return (await readPreviewBlob("articles", articleCollectionSchema, seed)).value;
  try { return articleCollectionSchema.parse(JSON.parse(await readFile(file, "utf8"))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(seed); throw error; }
}

// Request-scoped memoization keeps the metadata, page, and related links consistent.
export const readPublishedArticles = cache(async () => (await readArticles())
  .filter(article => article.status === "published")
  .sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id))
  .map(publicArticle));

async function mutate<T>(update: (records: ArticleRecord[]) => { records: ArticleRecord[]; result: T }): Promise<T> {
  if (usingPreviewBlob()) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const current = await readPreviewBlob("articles", articleCollectionSchema, seed);
      const next = update(current.value);
      if (await writePreviewBlob("articles", current.revision, articleCollectionSchema.parse(next.records))) return next.result;
    }
    throw new ArticleError("BUSY");
  }
  await mkdir(articleDataDirectory, { recursive: true });
  const lock = `${file}.lock`;
  const temp = `${file}.${randomUUID()}.tmp`;
  for (let attempt = 0; attempt < 6; attempt++) {
    try { await writeFile(lock, "locked", { flag: "wx" }); break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (attempt === 5) throw new ArticleError("BUSY");
      await new Promise(resolve => setTimeout(resolve, 30 * (attempt + 1)));
    }
  }
  try {
    const next = update(await readArticles());
    await writeFile(temp, JSON.stringify(articleCollectionSchema.parse(next.records)), "utf8");
    await rename(temp, file);
    return next.result;
  } finally { await unlink(temp).catch(() => {}); await unlink(lock).catch(() => {}); }
}

function ensureSlug(records: ArticleRecord[], slug: string, id?: string) {
  if (records.some(record => record.slug === slug && record.id !== id)) throw new ArticleError("SLUG_EXISTS");
}

export async function createArticle(input: ArticleInput) {
  const parsed = articleInputSchema.parse(input);
  const id = randomUUID();
  return mutate(records => {
    let slug = parsed.slug || articleSlug(parsed.title) || `artikel-${id.slice(0, 8)}`;
    if (!parsed.slug) {
      const base = slug;
      let suffix = 2;
      while (records.some(record => record.slug === slug)) slug = `${base.slice(0, 130)}-${suffix++}`;
    }
    ensureSlug(records, slug);
    const now = new Date().toISOString();
    const saved = articleRecordSchema.parse({ ...parsed, slug, id, revision: 0, readTime: articleReadTime(parsed.content),
      firstPublishedAt: parsed.status === "published" ? now : null, createdAt: now, updatedAt: now });
    return { records: [saved, ...records], result: saved };
  });
}

export async function updateArticle(id: string, revision: number, input: ArticleInput) {
  const parsed = articleInputSchema.parse(input);
  return mutate(records => {
    const current = records.find(record => record.id === id);
    if (!current) throw new ArticleError("NOT_FOUND");
    if (current.revision !== revision) throw new ArticleError("CONFLICT");
    const slug = parsed.slug || articleSlug(parsed.title) || current.slug;
    if (current.firstPublishedAt && slug !== current.slug) throw new ArticleError("SLUG_LOCKED");
    ensureSlug(records, slug, id);
    const now = new Date().toISOString();
    const saved = articleRecordSchema.parse({ ...current, ...parsed, slug, revision: revision + 1,
      readTime: articleReadTime(parsed.content), firstPublishedAt: current.firstPublishedAt || (parsed.status === "published" ? now : null), updatedAt: now });
    return { records: records.map(record => record.id === id ? saved : record), result: saved };
  });
}

export async function deleteArticle(id: string, revision: number) {
  return mutate(records => {
    const current = records.find(record => record.id === id);
    if (!current) throw new ArticleError("NOT_FOUND");
    if (current.revision !== revision) throw new ArticleError("CONFLICT");
    return { records: records.filter(record => record.id !== id), result: { deleted: id } };
  });
}
