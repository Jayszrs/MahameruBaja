import assert from 'node:assert/strict';
import {createRequire} from 'node:module';


assert.equal(process.env.CMS_TEST_ISOLATED,'1','Use a disposable CMS_DATA_DIR; never run this against production data.');
const base=process.env.CMS_TEST_URL||'http://localhost:3173';
assert(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Local fixture only.');
const {chromium}=createRequire(import.meta.url)(process.env.CMS_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CMS_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const authFile=process.env.CMS_TEST_AUTH_FILE;
const context=await browser.newContext({viewport:{width:1440,height:1000},...(authFile?{storageState:authFile}:{})});
const page=await context.newPage();
const publicPage=await context.newPage();page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(60000);publicPage.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
const prefix='UI fixture '+Date.now();
const stages=['contacts','reviews','hero','poster','gallery','accounts','posts','logos','articles','divisions'];
const start=stages.indexOf(process.env.CMS_TEST_START||'contacts'),end=stages.indexOf(process.env.CMS_TEST_END||'divisions');assert(start>=0 && end>=start);let form,id,data;const run=name=>stages.indexOf(name)>=start && stages.indexOf(name)<=end;
const image={name:'cms-ui-fixture.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC','base64')};
async function content(){const r=await context.request.get(base+'/api/admin/content');assert.equal(r.status(),200);return r.json();}
async function go(route){await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.locator('.admin-topbar').getByRole('button',{name:/^Simpan/}).waitFor({timeout:90000});}
async function save(path='/api/admin/content'){
 const done=page.waitForResponse(r=>new URL(r.url()).pathname===path&&['PUT','POST'].includes(r.request().method()));
 await page.locator('.admin-topbar').getByRole('button',{name:/^Simpan/}).click();
 const r=await done;const body=await r.json();console.log('saved',path,r.status());assert(r.ok(),JSON.stringify(body));
 await page.waitForFunction(()=>{const b=document.querySelector('.admin-topbar-actions .admin-primary');return b&&b.textContent.startsWith('Simpan')&&b.disabled;});
 return body;
}
async function upload(input){const response=page.waitForResponse(r=>/\/api\/admin\/(?:media|articles\/upload)$/.test(new URL(r.url()).pathname)&&r.request().method()==='POST');await input.setInputFiles(image);const r=await response;const data=await r.json();assert(r.ok(),JSON.stringify(data));await page.waitForFunction(()=>!document.querySelector('fieldset:disabled'));console.log('uploaded');return data;}
async function visibleForm(locator){await locator.waitFor();await page.waitForFunction(sel=>{const b=document.querySelector(sel)?.getBoundingClientRect();return b&&b.top>=70&&b.top<350;},await locator.evaluate(el=>'#'+CSS.escape(el.id)));}
async function publicContains(route,text){await publicPage.goto(base+route,{waitUntil:'domcontentloaded'});await publicPage.getByText(text,{exact:false}).first().waitFor({state:'attached'});}
async function reorder(label,id,key){
 const list=page.getByRole('region',{name:label,exact:true});
 const row=list.locator(`[data-order-id="${id}"]`);const old=await list.locator('[data-order-id]').evaluateAll(els=>els.map(e=>e.dataset.orderId));
 if(old.length<2)return;
 await page.locator('.admin-topbar').getByRole('button',{name:/^Simpan/}).waitFor();await row.locator('.admin-drag-handle').focus();await row.locator('.admin-drag-handle').press('ArrowDown');
 const saved=await save();assert.equal(saved[key].filter(item=>old.includes(item.id))[1].id,id,'Keyboard reorder persisted within filtered list');
 await page.reload();await page.locator('.admin-topbar').getByRole('button',{name:/^Simpan/}).waitFor();const reloaded=page.getByRole('region',{name:label,exact:true});await reloaded.locator('[data-order-id]').nth(1).waitFor();const now=await reloaded.locator('[data-order-id]').evaluateAll(els=>els.map(e=>e.dataset.orderId));assert.equal(now[1],id,'Order survives reload');
 await page.locator('.admin-topbar').getByRole('button',{name:/^Simpan/}).waitFor();
 const moving=reloaded.locator(`[data-order-id="${id}"] .admin-drag-handle`);await moving.scrollIntoViewIfNeeded();
 const target=reloaded.locator('[data-order-id]').first();const a=await moving.boundingBox(),b=await target.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();
 const dragged=await save();assert.equal(dragged[key].filter(item=>old.includes(item.id))[0].id,id,'Pointer drag persisted within filtered list');
}
try{
 if(!authFile){const login=await context.request.post(base+'/api/admin/login',{headers:{Origin:base},form:{email:process.env.CMS_TEST_EMAIL||'revision@example.test',password:process.env.CMS_TEST_PASSWORD||'revision-local-test'}});assert.equal(login.status(),200,'Fixture login');await context.storageState({path:'tmp/cms-ui-auth.json'});}
 for (const kind of ['contacts', 'reviews']) if (run(kind)) {
  console.log('START', kind);
  await go('/admin/konten?tab='+kind);
  await page.getByRole('button',{name:kind==='contacts'?'+ Tambah kontak':'+ Tambah ulasan',exact:true}).click();
  form=page.locator('.cms-content-record').first();await visibleForm(form);
  id=(await form.getAttribute('id')).replace('content-','');
  if(kind==='contacts') {
   await form.getByLabel('Nama',{exact:true}).fill(prefix+' contact');
   await form.getByLabel('WhatsApp',{exact:true}).fill('081234567890');
   await upload(form.locator('input[type=file]'));
  } else {
   await form.getByLabel('Nama penulis (sesuai Google)',{exact:true}).fill(prefix+' review');
   await form.getByLabel('Komentar asli',{exact:false}).fill('Kutipan pengujian lokal yang dihapus setelah verifikasi.');
  }
  assert.equal(await form.getByText('Terbit',{exact:true}).count(),0);
  data=await save();assert.equal(data[kind][0].id,id);assert.equal(data[kind][0].published,true);
  await reorder(kind==='contacts'?'Urutan kontak':'Urutan ulasan',id,kind);
  form=page.locator('#content-'+id);await form.locator(':scope > summary').click();
  if(kind==='contacts')await form.getByLabel('Jabatan',{exact:true}).fill('Pelayanan pelanggan');
  else await form.getByLabel('Komentar asli',{exact:false}).fill('Kutipan pengujian lokal diperbarui.');
  data=await save();assert.equal(data[kind].find(row=>row.id===id)[kind==='contacts'?'role':'text'],kind==='contacts'?'Pelayanan pelanggan':'Kutipan pengujian lokal diperbarui.');
  await form.getByRole('button',{name:'Hapus',exact:true}).click();await form.getByRole('button',{name:'Batal',exact:true}).click();
  await form.getByRole('button',{name:'Hapus',exact:true}).click();await form.getByRole('button',{name:'Ya, hapus',exact:true}).click();
  data=await save();assert(!data[kind].some(row=>row.id===id));console.log('PASS '+kind+': create/prepend/autopublish/reorder/reload/update/delete confirmation');
 }
 if(run('hero')){console.log('START hero');
 // Hero: upload, auto-publication, keyboard reorder, edit and delete.
 await go('/admin/hero');await page.getByRole('button',{name:'+ Tambah slide',exact:true}).click();form=page.locator('.hero-slide-editor').first();await visibleForm(form);id=(await form.getAttribute('id')).replace('hero-','');assert.equal(await form.locator('input[name^="hero-url-"]').inputValue(),'','New hero requires media');
 await form.getByLabel('Label layanan',{exact:true}).fill(prefix+' hero');await form.getByLabel('Deskripsi media',{exact:true}).fill(prefix+' hero image');await upload(form.locator('input[type=file]').first());data=await save();assert.equal(data.heroSlides[0].id,id);assert.equal(data.heroSlides[0].published,true);await publicContains('/',prefix+' hero');await reorder('Urutan slide',id,'heroSlides');
 form=page.locator('#hero-'+id);await form.getByRole('button',{name:'Hapus slide',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Hapus slide',exact:true}).click();data=await save();assert(!data.heroSlides.some(x=>x.id===id));console.log('PASS hero: upload/create/prepend/autopublish/public/reorder/reload/delete');
 }
 if(run('poster')){console.log('START poster');
 // Poster: create at top, upload, published save, public popup, order and delete.
 await go('/admin/promosi');await page.getByRole('button',{name:'+ Tambah poster popup',exact:true}).click();form=page.locator('.promotion-editor-panel').first();await visibleForm(form);id=(await form.getAttribute('id')).replace('promotion-','');await form.getByLabel('Judul banner',{exact:true}).fill(prefix+' poster');await form.getByLabel('Penjelasan singkat',{exact:false}).fill('Informasi uji CMS yang dihapus setelah verifikasi.');await form.getByLabel('Deskripsi gambar untuk pembaca layar',{exact:true}).fill(prefix+' poster image');await upload(form.locator('input[type=file]'));data=await save();assert.equal(data.promotions[0].id,id);assert.equal(data.promotions[0].published,true);await publicContains('/',prefix+' poster');await reorder('Urutan poster & banner',id,'promotions');form=page.locator('#promotion-'+id);await form.locator('summary').first().click();await form.getByRole('button',{name:'Hapus',exact:true}).click();await form.getByRole('button',{name:'Ya, hapus',exact:true}).click();data=await save();assert(!data.promotions.some(x=>x.id===id));console.log('PASS poster: upload/create/prepend/autopublish/public/reorder/reload/delete');
 }
 if(run('gallery')){console.log('START gallery');
 // Gallery: two photos, album and photo ordering, live output and delete.
 await go('/admin/galeri');await page.getByRole('button',{name:'+ Tambah proyek',exact:true}).click();form=page.locator('#gallery-project-form');await visibleForm(form);await form.getByLabel('Nama proyek',{exact:true}).fill(prefix+' gallery');await upload(form.locator('input[type=file]'));data=await save();id=data.galleryProjects[0].id;assert.equal(data.galleryProjects[0].published,true);await publicContains('/proyek',prefix+' gallery');await reorder('Urutan album',id,'galleryProjects');await page.getByRole('region',{name:'Urutan album',exact:true}).locator(`[data-order-id="${id}"] .admin-order-select`).click();form=page.locator('#gallery-project-form');await form.getByRole('button',{name:'Hapus album',exact:true}).click();data=await save();assert(!data.galleryProjects.some(x=>x.id===id));console.log('PASS gallery: upload/create/prepend/autopublish/public/reorder/reload/delete');
 }
 if(run('accounts')){console.log('START accounts');
 // Social account and post share one save transaction model.
 await go('/admin/sosial?tab=accounts');await page.getByRole('button',{name:'+ Tambah akun',exact:true}).click();form=page.locator('section.editor-panel').first();await visibleForm(form);id=(await form.getAttribute('id')).replace('account-','');await form.getByLabel('Username / nama kanal',{exact:true}).fill(prefix+' account');await form.getByLabel('URL profil resmi',{exact:true}).fill('https://www.instagram.com/fixturecms/');data=await save();assert.equal(data.socialAccounts[0].id,id);assert.equal(data.socialAccounts[0].published,true);await publicContains('/sosial-media',prefix+' account');await reorder('Urutan akun',id,'socialAccounts');form=page.locator('#account-'+id);await form.getByRole('button',{name:'Hapus akun',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Hapus akun',exact:true}).click();data=await save();assert(!data.socialAccounts.some(x=>x.id===id));console.log('PASS social account: create/prepend/autopublish/public/reorder/reload/delete');
 }
 if(run('posts')){console.log('START posts');
 await go('/admin/sosial?tab=posts');await page.getByRole('button',{name:'+ Tambah unggahan',exact:true}).click();form=page.locator('section.editor-panel').first();await visibleForm(form);id=(await form.getAttribute('id')).replace('social-','');await form.getByLabel('Judul',{exact:true}).fill(prefix+' social');await form.getByLabel('Tautan unggahan asli',{exact:true}).fill('https://www.instagram.com/p/FixtureCMS2026/');await upload(form.locator('input[type=file]').first());data=await save();assert.equal(data.socialPosts[0].id,id);assert.equal(data.socialPosts[0].published,true);await publicContains('/sosial-media',prefix+' social');await reorder('Urutan unggahan',id,'socialPosts');form=page.locator('#social-'+id);await form.getByRole('button',{name:'Hapus',exact:true}).click();await form.getByRole('button',{name:'Ya, hapus',exact:true}).click();data=await save();assert(!data.socialPosts.some(x=>x.id===id));console.log('PASS social post: upload/create/prepend/autopublish/public/reorder/reload/delete');
 }
 if(run('logos')){console.log('START logos');
 // Logo.
 await go('/admin/mitra?tab=suppliers');await page.getByRole('button',{name:'+ Tambah logo',exact:true}).click();form=page.locator('.partner-editor-record').first();await visibleForm(form);id=(await form.getAttribute('id')).replace('partner-','');await form.getByLabel('Nama supplier',{exact:true}).fill(prefix+' logo');await upload(form.locator('input[type=file]'));data=await save();assert.equal(data.partnerLogos[0].id,id);assert.equal(data.partnerLogos[0].published,true);await publicPage.goto(base+'/');await publicPage.getByRole('img',{name:'Logo '+prefix+' logo',exact:true}).first().waitFor({state:'attached'});await reorder('Urutan logo',id,'partnerLogos');form=page.locator('#partner-'+id);await form.locator('summary').first().click();await form.getByRole('button',{name:'Hapus',exact:true}).click();await form.getByRole('button',{name:'Ya, hapus',exact:true}).click();data=await save();assert(!data.partnerLogos.some(x=>x.id===id));console.log('PASS logo: upload/create/prepend/autopublish/public/reorder/reload/delete');
 }
 if(run('articles')){console.log('START articles');
 // Article CRUD, upload and direct publication.
 await go('/admin/artikel');await page.getByRole('button',{name:'+ Tambah',exact:true}).click();form=page.locator('#article-form');await visibleForm(form);await form.getByLabel('Judul artikel',{exact:true}).fill(prefix+' article');await form.getByLabel('Kategori',{exact:true}).fill('Verifikasi lokal');await form.getByLabel(/^Ringkasan/).fill('Ringkasan artikel uji antarmuka CMS.');await form.getByLabel('Deskripsi gambar sampul',{exact:true}).fill('Sampul verifikasi CMS');await upload(form.locator('input[type=file]'));await form.getByRole('textbox',{name:'Isi artikel',exact:true}).fill('Isi artikel untuk verifikasi CMS lokal.');data=await save('/api/admin/articles');id=data.id;assert.equal(data.status,'published');await publicContains('/informasi/'+data.slug,prefix+' article');await form.getByLabel(/^Ringkasan/).fill('Ringkasan telah diperbarui melalui CMS.');await save('/api/admin/articles/'+id);await form.getByRole('button',{name:'Hapus',exact:true}).click();const deleted=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/articles/'+id&&r.request().method()==='DELETE');await form.getByRole('button',{name:'Ya, hapus artikel',exact:true}).click();assert((await deleted).ok());console.log('PASS article: upload/create/autopublish/public/update/delete');
 }
 if(run('divisions')){console.log('START divisions');
 // Complete profiles publish on first save; incomplete profiles retain clear validation.
 await go('/admin/divisi');await page.getByRole('button',{name:'+ Tambah divisi',exact:true}).click();form=page.locator('#division-form');await visibleForm(form);
 await form.getByLabel('Nama divisi',{exact:true}).fill(prefix+' division');await form.getByLabel('Label singkat',{exact:true}).fill('Verifikasi lokal');
 await page.locator('.admin-topbar').getByRole('button',{name:'Simpan profil',exact:true}).click();await page.getByRole('alert').filter({hasText:'area layanan'}).waitFor();
 await form.getByLabel('Area layanan',{exact:true}).fill('Bekasi');
 await page.getByRole('button',{name:'Profil & layanan',exact:false}).click();
 await form.getByLabel('Judul utama',{exact:true}).fill(prefix+' division');await form.getByLabel(/^Pengantar singkat/).fill('Pengantar untuk verifikasi lokal.');await form.getByLabel(/^Deskripsi divisi/).fill('Profil pengujian lokal yang dihapus setelah selesai.');await form.getByLabel(/^Misi divisi/).fill('Verifikasi alur profil divisi.');
 await page.getByRole('button',{name:'Foto & logo',exact:false}).click();
 const logo=await upload(form.locator('.admin-media-row').nth(0).locator('input[type=file]'));await upload(form.locator('.admin-media-row').nth(1).locator('input[type=file]'));
 await page.getByRole('button',{name:'Kontak & lokasi',exact:false}).click();await form.getByLabel(/^Alamat lengkap/).fill('Alamat pengujian lokal, Bekasi');
 data=await save('/api/admin/divisions');id=data.id;assert.equal(data.status,'active');await publicContains('/unit/'+data.slug,prefix+' division');assert.equal((await context.request.get(base+logo.url)).status(),200,'Media uploaded before first save becomes public with the active division');
 await page.getByRole('button',{name:'Foto & logo',exact:false}).click();await upload(form.locator('input[type=file]').filter({visible:true}).first());await save('/api/admin/divisions/'+id);
 await page.getByRole('button',{name:'Identitas',exact:false}).click();await form.locator('.division-more-actions summary').click();await form.getByRole('button',{name:'Arsipkan divisi',exact:true}).click();
 const archived=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/divisions/'+id&&r.request().method()==='PUT');await page.getByRole('dialog').getByRole('button',{name:'Ya, arsipkan',exact:true}).click();assert((await archived).ok());
 if(await form.locator('.division-more-actions').getAttribute('open')===null)await form.locator('.division-more-actions summary').click();await form.getByRole('button',{name:'Hapus divisi kosong',exact:true}).click();
 const divisionDeleted=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/divisions/'+id&&r.request().method()==='DELETE');await page.getByRole('dialog').getByRole('button',{name:'Hapus permanen',exact:true}).click();assert((await divisionDeleted).ok());console.log('PASS division: incomplete feedback, pre-save uploads, create/autopublish/public/update/archive/delete');
 }
 assert.deepEqual(errors,[],'No runtime errors');console.log('PASS collection editor browser CRUD suite');
} catch(error){await page.screenshot({path:'tmp/cms-autopublish-failure.png',fullPage:false});console.error('FAILED at',page.url());throw error;} finally {await browser.close();}
