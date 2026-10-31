import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';import path from 'node:path';
assert.equal(process.env.ARTICLE_TEST_ISOLATED,'1','Only submit synthetic requests to a disposable CMS.');
const {chromium}=createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.ARTICLE_CHROMIUM_EXECUTABLE?{executablePath:process.env.ARTICLE_CHROMIUM_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const base=process.env.REVISION_TEST_URL || 'http://localhost:3108';
const out=path.resolve(process.env.REVISION_ARTIFACT_DIR || '../artifacts/revision-oct31');fs.mkdirSync(out,{recursive:true});
const errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(30000);
await page.addInitScript(()=>{Object.defineProperty(navigator,'canShare',{value:()=>true});Object.defineProperty(navigator,'share',{value:async data=>{window.sharedFixture=data.files.map(file=>({name:file.name,size:file.size,type:file.type}));}});});
try {
  await page.goto(base+'/jasa');await page.getByRole('button',{name:'Tutup poster',exact:true}).click();
  const form=page.locator('#request form');await form.locator('[name=nama]').fill('Pelanggan QA Desain');await form.locator('[name=whatsapp]').fill('081234567890');await form.locator('[name=kota]').fill('Bekasi');
  await form.locator('input[type=file]').setInputFiles({name:'desain-percobaan.dxf',mimeType:'application/dxf',buffer:Buffer.from('0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF')});await form.locator('input[type=checkbox]').check();
  const [response]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/requests')&&r.request().method()==='POST'),form.getByRole('button',{name:/Simpan dan lanjut/}).click()]);assert.equal(response.status(),201,await response.text());
  await page.getByRole('button',{name:'Bagikan PDF & desain ke WhatsApp',exact:true}).click();const files=await page.evaluate(()=>window.sharedFixture);assert.equal(files.length,2);assert(files.some(file=>file.name==='desain-percobaan.dxf'));assert(files.some(file=>file.type==='application/pdf'&&file.size>1000));
  let download=page.waitForEvent('download');await page.getByRole('link',{name:'Unduh PDF saja',exact:true}).click();await (await download).saveAs(path.join(out,'browser-service-request.pdf'));
  await page.goto(base+'/minta-penawaran');await page.getByRole('button',{name:'Tutup poster',exact:true}).click({timeout:1000}).catch(()=>{});
  await page.locator('#nama').fill('Pelanggan QA Material');await page.locator('#whatsapp').fill('081234567890');await page.getByLabel('Produk baris 1',{exact:true}).fill('Besi WF 200x100');await page.getByLabel('Spesifikasi baris 1',{exact:true}).fill('Panjang 12 m');await page.getByLabel('Jumlah baris 1',{exact:true}).fill('3');await page.locator('form input[type=checkbox]').check();
  const [quoteResponse]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/requests')&&r.request().method()==='POST'),page.getByRole('button',{name:'Kirim Permintaan Penawaran',exact:true}).click()]);assert.equal(quoteResponse.status(),201,await quoteResponse.text());
  await page.getByRole('link',{name:'Unduh PDF saja',exact:true}).waitFor();download=page.waitForEvent('download');await page.getByRole('link',{name:'Unduh PDF saja',exact:true}).click();await (await download).saveAs(path.join(out,'browser-material-request.pdf'));
  assert.deepEqual(errors,[]);console.log('Request handoff: service form + temporary DXF + PDF share, and material form + automatic PDF download passed. WhatsApp share was mocked; no messages sent.');
} finally {await browser.close();}
