// Actual component handlers with hook adapters. Not a browser/viewport audit.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';
import {load} from './test-experience-revision.mjs';
import {harness} from './test-readability-revision.mjs';
const source=name=>fileURLToPath(new URL(`../src/${name}`,import.meta.url));
const partners=load(source('data/partnerLogos.ts'));
const {assetUrl,contentOwner}=load(source('data/divisionCms.ts'));
const {validateUploadFile}=load(source('lib/cmsUpload.ts'));
assert.equal(partners.defaultPartnerLogos.length,23);
assert.deepEqual(partners.partnerLogoListSchema.parse([]),[]);
const shared=partners.defaultPartnerLogos[0], own={...shared,id:'own',ownerDivision:'retail-tambun'};
assert.equal(partners.partnerLogosForSite([shared,own]).length,1);
assert.equal(partners.partnerLogosForSite([shared,own],'retail-tambun').length,2);
assert.equal(partners.partnerLogosForSite([shared,own],'retail-cibitung').length,1);
assert.equal(partners.partnerLogosForSite([{...shared,audience:[]}],'retail-cibitung').length,0);
assert.equal(partners.partnerLogosForSite([{...shared,published:false}]).length,0);
assert(!partners.partnerLogoListSchema.safeParse([shared,shared]).success);
for(const logo of ['javascript:alert(1)','//external.example/logo.png',''])assert(!partners.partnerLogoSchema.safeParse({...shared,logo}).success);
assert(partners.partnerLogoSchema.safeParse({...shared,logo:'',published:false}).success);
const mixed=[shared,{...shared,id:'client',kind:'client'},{...shared,id:'second'}];
assert.deepEqual(partners.movePartnerLogo(mixed,'second',-1).map(row=>row.id),['second','client',shared.id]);
assert.equal(mixed[0],shared,'Reorder is immutable');
let actor,view,workspace,sequence=0,saved,deny=false,calls=0,uploadOwner;
const originalFetch=globalThis.fetch;
const imports={
  './AdminIdentity':{useAdminIdentity:()=>actor},
  './AdminWorkspace':{useAdminView:()=>[view,value=>{view=value;}],useAdminWorkspace:value=>{workspace=value;return{refreshDashboard(){}};}},
  '../data/divisionCms':{assetUrl,contentOwner},
  '../data/partnerLogos':partners,'../data/socialMedia':{contentId:()=>`fixture-${++sequence}`},
  '../lib/cmsUpload':{imageUploadHelp:'JPG, PNG, WebP',uploadCmsFile:async(file,kind,owner)=>{validateUploadFile(file,kind);assert.equal(kind,'image');uploadOwner=owner;return '/images/brand/mbi-laser.png';}},
};
function contains(node,predicate){return !!node&&typeof node==='object'&&(predicate(node)||[node.props?.children].flat(Infinity).some(child=>contains(child,predicate)));}
const text=node=>[node.props?.children].flat(Infinity).filter(v=>typeof v==='string').join('');
const record=(editor,id)=>editor.find(node=>node.props?.className==='editor-panel partner-editor-record'&&contains(node,n=>n.props?.name===`partner-name-${id}`));
function action(editor,id,label){let found;contains(record(editor,id),node=>{if(node.type==='button'&&text(node)===label)found=node;return false;});assert(found,label);found.props.onClick();editor.render();}
try {
  globalThis.fetch=async(url,request)=>{assert.equal(url,'/api/admin/content');calls++;saved=JSON.parse(request.body);assert(saved._base);return{ok:!deny,json:async()=>deny?{message:'Konflik QA'}:{...saved,revision:saved.revision+1}};};
  for(const division of [null,'retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection']) {
    actor={role:division?'division_admin':'super_admin',division};view='suppliers';
    const initial={revision:0,partnerLogos:[{...shared,ownerDivision:division}]};
    const editor=await harness('src/components/PartnerLogoEditor.tsx',{initialContent:initial},false,{imports});
    editor.find(node=>node.type==='button'&&text(node)==='+ Tambah logo').props.onClick();editor.render();const id=`fixture-${sequence}`;
    const publish=()=>editor.find(node=>node.props?.name===`partner-published-${id}`);
    publish().props.onChange({target:{checked:true}});editor.render();const before=calls;await workspace.onSave();assert.equal(calls,before);assert(editor.find(node=>node.props?.role==='alert'));
    editor.find(node=>node.props?.name===`partner-name-${id}`).props.onChange({target:{value:'Supplier uji'}});editor.render();
    const chooser=editor.find(node=>node.props?.name===`partner-upload-${id}`);
    const input={files:[new File(['image'],'logo.png',{type:'image/png'})],value:'chosen'};chooser.props.onChange({currentTarget:input});assert.equal(input.value,'');await new Promise(resolve=>setImmediate(resolve));editor.render();
    assert.equal(uploadOwner,division);assert.equal(editor.find(node=>node.props?.name===`partner-url-${id}`).props.value,'/images/brand/mbi-laser.png');
    action(editor,id,'Naik');await workspace.onSave();editor.render();assert.equal(saved.partnerLogos[0].id,id);assert.equal(workspace.dirty,false);
    editor.find(node=>node.props?.name===`partner-name-${id}`).props.onChange({target:{value:'Perubahan belum tersimpan'}});editor.render();deny=true;await workspace.onSave();deny=false;
    assert.equal(workspace.dirty,true);assert.equal(editor.find(node=>node.props?.name===`partner-name-${id}`).props.value,'Perubahan belum tersimpan');
    editor.find(node=>node.props?.name===`partner-url-${id}`).props.onChange({target:{value:'javascript:alert(1)'}});editor.render();const invalidCalls=calls;await workspace.onSave();assert.equal(calls,invalidCalls);
    editor.find(node=>node.props?.name===`partner-url-${id}`).props.onChange({target:{value:'https://media.example.test/logo.webp'}});editor.render();await workspace.onSave();assert.equal(saved.partnerLogos[0].logo,'https://media.example.test/logo.webp');
    chooser.props.onChange({currentTarget:{files:[new File(['bad'],'logo.svg',{type:'image/svg+xml'})],value:'chosen'}});await new Promise(resolve=>setImmediate(resolve));editor.render();assert.equal(editor.find(node=>node.props?.name===`partner-url-${id}`).props.value,'https://media.example.test/logo.webp');
    action(editor,id,'Hapus');action(editor,id,'Batal');assert(record(editor,id));action(editor,id,'Hapus');action(editor,id,'Ya, hapus');await workspace.onSave();assert(!saved.partnerLogos.some(row=>row.id===id));
    editor.find(node=>node.props?.label==='Jenis logo').props.onChange('clients');editor.render();editor.find(node=>node.type==='button'&&text(node)==='+ Tambah logo').props.onClick();editor.render();await workspace.onSave();assert(saved.partnerLogos.some(row=>row.kind==='client'&&!row.published&&row.ownerDivision===division));editor.dispose();
  }
} finally {globalThis.fetch=originalFetch;}
const css=postcss.parse(await readFile(source('experience-revision.css'),'utf8'));
function declaration(selector,key,value){let found=false;css.walkRules(rule=>{if(rule.selector===selector)rule.walkDecls(key,d=>{if(d.value===value)found=true;});});assert(found,`${selector} ${key}:${value}`);}
declaration('.contact-directory .directory-card','background','transparent');
declaration('.contact-directory .directory-card .directory-portrait','background','transparent');
declaration('.public-site .partner-logo-strip :is(figure,.home-client-logo,.home-client-logo:last-child)','background','transparent');
declaration('.public-site .partner-logo-strip :is(img,svg)','mix-blend-mode','multiply');
declaration('.poster-welcome','max-height','92vh');
assert(!(await readFile(source('components/WelcomePosters.tsx'),'utf8')).includes('poster-autoplay'));
console.log('PASS: partner schema/legacy seeds/empty lists/scope/order; six real editor handler scopes, upload/link/invalid-file retention/publish validation/save/conflict/delete/cancel/client creation; unboxed contacts/logos and viewport fallbacks (adapters/CSS)');
