import assert from "node:assert/strict";
import { createRequire } from "node:module";
assert.equal(process.env.ARTICLE_TEST_ISOLATED,"1","Use a disposable CMS store.");
const {chromium}=createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE||"playwright");
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});const base="http://localhost:3000";
const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
async function login(email,password) {await page.goto(base+"/admin/login");await page.getByLabel("Email admin").fill(email);await page.getByLabel("Kata sandi").fill(password);await page.getByRole("button",{name:/Masuk ke portal/}).click();await page.waitForURL(base+"/admin");await page.getByRole("heading",{name:"Dashboard",exact:true}).waitFor();}
const fixtureName=`Mahameru Baja fixture UI ${Date.now()}`;
await login("cms-test@example.test","article-test-local");
await page.goto(base+"/admin/divisi");await page.getByRole("heading",{name:"Kelola divisi",exact:true}).waitFor();assert.equal(await page.locator(".admin-sidebar").count(),1);assert.equal(await page.locator(".admin-group-toggle").count(),5);
await page.locator(".admin-record").filter({hasText:"Retail Tambun"}).click();await page.getByLabel("Nama divisi",{exact:true}).fill(fixtureName);
await page.locator(".admin-sidebar").getByRole("link",{name:"Dashboard",exact:true}).click();await page.getByRole("dialog",{name:"Perubahan belum disimpan"}).waitFor();await page.keyboard.press("Escape");assert(page.url().includes("/admin/divisi"));
await page.getByRole("button",{name:"Profil & layanan",exact:true}).click();assert.equal(await page.getByLabel("Judul utama",{exact:true}).count(),1);await page.getByRole("button",{name:"Media",exact:true}).click();await page.getByRole("button",{name:"Kontak & lokasi",exact:true}).click();await page.getByRole("button",{name:"Identitas",exact:true}).click();assert.equal(await page.getByLabel("Nama divisi",{exact:true}).inputValue(),fixtureName);
const saved=page.waitForResponse(r=>r.url().includes("/api/admin/divisions/")&&r.request().method()==="PUT");await page.locator(".admin-topbar").getByRole("button",{name:"Simpan profil",exact:true}).click();assert.equal((await saved).status(),200);await page.getByRole("status").filter({hasText:"Profil tersimpan dan langsung tersedia"}).waitFor();assert(await page.getByLabel("Alamat website divisi",{exact:true}).isDisabled());
const accountLink=page.locator(".admin-sidebar").getByRole("link",{name:"Pengelolaan akun",exact:true});await accountLink.click();await page.getByRole("heading",{name:"Pengelolaan akun",exact:true}).waitFor();await page.getByRole("button",{name:"+ Tambah akun",exact:true}).click();await page.getByLabel("Nama",{exact:true}).fill("Akun fixture UI");await page.getByLabel("Email login",{exact:true}).fill("ui-fixture@example.test");await page.getByLabel(/^Penugasan divisi/).selectOption("retail-tambun");
const created=page.waitForResponse(r=>r.url().endsWith("/api/admin/accounts")&&r.request().method()==="POST");await page.locator(".admin-topbar").getByRole("button",{name:"Simpan akun",exact:true}).click();assert.equal((await created).status(),201);await page.getByRole("dialog",{name:"Password sementara",exact:true}).waitFor();assert((await page.locator(".admin-temporary-password").textContent()).length>=20);await page.keyboard.press("Escape");assert.equal(await page.getByRole("dialog").count(),0);assert.equal(await page.locator(".admin-temporary-password").count(),0);
await page.getByLabel("Akun aktif",{exact:true}).uncheck();const inactive=page.waitForResponse(r=>r.url().includes("/api/admin/accounts/")&&r.request().method()==="PUT");await page.locator(".admin-topbar").getByRole("button",{name:"Simpan akun",exact:true}).click();assert.equal((await inactive).status(),200);await page.getByRole("button",{name:"Hapus akun",exact:true}).click();await page.getByRole("dialog",{name:"Hapus akun nonaktif?"}).waitFor();await page.getByRole("dialog").getByRole("button",{name:"Batal",exact:true}).click();assert.equal(await page.getByRole("dialog").count(),0);

