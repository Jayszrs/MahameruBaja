import assert from "node:assert/strict";
import { createRequire } from "node:module";
assert.equal(process.env.ARTICLE_TEST_ISOLATED,"1");
const {chromium}=createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE||"playwright");
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const context=await browser.newContext();const page=await context.newPage();const base="http://localhost:3000";
try {
  await context.request.post(base+"/api/admin/login",{headers:{Origin:base},form:{email:"division-a@example.test",password:"division-fixture-a"}});
  await page.goto(base+"/admin/galeri");await page.getByRole("button",{name:"+ Tambah proyek",exact:true}).click();
  const input=page.getByLabel(/^Tambah beberapa foto/);
  const good={name:"valid.png",mimeType:"image/png",buffer:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC","base64")};
  const broken={name:"broken.png",mimeType:"image/png",buffer:Buffer.from("broken image")};
  await input.setInputFiles([good,broken]);
  await page.getByRole("alert").filter({hasText:"1 dari 2 foto berhasil"}).waitFor();
  assert.equal(await page.locator(".gallery-editor-photos>article").count(),1);assert.equal(await input.inputValue(),"");
  const [failed]=await Promise.all([page.waitForResponse(r=>r.url().endsWith("/api/admin/media")&&r.request().method()==="POST"),input.setInputFiles(broken)]);
  assert.equal(failed.status(),400);await page.getByRole("alert").filter({hasText:"0 dari 1 foto berhasil"}).waitFor();assert.equal(await input.inputValue(),"");
  const [retry]=await Promise.all([page.waitForResponse(r=>r.url().endsWith("/api/admin/media")&&r.request().method()==="POST"),input.setInputFiles({...good,name:broken.name})]);
  assert.equal(retry.status(),200);await page.getByRole("status").filter({hasText:"1 foto diunggah"}).waitFor();
  assert.equal(await page.locator(".gallery-editor-photos>article").count(),2);assert.equal(await input.inputValue(),"");
  console.log("Gallery browser: partial failure preserves successful uploads, same-file retry works, and input resets after success/failure.");
} finally {await browser.close();}
