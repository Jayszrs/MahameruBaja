import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PUBLIC_QA_URL || "http://localhost:3000";
const canonicalOrigin = process.env.SEO_CANONICAL_ORIGIN || "https://mahamerubaja.vercel.app";
const artifacts = process.env.PUBLIC_QA_ARTIFACT_DIR || "tmp/local-seo";
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PUBLIC_QA_CHROME ? { executablePath: process.env.PUBLIC_QA_CHROME } : {}) });
const results = [];
try {
  const crawler = await browser.newContext({ javaScriptEnabled: false });
  const page = await crawler.newPage();
  for (const route of ["/", "/jasa", "/produk", "/unit/retail-tambun", "/unit/retail-cibitung", "/unit/laser-cutting", "/unit/trading-proyek", "/unit/fabrikasi-erection"]) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "load" });
    assert.equal(response.status(), 200, route);
    assert(!/noindex/i.test(response.headers()["x-robots-tag"] || ""), route);
    const data = await page.evaluate(() => ({
      title: document.title,
      headings: [...document.querySelectorAll("h1")].map(node => node.textContent),
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      description: document.querySelector('meta[name="description"]')?.content,
      og: document.querySelector('meta[property="og:url"]')?.content,
      robots: document.querySelector('meta[name="robots"]')?.content || "",
      graph: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(node => {
        const data = JSON.parse(node.textContent);
        return data["@graph"] || [data];
      }),
      localText: document.querySelector(".local-business-details")?.textContent,
      text: document.body.textContent,
    }));
    assert.equal(data.canonical, new URL(route, canonicalOrigin).href, route);
    assert(data.og, `${route} has its own Open Graph URL`);
    assert.equal(new URL(data.og).href, new URL(route, canonicalOrigin).href, `${route} share URL`);
    assert.equal(data.headings.length, 1, `${route} has one server-rendered h1`);
    assert(data.description && data.graph.length > 0, `${route} metadata and JSON-LD`);
    assert(!/noindex/i.test(data.robots), `${route} indexable`);
    const businesses = data.graph.filter(node => ["HardwareStore", "LocalBusiness"].includes(node["@type"]));
    assert(businesses.length, `${route} business identity`);
    for (const business of businesses) {
      assert(business.address.streetAddress && business.address.addressCountry === "ID");
      assert.equal(business.aggregateRating, undefined, "No self-serving review markup");
      if (route !== "/") assert(data.text.includes(business.address.streetAddress), `${route}: schema address also visible`);
    }
    if (route === "/jasa") {
      assert.match(data.headings[0], /laser cutting Bekasi/i);
      assert(data.graph.some(node => node["@type"] === "Service"));
      assert.match(data.localText, /DWG.*DXF/s);
    }
    if (route === "/produk") {
      assert.match(data.headings[0], /besi.*baja Bekasi/i);
      assert.equal(businesses.length, 2);
      assert.match(data.localText, /Cibitung/);
    }
    results.push({ route, title: data.title, serverRendered: true, businesses: businesses.length });
  }
  await crawler.close();

  const robots = await fetch(`${base}/robots.txt`);
  assert.equal(robots.status, 200);
  const robotsText = await robots.text();
  assert(robotsText.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
  assert(!/^Disallow: \/\s*$/m.test(robotsText));
  const sitemap = await fetch(`${base}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  for (const route of ["/jasa", "/produk", "/unit/laser-cutting"]) assert(urls.includes(`${canonicalOrigin}${route}`));
  assert(urls.every(url => url.startsWith(canonicalOrigin) && !/^\/(admin|api|cari|laser-cutting)(\/|$)/.test(new URL(url).pathname)));
  const legacy = await fetch(`${base}/laser-cutting`, { redirect: "manual" });
  assert.equal(legacy.status, 308);
  assert.equal(new URL(legacy.headers.get("location"), base).pathname, "/jasa");

  const context = await browser.newContext({ reducedMotion: "reduce" });
  const ui = await context.newPage();
  const errors = [];
  ui.on("pageerror", error => errors.push(error.message));
  for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1440, 1000]]) {
    await ui.setViewportSize({ width, height });
    for (const route of ["/jasa", "/produk", "/"]) {
      await ui.goto(`${base}${route}`, { waitUntil: "load" });
      await ui.waitForTimeout(1200);
      assert.equal(await ui.locator(".poster-welcome[open]").count(), 0, "No automatic interstitial");
      assert(await ui.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} fits ${width}px`);
      const launcher = ui.getByRole("button", { name: /^Promo & informasi/ });
      if (await launcher.count()) {
        const rect = await launcher.boundingBox();
        assert(rect.width < width * .7 && rect.height < height * .12, "Compact promo control");
        await launcher.click();
        await ui.locator(".poster-welcome[open]").waitFor();
        await ui.waitForFunction(() => document.querySelector('.poster-welcome-image img')?.naturalWidth > 0);
        await ui.keyboard.press("Escape");
        await ui.locator(".poster-welcome[open]").waitFor({ state: "detached" });
        assert(await launcher.evaluate(node => node === document.activeElement), "Restore focus to promo launcher");
      }
      if (route !== "/" && [390, 1440].includes(width)) {
        await ui.locator(".local-business-details").screenshot({ path: `${artifacts}/${route.slice(1)}-local-${width}.png` });
        await ui.evaluate(() => window.scrollTo(0, 0));
        await ui.screenshot({ path: `${artifacts}/${route.slice(1)}-hero-${width}.png` });
      }
    }
  }
  const banner = ui.getByRole("button", { name: /^Buka banner/ }).first();
  if (await banner.count()) {
    await banner.click();
    await ui.locator(".promo-preview-dialog[open]").waitFor();
    await ui.keyboard.press("Escape");
    await ui.locator(".promo-preview-dialog").waitFor({ state: "detached" });
    assert.equal(await ui.evaluate(() => document.body.style.overflow), "");
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(JSON.stringify({ passed: true, pages: results, sitemapUrls: urls.length, widths: [320, 390, 768, 1440], artifacts }, null, 2));
} finally { await browser.close(); }
