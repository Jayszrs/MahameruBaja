// Entirely in-memory Blob + Data Cache adapters; no real tokens or stores.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requirePackage = createRequire(path.join(frontend, "package.json"));
const ts = requirePackage("typescript"), { z } = requirePackage("zod");
const previous = Object.fromEntries(["VERCEL", "BLOB_READ_WRITE_TOKEN", "CMS_BLOB_PREFIX"].map(key => [key, process.env[key]]));
const memory = new Map(), dataCache = new Map();
let serial = 0, lists = 0, gets = 0, puts = 0, invalidations = 0, failRead = false, failWrite = false;
const prefix = "mahameru-blob-optimization-fixture/v1/";
const store = (key, value) => memory.set(key, { text: JSON.stringify(value), etag: `etag-${++serial}` });
const adapter = {
  async get(key, options) {
    gets++; assert.equal(options.access, "private"); assert.equal(options.useCache, false);
    if (failRead) throw new Error("FIXTURE_403");
    const row = memory.get(key);
    return row ? { stream: new Response(row.text).body, blob: { etag: row.etag } } : null;
  },
  async list(options) {
    lists++;
    // Force pagination, including revision names whose lexical order differs.
    const rows = [...memory.keys()].filter(key => key.startsWith(options.prefix)).sort();
    const offset = Number(options.cursor || 0);
    return { blobs: rows.slice(offset, offset + 1).map(pathname => ({ pathname })), hasMore: offset + 1 < rows.length, cursor: String(offset + 1) };
  },
  async put(key, text, options) {
    puts++; assert.equal(options.access, "private"); assert.equal(options.addRandomSuffix, false);
    assert.equal(options.cacheControlMaxAge, 60);
    await new Promise(resolve => setTimeout(resolve, 1));
    if (failWrite) throw new Error("FIXTURE_WRITE_OUTAGE");
    const prior = memory.get(key);
    if (options.ifMatch ? prior?.etag !== options.ifMatch : prior && !options.allowOverwrite) throw new Error("FIXTURE_CAS_CONFLICT");
    memory.set(key, { text, etag: `etag-${++serial}` });
  },
};
const cacheAdapter = {
  unstable_cache(read, keys, options) {
    assert.equal(options.revalidate, 21600);
    assert.equal(options.tags.length, 1);
    assert.ok(!keys.join(":").includes(process.env.BLOB_READ_WRITE_TOKEN), "Token not exposed as a cache key");
    const key = JSON.stringify(keys);
    return async () => {
      if (!dataCache.has(key)) {
        const pending = read(); dataCache.set(key, { pending, tags: options.tags });
        pending.catch(() => { if (dataCache.get(key)?.pending === pending) dataCache.delete(key); });
      }
      return structuredClone(await dataCache.get(key).pending);
    };
  },
  revalidateTag(tag, profile) {
    invalidations++; assert.deepEqual(profile, { expire: 0 });
    for (const [key, value] of dataCache) if (value.tags.includes(tag)) dataCache.delete(key);
  },
};
function loader() {
  const loaded = new Map();
  function load(file) {
    file = path.resolve(file); if (loaded.has(file)) return loaded.get(file).exports;
    const module = { exports: {} }; loaded.set(file, module);
    const require = name => {
      if (name === "server-only") return {};
      if (name === "@vercel/blob") return adapter;
      if (name === "next/cache") return cacheAdapter;
      if (!name.startsWith(".")) return requirePackage(name);
      return load(path.resolve(path.dirname(file), `${name}.ts`));
    };
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
    new Function("require", "module", "exports", compiled)(require, module, module.exports);
    return module.exports;
  }
  return name => load(path.join(frontend, "src/lib", `${name}.ts`));
}
try {
  process.env.VERCEL = "1"; process.env.BLOB_READ_WRITE_TOKEN = "fixture-token-not-a-real-credential"; process.env.CMS_BLOB_PREFIX = prefix;
  const one = loader(), two = loader();
  const blob = one("previewBlobStore"), otherBlob = two("previewBlobStore");
  const cache = one("publicCmsCache"), otherCache = two("publicCmsCache");
  const schema = z.object({ items: z.array(z.string()) }), fallback = { items: [] };
  const legacyA = `${prefix}site-content/rev-2.json`, legacyB = `${prefix}site-content/rev-15.json`;
  store(legacyA, { items: ["old"] }); store(legacyB, { items: ["latest", "preserved"] });
  const archivedBytes = memory.get(legacyB).text;
  const first = await blob.readPreviewBlob("site-content", schema, fallback);
  assert.equal(first.revision, 15); assert.deepEqual(first.value.items, ["latest", "preserved"]); assert.equal(lists, 2);
  const second = await otherBlob.readPreviewBlob("site-content", schema, fallback);
  const race = await Promise.all([blob.writePreviewBlob("site-content", first, { items: [...first.value.items, "one"] }), otherBlob.writePreviewBlob("site-content", second, { items: [...second.value.items, "two"] })]);
  assert.equal(race.filter(Boolean).length, 1, "Conditional migration creates exactly one current document");
  assert.equal(memory.get(legacyB).text, archivedBytes); assert.ok(memory.has(legacyA));
  const saved = await blob.readPreviewBlob("site-content", schema, fallback);
  assert.equal(saved.revision, 16); assert.ok(saved.etag); assert.equal(saved.value.items.length, 3);
  console.log("PASS: paginated legacy recovery, nondestructive migration and independent-instance create conflict");

  const beforeLists = lists;
  for (let i = 0; i < 1000; i++) await blob.readPreviewBlob("site-content", schema, fallback);
  assert.equal(lists - beforeLists, 0);
  console.log("MEASURED: 1,000 fresh reads after migration = 0 list operations (old implementation: at least 1,000)");
  const oldSize = memory.size;
  for (let i = 0; i < 10; i++) {
    const snapshot = await blob.readPreviewBlob("site-content", schema, fallback);
    assert.ok(await blob.writePreviewBlob("site-content", snapshot, { items: [...snapshot.value.items, `edit-${i}`] }));
  }
  assert.equal(memory.size, oldSize, "Repeated edits do not accumulate full-document revision blobs");
  const stale = await blob.readPreviewBlob("site-content", schema, fallback);
  assert.ok(await otherBlob.writePreviewBlob("site-content", stale, { items: ["fresh"] }));
  assert.equal(await blob.writePreviewBlob("site-content", stale, { items: ["stale"] }), false);
  assert.deepEqual((await blob.readPreviewBlob("site-content", schema, fallback)).value.items, ["fresh"]);
  const sameKey = `${prefix}site-content/current.json`;
  const previousBytes = memory.get(sameKey).text;
  const fresh = await blob.readPreviewBlob("site-content", schema, fallback);
  failWrite = true;
  await assert.rejects(() => blob.writePreviewBlob("site-content", fresh, { items: [] }), /FIXTURE_WRITE_OUTAGE/);
  failWrite = false; assert.equal(memory.get(sameKey).text, previousBytes);
  failRead = true;
  const listAtOutage = lists;
  await assert.rejects(() => blob.readPreviewBlob("site-content", schema, fallback), /FIXTURE_403/);
  assert.equal(lists, listAtOutage, "Access failures never fall through to legacy/default data");
  failRead = false;
  console.log("PASS: bounded storage, stale ETag rejection and read/write outages fail closed");

  const beforeGets = gets;
  for (let i = 0; i < 1000; i++) {
    const instance = i % 2 ? otherCache : cache;
    const value = await instance.cachedPublicCms("fixture-public", () => blob.readPreviewBlob("site-content", schema, fallback));
    assert.deepEqual(value.value.items, ["fresh"]);
  }
  assert.equal(gets - beforeGets, 1, "Public cache shared by independent module instances");
  console.log("MEASURED: 1,000 warm public reads = 1 Blob get, 0 list operations (Data Cache adapter)");
  assert.ok(await blob.writePreviewBlob("site-content", fresh, { items: ["published-update"] }));
  assert.deepEqual((await otherCache.cachedPublicCms("fixture-public", () => blob.readPreviewBlob("site-content", schema, fallback))).value.items, ["published-update"]);
  const uncertain = await blob.readPreviewBlob("site-content", schema, fallback);
  const originalPut = adapter.put;
  adapter.put = async (...args) => { await originalPut(...args); throw new Error("RESPONSE_LOST_AFTER_COMMIT"); };
  assert.equal(await blob.writePreviewBlob("site-content", uncertain, { items: ["unpublished"] }), false);
  adapter.put = originalPut;
  assert.deepEqual((await otherCache.cachedPublicCms("fixture-public", () => blob.readPreviewBlob("site-content", schema, fallback))).value.items, ["unpublished"], "Uncertain committed writes also expire cached public content");
  assert.ok(dataCache.size > 0);
  const beforePrivateWrites = invalidations;
  cache.invalidatePublicCms("accounts"); cache.invalidatePublicCms("requests");
  assert.equal(invalidations, beforePrivateWrites, "Authentication/request writes do not churn the public cache");
  cache.invalidatePublicCms("divisions"); assert.equal(dataCache.size, 0, "Archiving a division expires related media/article/content projections too");
  const missing = await blob.readPreviewBlob("missing", schema, fallback); missing.value.items.push("not-seed");
  assert.deepEqual(fallback.items, []);
  await assert.rejects(() => cache.cachedPublicCms("broken", async () => { throw new Error("FAILED_READ"); }), /FAILED_READ/);
  assert.equal(await cache.cachedPublicCms("broken", async () => "recovered"), "recovered", "Read errors are not cached");
  process.env.CMS_BLOB_PREFIX = "mahameru-other-fixture/v1/";
  assert.equal(await cache.cachedPublicCms("fixture-public", async () => "other-namespace"), "other-namespace");
  process.env.BLOB_READ_WRITE_TOKEN = "different-fixture-token";
  assert.equal(await cache.cachedPublicCms("fixture-public", async () => "other-store"), "other-store");
  process.env.VERCEL = "";
  let localReads = 0;
  for (let i = 0; i < 2; i++) await cache.cachedPublicCms("fixture-local", async () => ++localReads);
  assert.equal(localReads, 2);
  console.log("PASS: immediate publication invalidation, isolated stores, uncached local reads and no cached errors");
  console.log(`Fixture calls: ${gets} get, ${lists} list, ${puts} put. No live Blob access or deletion.`);
} finally {
  for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
}