await page.getByRole("button",{name:"Reset password",exact:true}).click();
let actionResponse=page.waitForResponse(r=>r.url().endsWith("/reset-password")&&r.request().method()==="POST");
await page.getByRole("dialog",{name:"Reset password akun?"}).getByRole("button",{name:"Reset password",exact:true}).click();
assert.equal((await actionResponse).status(),200);await page.getByRole("dialog",{name:"Password sementara",exact:true}).waitFor();await page.keyboard.press("Escape");
await page.getByLabel("Akun aktif",{exact:true}).check();
actionResponse=page.waitForResponse(r=>r.url().includes("/api/admin/accounts/")&&r.request().method()==="PUT");
await page.locator(".admin-topbar").getByRole("button",{name:"Simpan akun",exact:true}).click();assert.equal((await actionResponse).status(),200);
await page.getByLabel("Akun aktif",{exact:true}).uncheck();
actionResponse=page.waitForResponse(r=>r.url().includes("/api/admin/accounts/")&&r.request().method()==="PUT");
await page.locator(".admin-topbar").getByRole("button",{name:"Simpan akun",exact:true}).click();assert.equal((await actionResponse).status(),200);
await page.getByRole("button",{name:"Hapus akun",exact:true}).click();
actionResponse=page.waitForResponse(r=>r.url().includes("/api/admin/accounts/")&&r.request().method()==="DELETE");
await page.getByRole("dialog",{name:"Hapus akun nonaktif?"}).getByRole("button",{name:"Hapus akun",exact:true}).click();assert.equal((await actionResponse).status(),200);
await page.getByRole("status").filter({hasText:"Akun dihapus."}).waitFor();

await page.goto(base+"/admin/divisi");await page.getByRole("button",{name:"+ Tambah divisi",exact:true}).click();
await page.getByLabel("Nama divisi",{exact:true}).fill("Divisi fixture UI baru");await page.getByLabel("Label singkat",{exact:true}).fill("Fixture UI");await page.getByLabel("Area layanan",{exact:true}).fill("Area pengujian");
let divisionResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/divisions")&&r.request().method()==="POST");
await page.locator(".admin-topbar").getByRole("button",{name:"Simpan draf",exact:true}).click();let newDivision=await (await divisionResponse).json();assert(newDivision.id);
await page.getByRole("button",{name:"Profil & layanan",exact:true}).click();
await page.getByLabel("Judul utama",{exact:true}).fill("Profil fixture UI");await page.getByLabel(/^Pengantar singkat/).fill("Pengantar divisi fixture");await page.getByLabel(/^Deskripsi divisi/).fill("Deskripsi divisi fixture");await page.getByLabel(/^Misi divisi/).fill("Misi fixture");
await page.getByRole("button",{name:"Media",exact:true}).click();
const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC","base64");
async function uploadImage(input){const [response]=await Promise.all([page.waitForResponse(r=>r.url().endsWith("/api/admin/media")&&r.request().method()==="POST"),input.setInputFiles({name:"profile.png",mimeType:"image/png",buffer:png})]);assert.equal(response.status(),200);await page.getByRole("status").filter({hasText:"Gambar diunggah"}).waitFor();assert.equal(await input.inputValue(),"");return(await response.json()).url;}
await uploadImage(page.getByLabel(/^Logo · Unggah/));await uploadImage(page.getByLabel(/^Gambar utama · Unggah/));
await page.getByRole("button",{name:"+ Gambar",exact:true}).click();await uploadImage(page.getByLabel(/^Unggah gambar 1$/));await page.getByLabel("Deskripsi gambar",{exact:true}).fill("Foto profil fixture");
await page.getByRole("button",{name:"Kontak & lokasi",exact:true}).click();await page.getByLabel(/^Alamat lengkap/).fill("Alamat fixture UI");
divisionResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/divisions/"+newDivision.id)&&r.request().method()==="PUT");
await page.getByRole("button",{name:"Aktifkan divisi",exact:true}).click();assert.equal((await divisionResponse).status(),200);await page.getByRole("status").filter({hasText:"Profil tersimpan dan langsung tersedia"}).waitFor();
assert.equal((await context.request.get(base+"/unit/"+newDivision.slug)).status(),200);
async function archiveFixtureDivision(){await page.getByRole("button",{name:"Arsipkan",exact:true}).click();const response=page.waitForResponse(r=>r.url().endsWith("/api/admin/divisions/"+newDivision.id)&&r.request().method()==="PUT");await page.getByRole("dialog",{name:"Arsipkan divisi?"}).getByRole("button",{name:"Ya, arsipkan",exact:true}).click();assert.equal((await response).status(),200);await page.getByRole("status").filter({hasText:"Divisi diarsipkan."}).waitFor();}
await archiveFixtureDivision();assert.equal((await context.request.get(base+"/unit/"+newDivision.slug)).status(),404);
divisionResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/divisions/"+newDivision.id)&&r.request().method()==="PUT");await page.getByRole("button",{name:"Pulihkan & aktifkan",exact:true}).click();assert.equal((await divisionResponse).status(),200);
await archiveFixtureDivision();await page.getByRole("button",{name:"Hapus divisi kosong",exact:true}).click();
divisionResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/divisions/"+newDivision.id)&&r.request().method()==="DELETE");await page.getByRole("dialog",{name:"Hapus divisi kosong?"}).getByRole("button",{name:"Hapus permanen",exact:true}).click();assert.equal((await divisionResponse).status(),200);await page.getByRole("status").filter({hasText:"Divisi kosong dihapus."}).waitFor();

