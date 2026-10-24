import assert from 'node:assert/strict';import {createRequire} from 'node:module';
assert.equal(process.env.CMS_ORDER_TEST_ISOLATED,'1','Use a disposable fixture only.');
const base=process.env.CMS_TEST_URL||'http://localhost:3193';assert(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const {chromium}=createRequire(import.meta.url)(process.env.CMS_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CMS_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const root=await browser.newContext({viewport:{width:1440,height:1000}}),a=await browser.newContext(),b=await browser.newContext();
const page=await root.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const stamp=Date.now(),credentials={root:['order-root@example.test','order-root-test'],a:['order-a@example.test','order-division-test'],b:['order-b@example.test','order-division-test']};
async function login(context,key){const [email,password]=credentials[key];const response=await context.request.post(base+'/api/admin/login',{headers:{Origin:base},form:{email,password},timeout:90000});assert.equal(response.status(),200,await response.text());}
async function api(context,url,method='GET',data,status=200){const response=await context.request.fetch(base+url,{method,headers:{Origin:base},...(data?{data}:{}),timeout:90000});const text=await response.text();assert.equal(response.status(),status,method+' '+url+' '+text);return text?JSON.parse(text):undefined;}
const refs=rows=>({items:rows.map(({id,revision})=>({id,revision}))});const ids=rows=>rows.map(row=>row.id);
const input=(name,date='2026-10-24',status='published')=>({title:name,slug:'',category:'QA',date,excerpt:'Order test excerpt',image:'/images/steel-indonesia/hollow.jpg',imageAlt:'Local order fixture',content:'Local order test article.',status});
try{
 await login(root,'root');await login(a,'a');await login(b,'b');
 let records=await api(root,'/api/admin/articles');assert(records.every((row,index)=>!index||records[index-1].date>=row.date),'Legacy article chronology remains');
 const older=await api(root,'/api/admin/articles','POST',input('Order older '+stamp,'2020-01-01'),201);await api(root,'/api/admin/articles','POST',input('Order newer '+stamp),201);
 records=await api(root,'/api/admin/articles');const requested=[records.find(row=>row.id===older.id),...records.filter(row=>row.id!==older.id)];
 const reordered=await api(root,'/api/admin/articles/reorder','PUT',refs(requested));assert.equal(reordered[0].id,older.id);assert.deepEqual(ids(await api(root,'/api/admin/articles')),ids(reordered));
 await api(root,'/api/admin/articles/reorder','PUT',refs(requested),409);await api(root,'/api/admin/articles/reorder','PUT',refs([reordered[0],reordered[0]]),400);
 await page.goto(base+'/informasi',{waitUntil:'domcontentloaded'});await page.locator('.article-index-page h3').first().waitFor();assert.equal(await page.locator('.article-index-page h3').first().innerText(),older.title);
 console.log('PASS article manual order overrides date publicly, reload persists, stale revision409 and duplicate400.');
 for(let i=0;i<3;i++)await api(a,'/api/admin/articles','POST',input('Order A '+stamp+' '+i,'2026-10-24','draft'),201);
 for(let i=0;i<2;i++)await api(b,'/api/admin/articles','POST',input('Order B '+stamp+' '+i,'2026-10-24','draft'),201);
 const before=await api(root,'/api/admin/articles'),own=await api(a,'/api/admin/articles'),foreign=(await api(b,'/api/admin/articles'))[0];
 const ownReordered=await api(a,'/api/admin/articles/reorder','PUT',refs([...own].reverse()));const after=await api(root,'/api/admin/articles');
 const ownSet=new Set(own.map(row=>row.id));assert.deepEqual(after.map(row=>ownSet.has(row.id)?null:row.id),before.map(row=>ownSet.has(row.id)?null:row.id));assert.deepEqual(ids(after.filter(row=>ownSet.has(row.id))),ids(ownReordered));
 for(const row of before.filter(row=>!ownSet.has(row.id))){const next=after.find(next=>next.id===row.id);assert.deepEqual(next,row);}
 await api(a,'/api/admin/articles/reorder','PUT',refs([foreign,...ownReordered]),403);await api(a,'/api/admin/articles/reorder','PUT',refs([]),409);
 const divisions=await api(root,'/api/admin/divisions');await api(a,'/api/admin/divisions/reorder','PUT',refs(divisions),403);
 const ordered=await api(root,'/api/admin/divisions/reorder','PUT',refs([...divisions].reverse()));assert.deepEqual(ids(await api(root,'/api/admin/divisions')),ids(ordered));await api(root,'/api/admin/divisions/reorder','PUT',refs([...divisions].reverse()),409);
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.locator('[data-footer-division]').first().waitFor();assert.deepEqual(await page.locator('[data-footer-division]').evaluateAll(nodes=>nodes.map(node=>node.dataset.footerDivision)),ordered.filter(row=>row.status==='active').map(row=>row.slug));
 const template=ordered[0];const created=await api(root,'/api/admin/divisions','POST',{...template,slug:'order-new-'+stamp,name:'Order new division '+stamp,status:'active'},201);assert.equal((await api(root,'/api/admin/divisions'))[0].id,created.id);
 console.log('PASS scoped article order preserves other division slots/content, foreign403/incomplete409, division super-admin guard403, persisted public division order, new division prepends.');
 await page.goto(base+'/admin/artikel',{waitUntil:'domcontentloaded'});await page.locator('.admin-topbar').getByRole('button',{name:'Simpan artikel',exact:true}).waitFor();
 let list=page.getByRole('region',{name:'Urutan artikel',exact:true});let uiBefore=await list.locator('[data-order-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.orderId));const targetId=older.id,targetIndex=uiBefore.indexOf(targetId);assert(targetIndex>=0&&targetIndex<uiBefore.length-1);
 await list.locator(`[data-order-id="${targetId}"] .admin-order-select`).click();await list.locator(`[data-order-id="${targetId}"] .admin-drag-handle`).press('ArrowDown');await page.locator('#article-form').getByLabel(/^Ringkasan/).fill('Combined article and order save '+stamp);
 const contentSave=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/articles/'+targetId&&r.request().method()==='PUT');const orderSave=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/articles/reorder'&&r.request().method()==='PUT');
 await page.locator('.admin-topbar').getByRole('button',{name:'Simpan artikel',exact:true}).click();assert.equal((await contentSave).status(),200);assert.equal((await orderSave).status(),200);
 let stored=await api(root,'/api/admin/articles');assert.equal(stored[targetIndex+1].id,targetId);assert.equal(stored.find(row=>row.id===targetId).excerpt,'Combined article and order save '+stamp);
 await page.reload();await page.locator('.admin-topbar').getByRole('button',{name:'Simpan artikel',exact:true}).waitFor();list=page.getByRole('region',{name:'Urutan artikel',exact:true});assert.equal(await list.locator('[data-order-id]').nth(targetIndex+1).getAttribute('data-order-id'),targetId);
 await page.goto(base+'/admin/divisi',{waitUntil:'domcontentloaded'});await page.locator('.admin-topbar').getByRole('button',{name:'Simpan profil',exact:true}).waitFor();list=page.getByRole('region',{name:'Urutan divisi',exact:true});const firstId=await list.locator('[data-order-id]').first().getAttribute('data-order-id');await list.locator('.admin-drag-handle').first().press('ArrowDown');
 const divisionSave=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/divisions/reorder'&&r.request().method()==='PUT');await page.locator('.admin-topbar').getByRole('button',{name:'Simpan profil',exact:true}).click();assert.equal((await divisionSave).status(),200);assert.equal((await api(root,'/api/admin/divisions'))[1].id,firstId);
 assert.deepEqual(errors,[]);console.log('PASS browser shared Save persists article edit+order in one action, reload order, and division order without opening a profile. No runtime errors.');
}finally{await browser.close();}
