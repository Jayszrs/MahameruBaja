import assert from "node:assert/strict";
import { writeFile, readFile } from "node:fs/promises";
assert.equal(process.env.ARTICLE_TEST_ISOLATED,"1","Use only a disposable local CMS_DATA_DIR.");
const base=process.env.ARTICLE_TEST_URL||"http://localhost:3000";
assert(["localhost","127.0.0.1"].includes(new URL(base).hostname));
let checks=0;
async function login(email,password) { const r=await fetch(base+"/api/admin/login",{method:"POST",redirect:"manual",headers:{Origin:base},body:new URLSearchParams({email,password})});checks++;return {cookie:r.headers.get("set-cookie")?.split(";")[0],location:r.headers.get("location")}; }
async function request(cookie,path,method="GET",data,origin=base) {checks++;return fetch(base+path,{method,redirect:"manual",headers:{...(cookie?{Cookie:cookie}:{}),Origin:origin,...(data?{"Content-Type":"application/json"}:{})},...(data?{body:JSON.stringify(data)}:{})});}
async function json(cookie,path,method="GET",data,status=200) {const r=await request(cookie,path,method,data);const text=await r.text();assert.equal(r.status,status,`${method} ${path}: ${text}`);return text?JSON.parse(text):undefined;}
const superLogin=await login("cms-test@example.test","article-test-local"); const root=superLogin.cookie;assert(root);
if(process.argv.includes("--after-restart")) {
  const saved=JSON.parse(await readFile("/artifacts/persistence.json","utf8"));
  assert.deepEqual(await json(root,"/api/admin/divisions"),saved.divisions);
  assert.deepEqual(await json(root,"/api/admin/accounts"),saved.accounts);
  assert.deepEqual(await json(root,"/api/admin/content"),saved.content);
  assert.deepEqual(await json(root,"/api/admin/articles"),saved.articles);
  console.log("Division/account/content/article stores survived restart without reseeding.");process.exit(0);
}
const accounts=await json(root,"/api/admin/accounts");assert.equal(accounts.length,3);assert(accounts.every(a=>!('passwordHash'in a)&&!('sessionVersion'in a)));
const initial=await json(root,"/api/admin/divisions");assert.equal(initial.length,5);assert(initial.every(d=>d.status==="active"));
const a=(await login("division-a@example.test","division-fixture-a")).cookie,b=(await login("division-b@example.test","division-fixture-b")).cookie;assert(a&&b);
const divisionA=(await json(a,"/api/admin/divisions"))[0],divisionB=(await json(b,"/api/admin/divisions"))[0];assert.equal(divisionA.slug,"retail-tambun");assert.equal(divisionB.slug,"retail-cibitung");
for(const path of ["/api/admin/divisions","/api/admin/accounts","/api/admin/content","/api/admin/articles","/api/admin/requests","/api/admin/inventory"])assert.equal((await request(null,path)).status,401);
assert.equal((await request(a,"/api/admin/accounts")).status,403);const deniedAccountPage = await request(a,"/admin/akun"); const deniedAccountHtml = await deniedAccountPage.text(); assert(deniedAccountHtml.includes("404")); assert(!deniedAccountHtml.includes("initialAccounts"));
assert.equal((await request(a,`/api/admin/divisions/${divisionB.id}`)).status,404);
await json(a,`/api/admin/divisions/${divisionB.id}`,"PUT",divisionB,403);
await json(a,"/api/admin/divisions","POST",divisionA,403);
await json(a,`/api/admin/divisions/${divisionA.id}`,"PUT",{...divisionA,status:"archived"},403);
await json(a,`/api/admin/divisions/${divisionA.id}`,"PUT",{...divisionA,slug:"renamed"},400);
assert.equal((await request(root,"/api/admin/accounts","POST",{},"https://untrusted.example")).status,403);
await json(a,`/api/admin/divisions/${divisionA.id}`,"PUT",{...divisionA,useCentralReviews:!divisionA.useCentralReviews},403);
let own=await json(a,`/api/admin/divisions/${divisionA.id}`,"PUT",{...divisionA,title:"Profil divisi A dari fixture"});
assert((await (await request(null,"/unit/retail-tambun")).text()).includes(own.title));
await json(a,`/api/admin/divisions/${divisionA.id}`,"PUT",{...divisionA,title:"Stale"},409);
assert.equal((await json(root,`/api/admin/divisions/${divisionB.id}`)).title,divisionB.title);
const ca=await json(a,"/api/admin/content"),cb=await json(b,"/api/admin/content");assert(ca.contacts.every(c=>c.ownerDivision==="retail-tambun"));assert(cb.contacts.every(c=>c.ownerDivision==="retail-cibitung"));assert.equal(ca.reviews.length,0);assert.equal(ca.garudaReviews.reviews.length,0);assert(cb.garudaReviews.reviews.length>0);assert.equal((await json(a,"/api/admin/articles")).length,0);
const bodyA=structuredClone(ca),bodyB=structuredClone(cb);bodyA.contacts[0].role="Fixture A";bodyB.contacts[0].role="Fixture B";
const responseA=await json(a,"/api/admin/content","PUT",{...bodyA,_base:ca});
assert(responseA.contacts.every(c=>c.ownerDivision==="retail-tambun"));assert.equal(responseA.reviews.length,0);assert.equal(responseA.garudaReviews.reviews.length,0);
await json(b,"/api/admin/content","PUT",{...bodyB,_base:cb});
let content=await json(root,"/api/admin/content");assert.equal(content.contacts.find(c=>c.id===ca.contacts[0].id).role,"Fixture A");assert.equal(content.contacts.find(c=>c.id===cb.contacts[0].id).role,"Fixture B");
await json(a,"/api/admin/content","PUT",{...bodyA,contacts:bodyA.contacts.map((c,i)=>i?c:{...c,role:"Stale"}),_base:ca},409);
for(const key of ["contacts","socialPosts","heroSlides","promotions","galleryProjects","socialAccounts"]) {const current=await json(a,"/api/admin/content");const foreign=content[key].find(c=>c.ownerDivision!=="retail-tambun");if(foreign)await json(a,"/api/admin/content","PUT",{...current,[key]:[...current[key],foreign],_base:current},403);}
let scoped=await json(a,"/api/admin/content");await json(a,"/api/admin/content","PUT",{...scoped,contacts:scoped.contacts.map((c,i)=>i?c:{...c,audience:["retail-cibitung"]}),_base:scoped},403);
await json(a,"/api/admin/content","PUT",{...scoped,rating:3,_base:scoped},403);
for(const key of ["socialAccounts","socialPosts","heroSlides","promotions","galleryProjects"]) {
  const original=content[key][0];if(!original)continue;
  let current=await json(a,"/api/admin/content");const row={...structuredClone(original),id:"fixture-own-"+key,ownerDivision:"retail-tambun",audience:["retail-tambun"],published:false};
  if(key==="socialAccounts")row.handle="@fixture-unique";
  if("division"in row)row.division="retail-tambun";if("divisions"in row)row.divisions=["retail-tambun"];
  const saved=await json(a,"/api/admin/content","PUT",{...current,[key]:[...current[key],row],_base:current});assert(saved[key].every(r=>r.ownerDivision==="retail-tambun"));assert(!(await json(b,"/api/admin/content"))[key].some(r=>r.id===row.id));
  current=await json(a,"/api/admin/content");await json(a,"/api/admin/content","PUT",{...current,[key]:current[key].map(r=>r.id===row.id?{...r,...(key==="socialAccounts"?{handle:"@fixture-edited"}:key==="socialPosts"?{caption:"Fixture edited"}:{title:"Fixture edited"})}:r),_base:current});
  current=await json(a,"/api/admin/content");await json(a,"/api/admin/content","PUT",{...current,[key]:current[key].filter(r=>r.id!==row.id),_base:current});
}
const articleInput={title:"Artikel fixture divisi A",slug:"artikel-fixture-divisi-a",category:"Pengujian",date:"2026-10-11",excerpt:"Ringkasan fixture",image:"/images/steel-indonesia/hollow.jpg",imageAlt:"Hollow",content:"## Panduan fixture\n\nArtikel milik divisi A.",status:"draft"};
let article=await json(a,"/api/admin/articles","POST",articleInput,201);assert.equal(article.ownerDivision,"retail-tambun");assert.equal((await json(b,"/api/admin/articles")).length,0);await json(b,`/api/admin/articles/${article.id}`,"PUT",article,403);await json(b,`/api/admin/articles/${article.id}`,"DELETE",{revision:article.revision},403);await json(a,"/api/admin/articles","POST",{...articleInput,slug:"tamper",ownerDivision:"retail-cibitung"},403);
assert.equal((await request(null,`/informasi/${article.slug}`)).status,404);
const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC","base64");
async function upload(cookie,bytes=png,owner) {const form=new FormData();form.set("media",new File([bytes],"fixture.png",{type:"image/png"}));if(owner!==undefined)form.set("ownerDivision",owner);checks++;return fetch(base+"/api/admin/media",{method:"POST",headers:{Origin:base,...(cookie?{Cookie:cookie}:{})},body:form});}
assert.equal((await upload(null)).status,401);assert.equal((await upload(a,Buffer.from("invalid"))).status,400);assert.equal((await upload(a,png.subarray(0,24))).status,400);assert.equal((await upload(a,Buffer.alloc(4000001))).status,400);assert.equal((await upload(a,png,"retail-cibitung")).status,403);
const media=await (await upload(a)).json();assert.equal((await request(a,media.url)).status,200);assert.equal((await request(null,`/_next/image?url=${encodeURIComponent(media.url)}&w=640&q=75`)).status,400);assert.equal((await request(b,media.url)).status,404);assert.equal((await request(null,media.url)).status,404);
await json(b,"/api/admin/articles","POST",{...articleInput,slug:"media-theft",image:media.url},403);
article=await json(a,`/api/admin/articles/${article.id}`,"PUT",{...article,image:media.url,status:"published"});assert.equal((await request(null,media.url)).status,200);assert((await (await request(null,"/unit/retail-tambun")).text()).includes(article.title));
article=await json(a,`/api/admin/articles/${article.id}`,"PUT",{...article,status:"draft"});assert.equal((await request(null,media.url)).status,404);
const ownInvoice={number:"FIXTURE-A",issuedAt:"2026-10-11",dueAt:"",notes:"",lines:[{description:"Test",quantity:1,unit:"",price:1}]};
const reqInput={kind:"GENERAL",businessUnitSlug:"retail-tambun",name:"Fixture divisi A",whatsapp:"081234567890",consent:true,items:[]};const req=await json(a,"/api/admin/requests","POST",reqInput,201);assert((await json(a,"/api/admin/requests")).some(r=>r.id===req.id));assert(!(await json(b,"/api/admin/requests")).some(r=>r.id===req.id));
const invoiced=await json(a,`/api/admin/requests?id=${req.id}`,"PATCH",{revision:req.revision,invoice:ownInvoice});assert.equal(invoiced.invoice.number,"FIXTURE-A");
await json(b,`/api/admin/requests?id=${req.id}`,"PATCH",{revision:req.revision,invoice:{number:"FIXTURE",issuedAt:"2026-10-11",dueAt:"",notes:"",lines:[{description:"Test",quantity:1,unit:"",price:1}]}},403);
const stock=await json(a,"/api/admin/inventory");assert(stock.items.every(i=>i.division==="retail-tambun"));await json(a,"/api/admin/inventory","PUT",{items:[{...stock.items[0],division:"retail-cibitung"}],base:stock.items},403);
const newProfile={...divisionA,slug:"fixture-divisi-baru",name:"Divisi fixture baru",status:"draft",images:[],offerings:[],process:[],faq:[]};let created=await json(root,"/api/admin/divisions","POST",newProfile,201);assert.equal((await request(null,"/unit/"+created.slug)).status,404);await json(root,"/api/admin/divisions","POST",newProfile,409);await json(root,`/api/admin/divisions/${created.id}`,"PUT",{...created,hero:"",status:"active"},400);created=await json(root,`/api/admin/divisions/${created.id}`,"PUT",{...created,status:"active"});for(const section of ["","/tentang","/layanan","/produk","/galeri","/kontak"])assert.equal((await request(null,`/unit/${created.slug}${section}`)).status,200);assert((await(await request(null,"/sitemap.xml")).text()).includes(created.slug));
let accountResult=await json(root,"/api/admin/accounts","POST",{name:"Admin fixture sementara",email:"temporary@example.test",division:created.slug,active:true},201);let account=accountResult.account;assert(accountResult.temporaryPassword);assert(!JSON.stringify(await json(root,"/api/admin/accounts")).includes(accountResult.temporaryPassword));await json(root,"/api/admin/accounts","POST",{name:"Duplikat",email:account.email,division:created.slug,active:true},409);
let tempLogin=await login(account.email,accountResult.temporaryPassword);assert(tempLogin.location.endsWith("/admin/akun-saya"));let temp=tempLogin.cookie;assert([401,403].includes((await request(temp,"/api/admin/content")).status));assert([401,403].includes((await request(temp,"/api/admin/inventory","PUT",{items:[],base:[]})).status));await json(temp,"/api/admin/change-password","POST",{currentPassword:"incorrect",newPassword:"fixture-new-password"},400);await json(temp,"/api/admin/change-password","POST",{currentPassword:accountResult.temporaryPassword,newPassword:"short"},400);
const passwordChanged=await request(temp,"/api/admin/change-password","POST",{currentPassword:accountResult.temporaryPassword,newPassword:"fixture-new-password"});assert.equal(passwordChanged.status,200);const nextCookie=passwordChanged.headers.get("set-cookie").split(";")[0];assert.equal((await request(temp,"/api/admin/divisions")).status,401);temp=nextCookie;assert.equal((await request(temp,"/api/admin/divisions")).status,200);
account=(await json(root,"/api/admin/accounts")).find(a=>a.id===account.id);await json(root,`/api/admin/accounts/${account.id}`,"PUT",{...account,revision:account.revision-1},409);
accountResult=await json(root,`/api/admin/accounts/${account.id}/reset-password`,"POST",{revision:account.revision});account=accountResult.account;assert.equal((await request(temp,"/api/admin/divisions")).status,401);assert(!(await login(account.email,"fixture-new-password")).cookie);temp=(await login(account.email,accountResult.temporaryPassword)).cookie;assert(temp);
account=(await json(root,`/api/admin/accounts/${account.id}`,"PUT",{...account,division:"retail-cibitung"})).account;assert.equal((await request(temp,"/api/admin/divisions")).status,401);await json(root,`/api/admin/accounts/${account.id}`,"DELETE",{revision:account.revision},400);account=(await json(root,`/api/admin/accounts/${account.id}`,"PUT",{...account,active:false})).account;assert(!(await login(account.email,accountResult.temporaryPassword)).cookie);await json(root,`/api/admin/accounts/${account.id}`,"DELETE",{revision:account.revision});assert(!(await login(account.email,accountResult.temporaryPassword)).cookie);
const superAccount=accounts.find(a=>a.role==="super_admin");await json(root,`/api/admin/accounts/${superAccount.id}`,"PUT",{...superAccount,active:false},400);await json(root,`/api/admin/accounts/${superAccount.id}`,"DELETE",{revision:superAccount.revision},400);
created=await json(root,`/api/admin/divisions/${created.id}`,"PUT",{...created,status:"archived"});assert.equal((await request(null,"/unit/"+created.slug)).status,404);await json(null,"/api/requests","POST",{...reqInput,businessUnitSlug:created.slug},400);await json(root,`/api/admin/divisions/${created.id}`,"DELETE",{revision:created.revision});
own=await json(root,`/api/admin/divisions/${divisionA.id}`,"PUT",{...own,status:"archived"});assert.equal((await request(a,"/api/admin/content")).status,401);assert(!(await login("division-a@example.test","division-fixture-a")).cookie);assert.equal((await request(null,"/unit/retail-tambun")).status,404);assert.equal((await request(null,`/informasi/${article.slug}`)).status,404);await json(root,`/api/admin/divisions/${divisionA.id}`,"DELETE",{revision:own.revision},409);own=await json(root,`/api/admin/divisions/${divisionA.id}`,"PUT",{...own,status:"active"});assert((await login("division-a@example.test","division-fixture-a")).cookie);
await json(a,`/api/admin/articles/${article.id}`,"DELETE",{revision:article.revision});
await writeFile("/artifacts/persistence.json",JSON.stringify({divisions:await json(root,"/api/admin/divisions"),accounts:await json(root,"/api/admin/accounts"),content:await json(root,"/api/admin/content"),articles:await json(root,"/api/admin/articles")}));
console.log(`Divisions/accounts/ownership integration: ${checks} HTTP checks passed on disposable local storage.`);
