import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { cmsVideo } from "./fixtures/cms-video.mjs";

assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Use a disposable CMS store.");
const base = "http://localhost:3000";
const { chromium } = createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const admin = await browser.newContext(), visitor = await browser.newContext();
try {
  const login = await admin.request.post(base + "/api/admin/login", { headers: { Origin: base }, form: { email: "division-a@example.test", password: "division-fixture-a" }, maxRedirects: 0 });
  assert.equal(login.status(), 303);
  const upload = await admin.request.post(base + "/api/admin/media", { headers: { Origin: base }, multipart: { kind: "video", media: { name: "playback.mp4", mimeType: "video/mp4", buffer: cmsVideo } } });
  assert.equal(upload.status(), 200); const { url } = await upload.json();
  assert.equal((await visitor.request.get(base + url)).status(), 404);
  async function playback(context, path) {
    const page = await context.newPage();
    await page.goto(base + path);
    const result = await page.evaluate(async url => {
      const video = document.createElement("video"); video.controls = true; video.muted = true; document.body.append(video);
      const loaded = new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = () => reject(new Error(`Video decode failed: ${video.error?.code}`)); });
      video.src = url; video.preload = "auto";
      await Promise.race([loaded, new Promise((_, reject) => setTimeout(() => reject(new Error("Video metadata timed out")), 10000))]);
      const duration = video.duration;
      const seeked = new Promise((resolve, reject) => { video.onseeked = resolve; video.onerror = () => reject(new Error("Video seek failed")); });
      video.currentTime = duration / 2;
      await Promise.race([seeked, new Promise((_, reject) => setTimeout(() => reject(new Error("Video seek timed out")), 10000))]);
      const seekTime = video.currentTime;
      await video.play();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = { duration, width: video.videoWidth, height: video.videoHeight, seekTime, time: video.currentTime, ready: video.readyState };
      video.pause(); video.remove(); return result;
    }, url);
    assert(result.duration > 0 && Number.isFinite(result.duration)); assert(result.width > 0 && result.height > 0); assert(Math.abs(result.seekTime - result.duration / 2) < 0.05, JSON.stringify(result)); assert(result.ready >= 2);
    await page.close(); return result;
  }
  await playback(admin, "/admin");
  const before = await (await admin.request.get(base + "/api/admin/content")).json();
  const post = { id: "video-browser-fixture", ownerDivision: "retail-tambun", audience: ["retail-tambun"], platform: "instagram", title: "Video fixture", caption: "", url: "https://www.instagram.com/reel/FixtureVideo/", image: "", videoUrl: url, published: true, division: "retail-tambun", handle: "" };
  const saved = await admin.request.put(base + "/api/admin/content", { headers: { Origin: base }, data: { ...before, _base: before, socialPosts: [...before.socialPosts, post] } });
  assert.equal(saved.status(), 200);
  assert.equal((await visitor.request.get(base + url)).status(), 200);
  const result = await playback(visitor, "/unit/retail-tambun");
  const current = await saved.json();
  assert.equal((await admin.request.put(base + "/api/admin/content", { headers: { Origin: base }, data: { ...current, _base: current, socialPosts: current.socialPosts.filter(p => p.id !== post.id) } })).status(), 200);
  assert.equal((await visitor.request.get(base + url)).status(), 404);
  console.log(`Browser H.264 playback and seeking passed for private/published media (${result.width}x${result.height}, ${result.duration}s).`);
} finally { await browser.close(); }