for(const width of [2560,1440,1024,768,390]) {
  await page.setViewportSize({width,height:1000});
  for(const route of ["divisi","akun","akun-saya"]) {
    await page.goto(base+"/admin/"+route);await page.locator(".admin-management h1").waitFor();if(route==="divisi")await page.locator(".admin-record").first().click();if(route==="akun")await page.locator(".admin-record").first().click();
    const measure=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(measure.scroll<=measure.width+1,`${route} overflow ${width}: ${JSON.stringify(measure)}`);await page.screenshot({path:`/artifacts/${route}-${width}.png`,fullPage:true});
  }
}
await page.getByRole("button",{name:"Buka menu admin",exact:true}).click();await page.getByRole("dialog",{name:"Navigasi admin"}).waitFor();await page.keyboard.press("Escape");assert.equal(await page.getByRole("button",{name:"Buka menu admin",exact:true}).evaluate(e=>e===document.activeElement),true);
await page.setViewportSize({width:1440,height:1000});await page.locator(".admin-sidebar").getByRole("button",{name:/Keluar/}).click();await page.waitForURL(/\/admin\/login/);await login("division-a@example.test","division-fixture-a");assert.equal(await page.locator(".admin-sidebar").getByRole("link",{name:"Pengelolaan akun",exact:true}).count(),0);await page.goto(base+"/admin/divisi");await page.getByRole("heading",{name:"Profil divisi",exact:true}).waitFor();assert.equal(await page.getByRole("button",{name:"+ Tambah divisi",exact:true}).count(),0);assert.equal(await page.getByRole("button",{name:"Arsipkan",exact:true}).count(),0);assert.equal(await page.locator(".admin-record-list").count(),0);
for(const route of ["konten?tab=contacts","konten?tab=reviews","sosial?tab=accounts","sosial?tab=posts","hero","promosi?view=all","galeri","artikel","permintaan","produk"]) {await page.goto(base+"/admin/"+route);await page.locator(".admin-sidebar").waitFor();assert.equal(await page.locator(".admin-sidebar").count(),1);}
assert.deepEqual(errors,[],"No hydration/client errors.");console.log("Division/account UI: CRUD, unsaved changes, dialogs, scope, keyboard and 15 responsive screenshots passed.");await browser.close();
