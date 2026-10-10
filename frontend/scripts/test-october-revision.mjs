// Isolated integration checks: never touch actual CMS data or accounts.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.dirname(frontend);
await mkdir(path.join(root,"tmp"),{recursive:true});
const directory=await mkdtemp(path.join(root,"tmp","revision-qa-"));
const origin="http://localhost:3162";
const concurrency=Number(process.env.QA_CONCURRENCY || 8);
assert.ok(Number.isInteger(concurrency) && concurrency >= 8 && concurrency <= 24,"QA_CONCURRENCY must be 8..24");
const slugs=["retail-tambun","retail-cibitung","trading-proyek","laser-cutting","fabrikasi-erection"];
const password=randomBytes(18).toString("hex"), salt=randomBytes(16).toString("hex");
const hash=`scrypt:${salt}:${scryptSync(password,salt,64).toString("hex")}`;
const accounts=slugs.map(division=>({email:`qa.${division}@example.test`,division,passwordHash:hash}));
const server=spawn(process.execPath,[path.join(root,"node_modules/next/dist/bin/next"),"start","-p","3162"],{cwd:frontend,windowsHide:true,stdio:["ignore","pipe","pipe"],env:{...process.env,CMS_DATA_DIR:directory,BLOB_READ_WRITE_TOKEN:"",VERCEL:"",ADMIN_EMAIL:"qa.owner@example.test",ADMIN_PASSWORD_HASH:hash,ADMIN_ACCOUNTS_JSON:JSON.stringify(accounts),ADMIN_SESSION_SECRET:randomBytes(32).toString("hex")}});
let logs="";server.stdout.on("data",b=>logs+=b);server.stderr.on("data",b=>logs+=b);
async function call(url,method="GET",body,cookie){return fetch(origin+url,{method,redirect:"manual",headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});}
async function login(email){const body=new URLSearchParams({email,password});const r=await fetch(origin+"/api/admin/login",{method:"POST",redirect:"manual",headers:{Origin:origin},body});assert.equal(r.status,303);assert.equal(new URL(r.headers.get("location")).pathname,"/admin");return r.headers.get("set-cookie").split(";")[0];}
const input=(slug,name)=>({kind:"GENERAL",businessUnitSlug:slug,name,whatsapp:"081234567890",consent:true,items:[],source:"ISOLATED_QA"});
try{
  let started=false;for(let i=0;i<50;i++){try{if((await call("/admin/login")).status===200){started=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}assert.ok(started,"Server did not start");
  assert.equal((await call("/api/admin/content")).status,401);
  const owner=await login("qa.owner@example.test");
  const publicContacts=await (await call("/api/contacts")).json(); assert.equal(publicContacts.length,10); assert.ok(publicContacts.every(c=>!Object.hasOwn(c,"email")));
  const sessions=await Promise.all(accounts.map(a=>login(a.email)));
  for(const [index,slug] of slugs.entries()){
    assert.equal((await call("/api/admin/requests","POST",input(slug,`QA ${slug}`),sessions[index])).status,201);
    assert.equal((await call("/api/admin/requests","POST",input(slugs[(index+1)%5],"QA Forbidden"),sessions[index])).status,403);
    const rows=await (await call("/api/admin/requests","GET",undefined,sessions[index])).json();assert.ok(rows.every(r=>r.businessUnitSlug===slug));
    for(const url of [`/unit/${slug}`,`/unit/${slug}/tentang`,`/unit/${slug}/kontak`])assert.equal((await call(url)).status,200,url);
  }
  console.log("PASS: five logins, scope isolation, 15 division routes");
  const concurrent=await Promise.all(Array.from({length:concurrency},(_,i)=>call("/api/requests","POST",input("laser-cutting",`QA concurrent ${i}`))));assert.ok(concurrent.every(r=>r.status===201),`Concurrent response statuses: ${concurrent.map(r=>r.status).join(", ")}`);
  let records=await (await call("/api/admin/requests","GET",undefined,owner)).json();assert.equal(records.length,5+concurrency);
  const record=records[0];
  const otherDivision=slugs.findIndex(slug=>slug!==record.businessUnitSlug);
  assert.equal((await call(`/api/admin/requests?id=${record.id}`,"PATCH",{revision:record.revision,notes:"Forbidden"},sessions[otherDivision])).status,403);
  assert.equal((await call(`/api/admin/requests?id=${record.id}`,"DELETE",{revision:record.revision},sessions[otherDivision])).status,403);
  assert.equal((await call(`/api/admin/requests?id=${record.id}`,"PATCH",{revision:record.revision,notes:"QA saved"},owner)).status,200);
  assert.equal((await call(`/api/admin/requests?id=${record.id}`,"PATCH",{revision:record.revision,notes:"QA stale"},owner)).status,409);
  const updated=(await (await call("/api/admin/requests","GET",undefined,owner)).json()).find(r=>r.id===record.id);
  const archived=await call(`/api/admin/requests?id=${record.id}`,"DELETE",{revision:updated.revision},owner);assert.equal(archived.status,200);const archiveBody=await archived.json();assert.equal(archiveBody.archived,true);
  assert.equal((await call(`/api/admin/requests?id=${record.id}`,"PATCH",{revision:archiveBody.revision,archived:false},owner)).status,200);
  console.log(`PASS: ${concurrency} simultaneous submissions, no lost records, stale edits rejected, archive/restore and forbidden edits checked`);
  const base=await (await call("/api/admin/content","GET",undefined,owner)).json();
  const first=await call("/api/admin/content","PUT",{...base,_base:base,ratingDate:"QA observed"},owner);assert.equal(first.status,200);
  const second=await call("/api/admin/content","PUT",{...base,_base:base,reviewCount:146},owner);assert.equal(second.status,200);
  const merged=await second.json();assert.equal(merged.ratingDate,"QA observed");assert.equal(merged.reviewCount,146);
  assert.equal((await call("/api/admin/content","PUT",{...base,_base:base,ratingDate:"QA overwritten"},owner)).status,409);
  console.log("PASS: independent CMS edits merge, same-section conflict rejected");
  const contactBase=await (await call("/api/admin/content","GET",undefined,owner)).json();const hiddenId=contactBase.contacts[0].id;contactBase.contacts[0].published=false;assert.equal((await call("/api/admin/content","PUT",contactBase,owner)).status,200);const liveContacts=await (await call("/api/contacts")).json();assert.equal(liveContacts.length,9);assert.ok(liveContacts.every(c=>c.id!==hiddenId));
  const media=new FormData();media.append("media",new Blob([await readFile(path.join(frontend,"public/images/brand/mbi-laser.png"))],{type:"image/png"}),"qa-logo.png");
  const uploaded=await fetch(origin+"/api/admin/media",{method:"POST",headers:{Origin:origin,Cookie:owner},body:media});assert.equal(uploaded.status,200);const asset=await uploaded.json();
  const full=await call(asset.url);assert.equal(full.status,200);assert.equal(full.headers.get("content-type"),"image/png");
  const ranged=await fetch(origin+asset.url,{headers:{Range:"bytes=0-7"}});assert.equal(ranged.status,206);assert.equal((await ranged.arrayBuffer()).byteLength,8);
  const invalid=new FormData();invalid.append("media",new Blob(["<script>bad</script>"],{type:"image/png"}),"bad.png");assert.equal((await fetch(origin+"/api/admin/media",{method:"POST",headers:{Origin:origin,Cookie:owner},body:invalid})).status,400);
  console.log("PASS: persistent media, range responses, invalid upload rejection");
  const latest=await (await call("/api/admin/content","GET",undefined,owner)).json();latest.heroSlides[0]={...latest.heroSlides[0],type:"video",media:"/media/00000000-0000-0000-0000-000000000000.mp4",poster:asset.url};
  assert.equal((await call("/api/admin/content","PUT",latest,owner)).status,200);
  const homepage=await (await call("/")).text();assert.ok(homepage.includes("<video"));assert.ok(homepage.indexOf('id="pilih-divisi"')>homepage.indexOf('id="location-heading"'));assert.ok(!homepage.includes("footer-divisions-grid"));
  const article=await call("/informasi/panduan-request-laser-cutting-bekasi");const html=await article.text();assert.ok(html.includes('property="og:image"'));assert.ok(html.includes('name="twitter:card"'));
  console.log("PASS: hero video CMS, divisions at page bottom, article social metadata");
  records=await (await call("/api/admin/requests","GET",undefined,owner)).json();const invoice={number:"QA-INV-001",issuedAt:"2026-10-10",dueAt:"",notes:"QA test only",lines:[{description:"Laser cutting — plat 2 mm",quantity:3,unit:"Lembar",price:125000}]};
  const saved=await call(`/api/admin/requests?id=${records[0].id}`,"PATCH",{revision:records[0].revision,invoice},owner);assert.equal(saved.status,200);const invoiceRecord=await saved.json();assert.equal(invoiceRecord.invoice.lines[0].price,125000);
  const compiled=ts.transpileModule(await readFile(path.join(frontend,"src/lib/invoicePdf.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const modulePath=path.join(directory,"invoicePdf.mjs");await writeFile(modulePath,compiled);const {invoicePdf}=await import(pathToFileURL(modulePath));const originalFetch=globalThis.fetch;globalThis.fetch=(url,...rest)=>originalFetch(url==="/fonts/NotoSans-Regular.ttf"?origin+url:url,...rest);const bytes=await invoicePdf(invoiceRecord,invoice);await writeFile(path.join(directory,"qa-invoice.pdf"),bytes);globalThis.fetch=originalFetch;
  console.log("PASS: invoice persists and PDF generated");
  await writeFile(path.join(directory,"results.json"),JSON.stringify({passed:true,records:5+concurrency,invoice:"qa-invoice.pdf"}));console.log(`QA artifacts: ${directory}`);
}catch(e){console.error(e.message);console.error(logs.slice(-3000));process.exitCode=1;}finally{server.kill();}
