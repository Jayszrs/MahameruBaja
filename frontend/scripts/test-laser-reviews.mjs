import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
assert.equal(process.env.ARTICLE_TEST_ISOLATED,"1","Use disposable CMS records only.");
const {chromium}=createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const base=process.env.REVISION_TEST_URL || "http://localhost:3110";
const out=path.resolve(process.env.REVISION_ARTIFACT_DIR || "artifacts/cms-audit-20261101");fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.ARTICLE_CHROMIUM_EXECUTABLE?{executablePath:process.env.ARTICLE_CHROMIUM_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});page.setDefaultTimeout(30000);const errors=[];page.on("pageerror",error=>errors.push(error.message));
async function visit(route){await page.goto(base+route,{waitUntil:"domcontentloaded"});await page.getByRole("button",{name:"Tutup poster",exact:true}).click({timeout:1500}).catch(()=>{});}
async function login(target,email,password){await target.goto(base+"/admin/login");await target.locator("input[type=email]").fill(email);await target.locator("input[type=password]").fill(password);await target.getByRole("button",{name:/Masuk/}).click();await target.waitForURL("**/admin");}
try {
  await visit("/");const retailBaseline=await page.locator('.quote-card[aria-hidden="false"] blockquote').count();assert(retailBaseline>0);
  for(const route of ["/unit/laser-cutting","/jasa"]){
    await visit(route);await page.locator("#ulasan").scrollIntoViewIfNeeded();await page.locator(".review-rating-seal strong").waitFor();await page.waitForFunction(()=>document.querySelector(".review-rating-seal")?.innerText.includes("5.0"));
    assert.match(await page.locator(".review-rating-seal").textContent(),/5\.0/);assert.match(await page.locator(".review-rating-seal").textContent(),/16 ulasan/);
    const cards=page.locator('.quote-card[aria-hidden="false"]');assert.equal(await cards.count(),16);assert.equal(await cards.locator("blockquote").count(),14);assert.equal(await cards.locator(".quote-rating-only").count(),2);
    const tommy=cards.filter({hasText:"Tommy Hartono"});assert.match(await tommy.innerText(),/Terimakasih MBI laser cutting/);assert(!/Lebih banyak|…/.test(await tommy.innerText()));
    assert.match(await page.locator(".review-rating-seal").getAttribute("href"),/cid=11804939362540675168/);
  }
  await page.locator("#ulasan").scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,"laser-reviews-desktop.png")});
  await page.setViewportSize({width:390,height:844});await visit("/unit/laser-cutting");assert.equal(await page.locator('.quote-card[aria-hidden="false"]').count(),16);assert.equal(await page.locator(".quote-card").filter({has:page.locator("blockquote",{hasText:/Pratinjau|Belum ada/})}).count(),0);
  await visit("/");assert.equal(await page.locator('.quote-card[aria-hidden="false"] blockquote').count(),retailBaseline);await page.locator("#ulasan").scrollIntoViewIfNeeded();assert.match(await page.locator(".review-rating-seal").textContent(),/4\.5/);
  await page.setViewportSize({width:1440,height:1000});await login(page,"cms-test@example.test","article-test-local");await page.goto(base+"/admin/konten?tab=contacts");const menu=page.locator(".admin-group-toggle").filter({hasText:"Jasa"});if(await menu.getAttribute("aria-expanded")==="false")await menu.click();await page.getByRole("link",{name:"Ulasan Google Maps Laser",exact:true}).click();await page.waitForURL("**/admin/konten?tab=reviews&profile=laser-cutting");await page.getByLabel("Profil lokasi",{exact:true}).waitFor();assert.equal(await page.getByLabel("Profil lokasi",{exact:true}).inputValue(),"laser-cutting");assert.equal(await page.getByLabel("Penilaian bintang tanpa komentar tertulis",{exact:true}).count(),16);assert.equal(await page.getByLabel("Penilaian bintang tanpa komentar tertulis",{exact:true}).evaluateAll(inputs=>inputs.filter(input=>input.checked).length),2);
  const response=await page.request.get(base+"/api/admin/content");assert.equal(response.status(),200);const original=await response.json();const profile=original.divisionReviews["laser-cutting"];assert.equal(profile.reviews.length,16);assert.equal(new Set(profile.reviews.map(row=>row.id)).size,16);assert.equal(profile.reviews.filter(row=>row.ratingOnly&&row.text==="").length,2);
  const changed=structuredClone(original);changed.divisionReviews["laser-cutting"].reviews[0].published=false;
  const saved=await page.request.put(base+"/api/admin/content",{headers:{Origin:base},data:{...changed,_base:original}});assert.equal(saved.status(),200,await saved.text());
  await visit("/jasa");assert.equal(await page.locator('.quote-card[aria-hidden="false"]').count(),15);await page.reload();assert.equal(await page.locator('.quote-card[aria-hidden="false"]').count(),15,"Unpublishing survives reads and does not reseed imported reviews");
  const current=await (await page.request.get(base+"/api/admin/content")).json();assert.equal((await page.request.put(base+"/api/admin/content",{headers:{Origin:base},data:{...original,revision:current.revision,_base:current}})).status(),200);
  const restricted=await browser.newPage();await login(restricted,"division-a@example.test","division-fixture-a");const scoped=await (await restricted.request.get(base+"/api/admin/content")).json();assert(!scoped.divisionReviews["laser-cutting"]);assert.equal((await restricted.request.put(base+"/api/admin/content",{headers:{Origin:base},data:{...scoped,divisionReviews:{"laser-cutting":profile},_base:scoped}})).status(),403);await restricted.close();
  assert.deepEqual(errors,[]);console.log("Laser reviews passed: 5.0/16, all 14 comments + 2 ratings without comments, expanded full text, isolated retail profile, CMS edit/unpublish persistence and division permissions.");
}finally{await browser.close();}
