import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
assert(process.env.ARTICLE_PREVIEW_EMAIL && process.env.ARTICLE_PREVIEW_PASSWORD);
const base="https://mahameru-baja-preview.vercel.app";
const {chromium}=createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE||"playwright");
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
await page.goto(base+"/admin/login");
await page.getByLabel("Email admin").fill(process.env.ARTICLE_PREVIEW_EMAIL);
await page.getByLabel("Kata sandi").fill(process.env.ARTICLE_PREVIEW_PASSWORD);
await page.getByRole("button",{name:/Masuk ke portal/}).click();await page.waitForURL(base+"/admin");
await page.getByRole("heading",{name:"Dashboard",exact:true}).waitFor();
async function read(url){const r=await context.request.get(base+url);assert.equal(r.status(),200);return r.json();}
const content=await read("/api/admin/content"),requests=await read("/api/admin/requests"),articles=await read("/api/admin/articles");
const hash=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const baseline=[content,requests,articles].map(hash);
const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const active=requests.filter(r=>!r.archived);
assert.deepEqual(await page.locator(".admin-metrics strong").allTextContents(),[
String(active.length),String(active.filter(r=>["Baru","Review kebutuhan"].includes(r.status)).length),String(articles.filter(a=>a.status==="published").length),String(content.promotions.filter(p=>p.published&&(!p.startDate||p.startDate<=today)&&(!p.endDate||p.endDate>=today)).length)]);
const urls=["/admin/permintaan?view=active","/admin/permintaan?view=archived","/admin/konten?tab=contacts","/admin/konten?tab=reviews","/admin/produk","/admin/sosial?tab=accounts","/admin/sosial?tab=posts","/admin/promosi?view=all","/admin/promosi?view=live","/admin/promosi?view=draft","/admin/hero","/admin/galeri","/admin/artikel?status=all","/admin/artikel?status=draft","/admin/artikel?status=published"];
for(const url of urls){await page.goto(base+url);await page.locator('.admin-sidebar a[aria-current="page"]').waitFor();assert.equal(await page.locator(".admin-sidebar").count(),1);assert.equal(await page.locator(".admin-topbar").count(),1);}
await page.goto(base+"/admin");await page.screenshot({path:"/artifacts/preview-admin-dashboard.png",fullPage:true});
await page.setViewportSize({width:390,height:900});await page.getByRole("button",{name:"Buka menu admin",exact:true}).click();
await page.getByRole("dialog",{name:"Navigasi admin",exact:true}).waitFor();await page.screenshot({path:"/artifacts/preview-admin-mobile.png"});await page.keyboard.press("Escape");
assert.deepEqual([await read("/api/admin/content"),await read("/api/admin/requests"),await read("/api/admin/articles")].map(hash),baseline);
assert.deepEqual(errors,[]);
console.log("Vercel admin verified: dashboard metrics, 15 views, desktop/mobile sidebar; CMS data unchanged (read-only check).");
await browser.close();
