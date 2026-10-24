import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PUBLIC_QA_URL || "http://localhost:3000";
const artifacts = process.env.PUBLIC_QA_ARTIFACT_DIR;
if (artifacts) await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PUBLIC_QA_CHROME ? { executablePath: process.env.PUBLIC_QA_CHROME } : {}) });
const errors = [];
const results = [];
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.locator("#home-heading").waitFor();
    await page.getByRole("button", { name: "Hubungi via WhatsApp", exact: true }).waitFor();
    const popup = page.locator(".poster-welcome[open]");
    if (await popup.waitFor({ timeout: 2000 }).then(() => true, () => false)) {
      const bounds = await popup.boundingBox();
      assert(bounds && bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1, `Poster fits ${width}px viewport`);
      assert(await popup.evaluate(node => node.scrollWidth <= node.clientWidth + 1), "Poster does not overflow horizontally");
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `poster-${width}.png`) });
      await page.getByRole("button", { name: "Tutup poster", exact: true }).click();
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Homepage fits ${width}px viewport`);
    const hero = await page.locator('.hero-carousel-bright').evaluate(element => {
      const frame = element.getBoundingClientRect();
      const media = element.querySelector('.hero-carousel-media').getBoundingClientRect();
      const copy = element.querySelector('.hero-carousel-copy').getBoundingClientRect();
      return { fullWidth: Math.abs(media.left - frame.left) < 1 && Math.abs(media.right - frame.right) < 1,
        behindCopy: media.top <= copy.top && media.bottom >= copy.bottom,
        position: getComputedStyle(element.querySelector('.hero-carousel-media')).position };
    });
    assert(hero.fullWidth && hero.behindCopy && hero.position === 'absolute', `Hero photo and copy form one surface at ${width}px`);
    assert.equal(await page.locator('.site-navbar a[aria-label="Chat WhatsApp"]').count(), 0);
    await page.getByRole("button", { name: "Hubungi via WhatsApp", exact: true }).waitFor();
    const next = page.getByRole("button", { name: "Slide berikutnya", exact: true });
    if (await next.count()) {
      const counter = page.locator(".hero-slide-selector > span");
      const before = await counter.innerText();
      await next.click();
      assert.notEqual(await counter.innerText(), before, "Manual hero navigation changes slide");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Next slide fits viewport");
    }
    await page.locator('.hero-carousel-layer.is-active img').evaluateAll(images => Promise.race([Promise.all(images.map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 2000))]));
    if (artifacts) await page.screenshot({ path: path.join(artifacts, `home-${width}.png`) });
    results.push(`homepage/poster ${width}x${height}`);
  }
  for (const route of ["/sosial-media", "/produk", "/unit/laser-cutting"]) {
    const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
    assert.equal(response.status(), 200, route);
    await page.locator("h1").waitFor();
    results.push(route);
  }
  const homepage = await context.request.get(base);
  const html = await homepage.text();
  assert.equal(homepage.status(), 200);
  assert.match(html, /name="google-site-verification" content="[^"]+"/);
  assert.match(html, /rel="canonical" href="https?:\/\//);
  const robots = await context.request.get(base + "/robots.txt");
  const sitemap = await context.request.get(base + "/sitemap.xml");
  assert.equal(robots.status(), 200);
  assert.equal(sitemap.status(), 200);
  assert.match(await robots.text(), /Sitemap: https?:\/\//);
  const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert(urls.length > 10 && !urls.some(url => new URL(url).pathname.startsWith("/admin")));
  assert.equal(new Set(urls).size, urls.length, "Sitemap has no duplicate URLs");
  assert.deepEqual(errors, [], "No public runtime errors, including filled social image crops");
  console.log(JSON.stringify({ passed: results, sitemapUrls: urls.length, runtimeErrors: errors }, null, 2));
} finally {
  await browser.close();
}
