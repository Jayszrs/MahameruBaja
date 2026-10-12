import assert from "node:assert/strict";
import sharp from "sharp";
import { normalizeUpload } from "../src/lib/mediaValidation.ts";
import { mediaReferences, referencesMedia } from "../src/lib/mediaReferences.ts";
import { parseMediaRange, respondWithMedia } from "../src/lib/mediaResponse.ts";
import { cmsVideo } from "./fixtures/cms-video.mjs";

let checks = 0;
const file = (bytes, type, name = "fixture") => new File([bytes], name, { type });
async function rejects(bytes, type, kind = "media", status = 400) { checks++; await assert.rejects(() => normalizeUpload(file(bytes, type), kind), error => error.status === status); }

const raw = { create: { width: 12, height: 7, channels: 4, background: { r: 230, g: 40, b: 20, alpha: 0.4 } } };
for (const [format, mime] of [["jpeg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"]]) {
  const original = await sharp(raw).toFormat(format).toBuffer();
  const normalized = await normalizeUpload(file(original, mime), "image");
  const metadata = await sharp(normalized.bytes).metadata(); checks += 4;
  assert.equal(normalized.type, "image"); assert.equal(metadata.format, format); assert.equal(metadata.width, 12); assert.equal(metadata.hasAlpha, format !== "jpeg");
}
const gpsImage = await sharp(raw).jpeg().withMetadata({ orientation: 6 }).withExifMerge({ IFD0: { Artist: "CMS fixture" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "1/1 2/1 3/1", GPSLongitudeRef: "E", GPSLongitude: "1/1 2/1 3/1" } }).toBuffer();
const before = await sharp(gpsImage).metadata(); assert(before.exif && before.orientation === 6);
const result = await normalizeUpload(file(gpsImage, "image/jpeg"), "image");
const after = await sharp(result.bytes).metadata(); checks += 5;
assert.equal(after.width, 7); assert.equal(after.height, 12); assert.equal(after.exif, undefined); assert.equal(after.orientation, undefined); assert.equal(after.icc, undefined);
await rejects(Buffer.from("<svg onload=alert(1)></svg>"), "image/svg+xml", "image");
await rejects(Buffer.from("GIF89a"), "image/gif", "image");
await rejects(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), "image/png", "image");
await rejects(await sharp(raw).png().toBuffer(), "image/jpeg", "image");
await rejects(Buffer.alloc(4_000_001), "image/png", "image", 413);
await rejects(Buffer.alloc(30_000_001), "video/mp4", "video", 413);
const previousVercel = process.env.VERCEL; process.env.VERCEL = "1";
try { await rejects(Buffer.alloc(4_000_001), "video/mp4", "video", 413); }
finally { if (previousVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = previousVercel; }
await rejects(await sharp({ create: { width: 8000, height: 6000, channels: 3, background: "white" } }).png().toBuffer(), "image/png", "image");
const video = await normalizeUpload(file(cmsVideo, "video/mp4"), "video"); checks += 2;
assert.equal(video.type, "video"); assert.deepEqual(video.bytes, cmsVideo);
await rejects(cmsVideo, "video/mp4", "image");
await rejects(await sharp(raw).png().toBuffer(), "image/png", "video");
await rejects(Buffer.from([0, 0, 0, 12, ...Buffer.from("ftypisom")]), "video/mp4", "video");
await rejects(cmsVideo.subarray(0, cmsVideo.length - 1), "video/mp4", "video");
const hevc = Buffer.from(cmsVideo); hevc.write("hvc1", hevc.indexOf(Buffer.from("avc1"), 100)); await rejects(hevc, "video/mp4", "video");
const invalidSample = Buffer.from(cmsVideo); invalidSample.writeUInt32BE(0xfffffff0, invalidSample.indexOf(Buffer.from("stco")) + 12); await rejects(invalidSample, "video/mp4", "video");
const inflatedTable = Buffer.from(cmsVideo); inflatedTable.writeUInt32BE(0x7fffffff, inflatedTable.indexOf(Buffer.from("stsz")) + 12); await rejects(inflatedTable, "video/mp4", "video");
const compact = Buffer.from(cmsVideo); compact.write("stz2", compact.indexOf(Buffer.from("stsz"))); await rejects(compact, "video/mp4", "video");
const fragmented = Buffer.concat([cmsVideo, Buffer.from([0, 0, 0, 8, ...Buffer.from("moof")])]); await rejects(fragmented, "video/mp4", "video");
const inflatedDescriptions = Buffer.from(cmsVideo); inflatedDescriptions.writeUInt32BE(0xffffffff, inflatedDescriptions.indexOf(Buffer.from("stsd")) + 8); await rejects(inflatedDescriptions, "video/mp4", "video");

const url = "/api/cms/media/11111111-1111-4111-8111-111111111111.png";
const article = { image: url, content: `Ordinary text ${url}\n\n[Link](${url})\n\n![Picture][photo]\n\n[photo]: ${url}` };
checks += 6; assert.equal(mediaReferences(article).length, 2); assert(referencesMedia(article, url)); assert(referencesMedia({ image: url + "?version=2#preview" }, url)); assert(!referencesMedia({ title: url, content: `[Link](${url})` }, url)); assert(!referencesMedia({ image: url + "-suffix" }, url)); assert(!referencesMedia({ image: `https://unrelated.example${url}` }, url));
for (const [header, expected] of [["bytes=0-1", { start: 0, end: 1 }], ["bytes=2-", { start: 2, end: 9 }], ["bytes=-3", { start: 7, end: 9 }], ["bytes=0-100", { start: 0, end: 9 }], ["bytes=10-", null], ["bytes=1-0", null], ["bytes=0-1,4-5", null], ["bytes=-0", null], ["bytes=99999999999999999999-", null]]) { checks++; assert.deepEqual(parseMediaRange(header, 10), expected); }
const bytes = new Uint8Array([0, 1, 2, 3, 4, 5]); let reads = 0;
const source = { size: bytes.length, stream: async range => { reads++; return new ReadableStream({ start(controller) { controller.enqueue(range ? bytes.subarray(range.start, range.end + 1) : bytes); controller.close(); } }); } };
const partial = await respondWithMedia(new Request("http://localhost", { headers: { Range: "bytes=-2" } }), source, "video/mp4", "fixture.mp4"); checks += 3;
assert.equal(partial.status, 206); assert.equal(partial.headers.get("content-range"), "bytes 4-5/6"); assert.deepEqual(new Uint8Array(await partial.arrayBuffer()), new Uint8Array([4, 5]));
const head = await respondWithMedia(new Request("http://localhost", { method: "HEAD" }), source, "video/mp4", "fixture.mp4"); checks += 3; assert.equal(head.status, 200); assert.equal(head.headers.get("content-length"), "6"); assert.equal(reads, 1);
console.log(`Media validators: ${checks} checks passed (JPEG/PNG/WebP, EXIF/GPS/orientation, transparency, H.264 payload bounds, Markdown refs and Range/HEAD).`);
