import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { safeHttpsUrl, safeInternalLink, safeLocalAsset, isPublicBlobUrl } from "../src/data/safeUrls";
import { articleInputSchema, safeArticleImage, safeArticleLink } from "../src/data/articleCms";
import { contactVisibleInDivision, defaultSiteContent, siteContentSchema, type TeamContact } from "../src/data/siteContent";
import { articles } from "../src/data/articles";
import { validateUploadFile, uploadCmsFile } from "../src/lib/cmsUpload";

async function main() {
assert(!process.env.BLOB_READ_WRITE_TOKEN, "Run this check without a real Blob token.");
const directory = await mkdtemp(path.join(os.tmpdir(), "mahameru-scoped-security-"));
process.env.CMS_DATA_DIR = directory;
let checks = 0;
function same(actual: unknown, expected: unknown, label: string) { assert.deepEqual(actual,expected,label); checks++; }
try {
  const internal: Array<[string,boolean]> = [
    ["/",true], ["/unit/retail-tambun?view=all#kontak",true], ["#pilih-divisi",true], ["/produk?q=plat%20hitam",true],
    ["//evil.example",false], ["/\\evil.example",false], ["/%5cevil.example",false], ["/%2f%2fevil.example",false],
    ["/%252f%252fevil.example",false], ["/%255cevil.example",false], ["/\tevil.example",false], ["/\nevil.example",false],
    ["https://evil.example",false], ["javascript:alert(1)",false], ["../admin",false], ["/bad%zz",false],
  ];
  for(const [url,expected] of internal) same(safeInternalLink(url),expected,`internal ${JSON.stringify(url)}`);
  for(const url of ["/\\evil.example", "/%5cevil.example", "//evil.example", "javascript:alert(1)", "data:text/html,test"])
    same(safeArticleLink(url),false,`article rejects ${JSON.stringify(url)}`);
  for(const url of ["/informasi/panduan", "#bagian", "https://example.test/read", "mailto:info@example.test"])
    same(safeArticleLink(url),true,`article accepts ${url}`);
  same(safeHttpsUrl("https://example.test/photo.jpg"),true,"HTTPS asset");
  for(const url of ["http://example.test/photo.jpg", "https://user:secret@example.test/photo.jpg", "https://example.test\\evil", "https://example.test/\nphoto.jpg"])
    same(safeHttpsUrl(url),false,`unsafe HTTPS asset ${JSON.stringify(url)}`);
  same(isPublicBlobUrl("https://store.public.blob.vercel-storage.com/photo.jpg"),true,"actual public Blob host");
  same(isPublicBlobUrl("https://evil.test/.public.blob.vercel-storage.com/photo.jpg"),false,"Blob substring in pathname");
  same(isPublicBlobUrl("https://store.public.blob.vercel-storage.com.evil.test/photo.jpg"),false,"Blob hostname suffix spoof");
  for(const url of ["/images/../api/admin/content", "/images/./photo.jpg", "/images//photo.jpg", "/images/%2e%2e/photo.jpg"])
    same(safeLocalAsset(url,["images"]),false,`unsafe local asset ${url}`);
  same(safeLocalAsset("/images/compro/photo-01.webp",["images"]),true,"local image");
  same(safeArticleImage("/api/cms/media/12345678-1234-1234-1234-123456789012.jpg"),true,"managed image compatibility");

  const parsed = siteContentSchema.parse(defaultSiteContent);
  function urls(value: unknown, prefix = ""): Array<[string,string]> {
    if(typeof value === "string") return /^(?:https:\/\/|\/)/.test(value) ? [[prefix,value]] : [];
    if(value && typeof value === "object") return Object.entries(value).flatMap(([key,item])=>urls(item,`${prefix}/${key}`));
    return [];
  }
  same(urls(parsed).sort(),urls(defaultSiteContent).sort(),"all existing CMS asset and destination URLs retained");
  for(const article of articles) {
    const next = articleInputSchema.parse({...article,imageAlt:article.imageAlt || article.title,status:"published"});
    same([next.title,next.slug,next.content,next.image],[article.title,article.slug,article.content,article.image],`legacy article ${article.slug}`);
  }

  const contact = (id: string, extra: Partial<TeamContact>): TeamContact => ({id,name:id,role:"Admin",phone:"",mobile:"",whatsapp:"6281234567890",email:"",photo:"",divisions:[],published:true,...extra});
  const cross = contact("cross-owner-a",{ownerDivision:"retail-tambun",divisions:["retail-tambun"],audience:["retail-cibitung"]});
  const hidden = contact("hidden-a",{ownerDivision:"retail-tambun",divisions:["retail-tambun"],audience:[]});
  const center = contact("center",{ownerDivision:null});
  const own = contact("own-b",{ownerDivision:"retail-cibitung",divisions:["retail-cibitung"]});
  same(contactVisibleInDivision(cross,"retail-cibitung"),true,"audience overrides legacy target");
  same(contactVisibleInDivision(cross,"retail-tambun"),false,"owner does not override explicit audience");
  same(contactVisibleInDivision(hidden,"retail-tambun"),false,"explicit empty audience hides division PIC");
  same(contactVisibleInDivision(center,"retail-cibitung"),true,"unassigned central contact retains global visibility");
  same(contactVisibleInDivision(contact("owned-unassigned",{ownerDivision:"retail-tambun"}),"retail-cibitung"),false,"owned unassigned contact stays own division");

  const {readDivisions,readPublicDivisions} = await import("../src/lib/divisionStore");
  const {GET:publicContacts} = await import("../app/api/contacts/route");
  const divisions = await readDivisions();
  for(const division of divisions) same(division.status,"active",`legacy division ${division.slug} still active`);
  await writeFile(path.join(directory,"divisions.json"),JSON.stringify(divisions));
  const content = {...parsed,contacts:[cross,hidden,center,own,contact("draft-b",{ownerDivision:"retail-cibitung",divisions:["retail-cibitung"],published:false})]};
  await writeFile(path.join(directory,"site-content.json"),JSON.stringify(content));
  let publicDivisions = await readPublicDivisions();
  same(publicDivisions.find(d=>d.slug==="retail-cibitung")?.admins.map(a=>a.name),[cross.name,center.name,own.name],"active public PIC applies audience and publication");
  same(publicDivisions.find(d=>d.slug==="retail-tambun")?.admins.map(a=>a.name),[center.name],"source assignment cannot override audience");
  let publicRows = await (await publicContacts()).json();
  same(publicRows.find((c:TeamContact)=>c.id===cross.id)?.divisions,["retail-cibitung"],"contact API resolves audience");
  same(publicRows.find((c:TeamContact)=>c.id===center.id)?.divisions,[],"contact API retains generic central WhatsApp option");
  same(publicRows.some((c:TeamContact)=>c.id===hidden.id),false,"contact API omits explicit empty audience");

  await writeFile(path.join(directory,"divisions.json"),JSON.stringify(divisions.map(d=>d.slug==="retail-tambun"?{...d,status:"archived"}:d)));
  publicDivisions = await readPublicDivisions();
  same(publicDivisions.some(d=>d.slug==="retail-tambun"),false,"archived division is absent");
  same(publicDivisions.find(d=>d.slug==="retail-cibitung")?.admins.map(a=>a.name),[center.name,own.name],"archived owner's cross-targeted PIC is removed");
  publicRows = await (await publicContacts()).json();
  same(publicRows.some((c:TeamContact)=>c.id===cross.id),false,"archived owner's contact absent from public API");
  await writeFile(path.join(directory,"divisions.json"),JSON.stringify(divisions));
  same((await readPublicDivisions()).find(d=>d.slug==="retail-cibitung")?.admins.some(a=>a.name===cross.name),true,"restored owner returns eligible PIC");

  for(const [file,kind] of [[new File(["x"],"wrong.mp4",{type:"video/mp4"}),"image"],[new File(["x"],"wrong.png",{type:"image/png"}),"video"],[new File([new Uint8Array(4_000_001)],"large.png",{type:"image/png"}),"image"],[new File([],"empty.png",{type:"image/png"}),"image"]] as const) {
    assert.throws(()=>validateUploadFile(file,kind)); checks++;
  }
  const originalFetch = globalThis.fetch;
  const previousVideoLimit = process.env.NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES;
  try {
    process.env.NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES = "4000000";
    assert.throws(() => validateUploadFile(new File([new Uint8Array(4_000_001)], "large.mp4", {type:"video/mp4"}), "video")); checks++;
    validateUploadFile(new File([new Uint8Array(4_000_000)], "boundary.mp4", {type:"video/mp4"}), "video"); checks++;
    process.env.NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES = "30000000";
    validateUploadFile(new File([new Uint8Array(4_000_001)], "local.mp4", {type:"video/mp4"}), "video"); checks++;
  } finally {
    if (previousVideoLimit === undefined) delete process.env.NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES;
    else process.env.NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES = previousVideoLimit;
  }
  try {
    for(const kind of ["image","video"] as const) {
      const file = new File(["fixture"],kind==="image"?"photo.png":"video.mp4",{type:kind==="image"?"image/png":"video/mp4"});
      globalThis.fetch = async (_input,init) => {
        same((init?.body as FormData).get("kind"),kind,`upload declares ${kind}`);
        return Response.json({url:"/api/cms/media/fixture",type:kind});
      };
      same(await uploadCmsFile(file,kind,"retail-tambun"),"/api/cms/media/fixture",`upload accepts ${kind} response`);
      globalThis.fetch = async () => Response.json({url:"/api/cms/media/fixture",type:kind==="image"?"video":"image"});
      await assert.rejects(uploadCmsFile(file,kind,"retail-tambun")); checks++;
    }
  } finally {globalThis.fetch = originalFetch;}
  console.log(`Scoped security: ${checks} checks passed (URLs, legacy data, PIC audience/archive, upload type/limits).`);
} finally {
  await rm(directory,{recursive:true,force:true});
}
}
void main().catch(error => {console.error(error);process.exitCode = 1;});
