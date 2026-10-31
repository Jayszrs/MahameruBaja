import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
assert.equal(process.env.ARTICLE_TEST_ISOLATED,"1","Use disposable CMS data only.");
const {chromium}=createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const base=process.env.REVISION_TEST_URL || "http://localhost:3110";
const out=path.resolve(process.env.REVISION_ARTIFACT_DIR || "artifacts/cms-audit-20261031");fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.ARTICLE_CHROMIUM_EXECUTABLE?{executablePath:process.env.ARTICLE_CHROMIUM_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});page.setDefaultTimeout(30000);const errors=[];page.on("pageerror",error=>errors.push(error.message));
const go=route=>page.goto(base+route,{waitUntil:"domcontentloaded"});
async function closePoster(){await page.getByRole("button",{name:"Tutup poster",exact:true}).click({timeout:1500}).catch(()=>{});}
async function save(){await page.locator(".admin-topbar-actions > button.admin-primary").click();await page.locator(".admin-save-state").filter({hasText:"Semua perubahan tersimpan"}).waitFor();}
async function content(){const response=await page.request.get(base+"/api/admin/content");assert.equal(response.status(),200);return response.json();}
try {
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:width===390?844:1000});await go("/");await page.getByRole("dialog").waitFor();
    await page.waitForFunction(()=>{const img=document.querySelector(".poster-welcome-image img");return img?.complete&&img.naturalWidth>0;});
    const ratio=await page.locator(".poster-welcome-image img").evaluate(img=>img.naturalWidth/img.naturalHeight);
    assert(width===390?ratio<1:ratio>1.6,`Poster orientation at ${width}: ${ratio}`);
    const cta=await page.locator(".poster-contact-button").boundingBox();assert(cta&&cta.y+cta.height<=(width===390?844:1000));
    await page.screenshot({path:path.join(out,`poster-${width}.png`)});await closePoster();
    assert(await page.locator(width===390?".mobile-language-row .site-language":".site-navbar > div:first-child .site-language").isVisible());
  }
  await page.setViewportSize({width:1440,height:1000});await go("/admin/login");await page.locator("input[type=email]").fill(process.env.ARTICLE_TEST_EMAIL || "cms-test@example.test");await page.locator("input[type=password]").fill(process.env.ARTICLE_TEST_PASSWORD || "article-test-local");await page.getByRole("button",{name:/Masuk/}).click();await page.waitForURL("**/admin");
  const labels=await page.locator(".admin-group-toggle").allTextContents();for(const [index,name] of ["Beranda","Tentang Kami","Produk","Jasa","Proyek","Galeri","Artikel","Kontak","Sosial Media"].entries())assert(labels[index].includes(name));
  await go("/admin/halaman/beranda");assert.equal(await page.locator(".cms-section-list > li").count(),15);await page.locator(".cms-section-list").waitFor({state:"visible"});await page.screenshot({path:path.join(out,"cms-beranda-order.png")});
  await page.getByRole("link",{name:/Tambah \/ edit Quick FAQ/}).click();await page.getByRole("button",{name:/Tambah quick faq/i}).click();
  const faq=page.locator(".editor-panel").filter({has:page.locator("h3")}).last();await faq.getByLabel("Judul / pertanyaan",{exact:true}).fill("QA: Bisa potong plat saja?");await faq.getByLabel("Tautan tujuan",{exact:false}).fill("/jasa#request");await save();
  const visitor=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});await visitor.goto(base);await visitor.getByRole("button",{name:"Tutup poster",exact:true}).click({timeout:2000}).catch(()=>{});assert.equal(await visitor.getByRole("link",{name:"QA: Bisa potong plat saja?"}).getAttribute("href"),"/jasa#request");
  await go("/admin/jasa?section=servicePaths");assert((await page.locator("h1").innerText()).includes("Jasa"));const first=page.locator(".editor-panel").filter({has:page.locator("h3",{hasText:/1\./})}).first();
  await first.getByLabel("Judul / pertanyaan",{exact:true}).fill("QA: Potong plat custom");await first.getByLabel(/Jasa.*Apa yang bisa kami bantu.*unggah gambar/).setInputFiles(path.resolve("frontend/public/apple-touch-icon.png"));await page.getByRole("status").filter({hasText:/Gambar diunggah/}).waitFor();await save();
  await visitor.goto(base+"/jasa");await visitor.getByRole("button",{name:"Tutup poster",exact:true}).click({timeout:2000}).catch(()=>{});await visitor.getByRole("heading",{name:"QA: Potong plat custom"}).waitFor();assert((await visitor.locator(".jasa-path-illustration img").first().getAttribute("src")).includes("/media/"));
  await go("/admin/jasa?section=layout");await page.getByLabel("Alur pekerjaan",{exact:true}).uncheck();await save();await visitor.reload();assert(!await visitor.locator(".laser-process").isVisible());await page.getByLabel("Alur pekerjaan",{exact:true}).check();await save();
  await go("/admin/galeri?kind=activity");await page.getByRole("button",{name:/Tambah album kegiatan/}).click();await page.getByLabel("Nama album",{exact:true}).fill("QA kegiatan tim");await page.getByLabel(/unggah beberapa foto/).setInputFiles(path.resolve("frontend/public/apple-touch-icon.png"));await page.getByRole("status").filter({hasText:/1 foto diunggah/}).waitFor();await page.getByLabel("Terbitkan album",{exact:true}).check();await save();
  await visitor.goto(base+"/galeri");await visitor.getByRole("button",{name:"Tutup poster",exact:true}).click({timeout:2000}).catch(()=>{});await visitor.getByRole("heading",{name:"QA kegiatan tim"}).waitFor();assert.equal(await visitor.getByRole("heading",{name:"Ornamen & panel dekoratif"}).count(),0);await visitor.screenshot({path:path.join(out,"galeri-kegiatan.png")});
  // Delete and verify persistence without touching production records.
  page.once("dialog",dialog=>dialog.accept());await page.getByRole("button",{name:"Hapus album",exact:true}).click();await save();await visitor.reload();assert.equal(await visitor.getByRole("heading",{name:"QA kegiatan tim"}).count(),0);
  const final=await content();assert(final.websiteAppearance.some(row=>row.servicePaths.some(item=>item.title==="QA: Potong plat custom")));assert(final.websiteAppearance.some(row=>row.needs.some(item=>item.title==="QA: Bisa potong plat saja?")));assert(!final.galleryProjects.some(row=>row.title==="QA kegiatan tim"));
  await go("/admin/promosi?view=popup");await page.getByLabel(/unggah poster komputer landscape/).first().setInputFiles(path.resolve("frontend/public/images/posters/ring-cakar-sloof.jpeg"));await page.getByRole("alert").filter({hasText:/harus landscape/}).waitFor();
  assert.deepEqual(errors,[]);await visitor.close();console.log("CMS parity passed: navbar order, page guide, Quick FAQ add/save, service text/image upload, section hide/show, activity album publish/delete, desktop/mobile artwork and orientation validation.");
} finally {await browser.close();}
