// Actual component events with hook adapters, not browser/visual verification.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {load} from './test-experience-revision.mjs';
import {harness} from './test-readability-revision.mjs';
const data=name=>load(fileURLToPath(new URL(`../src/data/${name}.ts`,import.meta.url)));
const {textPages,normalizeWebsiteText}=data('websiteTexts');
const choices=data('websiteTextChoices');const {contentOwner}=data('divisionCms');
const catalog=JSON.parse(await readFile(new URL('../src/data/websiteTextCatalog.json',import.meta.url),'utf8'));
const source='Punya gambar struktur atau komponen';assert.ok(catalog.some(row=>row.source===source),'Actual supplied hero phrase is in the editor');
const slugs=['retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection'];
const divisions=slugs.map(slug=>({slug,name:slug,title:'Judul khusus '+slug,label:'Label',area:'Bekasi',intro:'Pengantar',description:'Profil',mission:'Misi',aboutHeadline:'Tentang',address:'Alamat',values:[],offerings:[],process:[],faq:[],offeringDescriptions:{}}));
let actor={role:'super_admin',division:null},workspace,nextId=0,refresh=0;
const initial={revision:0,websiteTexts:[],heroSlides:[]};
const options={imports:{
  './AdminIdentity':{useAdminIdentity:()=>actor},'./DivisionDirectory':{useDivisionDirectory:()=>({divisions})},
  './AdminWorkspace':{useAdminWorkspace:value=>{workspace=value;return {refreshDashboard(){refresh++;}};}},
  '../data/websiteTextChoices':choices,'../data/websiteTexts':{textPages,normalizeWebsiteText},
  '../data/divisionCms':{contentOwner},'../data/socialMedia':{contentId:()=>`qa-text-${++nextId}`},
  '../data/websiteTextCatalog.json':{__esModule:true,default:catalog},
}};
const oldFetch=globalThis.fetch;let requestBody,deny=false;
try {
  globalThis.fetch=async(url,request)=>{assert.equal(url,'/api/admin/content');requestBody=JSON.parse(request.body);const {_base,...saved}=requestBody;return {ok:!deny,json:async()=>deny?{message:'Konflik QA'}:{...saved,revision:saved.revision+1}};};
  for(const slug of [null,...slugs]) {
    actor={role:slug?'division_admin':'super_admin',division:slug};
    const editor=await harness('src/components/WebsiteTextEditor.tsx',{initialContent:structuredClone(initial)},false,options);
    editor.find(node=>node.props?.name==='copy-search').props.onChange({target:{value:source}});
    const textarea=editor.find(node=>node.type==='textarea'&&node.props.value===source);
    textarea.props.onChange({target:{value:`Judul QA ${slug || 'main'}`}});editor.render();assert.ok(workspace.dirty);
    await workspace.onSave();editor.render();
    assert.equal(requestBody.websiteTexts[0].ownerDivision,slug);assert.equal(requestBody.websiteTexts[0].page,'home');assert.equal(requestBody.websiteTexts[0].source,source);
    assert.ok(!workspace.dirty);assert.equal(editor.find(node=>node.props?.name==='copy-site').props.disabled,Boolean(slug));
    editor.find(node=>node.type==='textarea'&&node.props.value.startsWith('Judul QA')).props.onChange({target:{value:'Perubahan belum disimpan'}});
    deny=true;await workspace.onSave();editor.render();assert.ok(workspace.dirty);assert.ok(editor.find(node=>node.props?.role==='alert'));deny=false;
    editor.find(node=>node.type==='button'&&node.props.children==='Kembalikan tulisan bawaan').props.onClick();editor.render();await workspace.onSave();
    assert.equal(requestBody.websiteTexts.length,0,'Reset removes only this replacement');editor.dispose();
  }
} finally {globalThis.fetch=oldFetch;}
assert.equal(refresh,12);
console.log('PASS: direct hero-copy edit/search/save/reset, conflicts preserve drafts and website scope is locked for all five divisions (adapters)');
const {savedReviewSnapshots,restoreSnapshotReviews,missingSnapshotReviews}=data('reviewRecovery');
assert.equal(savedReviewSnapshots.main.reviews.length,35);assert.equal(savedReviewSnapshots.garuda.reviews.length,3);
const first=savedReviewSnapshots.main.reviews[0];const custom={...savedReviewSnapshots.main,reviews:[{...first,text:'Curated existing text',published:false}]};
const restored=restoreSnapshotReviews(custom,savedReviewSnapshots.main);
assert.equal(restored.reviews.length,35);assert.equal(restored.reviews[0].text,'Curated existing text');assert.equal(restored.reviews[0].published,false);assert.equal(missingSnapshotReviews(restored,savedReviewSnapshots.main).length,0);
const duplicate={...savedReviewSnapshots.garuda,reviews:[{...savedReviewSnapshots.garuda.reviews[0],id:'different-old-id'}]};
assert.equal(restoreSnapshotReviews(duplicate,savedReviewSnapshots.garuda).reviews.length,3,'Author/text duplicates are not re-added');
console.log('PASS: verified 35/3 review snapshots, duplicate prevention, preservation of curated and unpublished rows, idempotent restoration');

const storage=new Map();const previousStorage=globalThis.localStorage,previousMedia=globalThis.matchMedia;
try {
  globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
  globalThis.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
  const nav=data('adminNavigation');
  const shell=await harness('src/components/AdminShell.tsx',{children:'Workspace'},false,{imports:{
    './AdminIdentity':{useAdminIdentity:()=>({name:'Fixture admin',role:'super_admin',mustChangePassword:false})},
    './DivisionDirectory':{useDivisionDirectory:()=>({divisions})},
    'next/navigation':{usePathname:()=>'/admin/teks',useSearchParams:()=>new URLSearchParams(),useRouter:()=>({replace(){},refresh(){}})},
    'nextjs-nav-guard':{useNavigationGuard(){}},'../data/adminNavigation':nav,
    './AdminWorkspace':{AdminWorkspaceContext:{Provider:'context-provider'},emptyAdminWorkspace:{dirty:false,busy:false}},
  }});
  const toggle=()=>shell.find(node=>node.props?.className==='admin-secondary admin-wide-toggle');
  assert.equal(toggle().props['aria-pressed'],false);toggle().props.onClick();
  assert.equal(toggle().props['aria-pressed'],true);assert.equal(shell.find(node=>node.type==='aside').props.inert,true);assert.equal(shell.find(node=>node.type==='aside').props['aria-hidden'],true);
  assert.equal(storage.get('mahameru.admin.wide.v1'),'true');toggle().props.onClick();assert.equal(shell.find(node=>node.type==='aside').props.inert,false);shell.dispose();
}finally{globalThis.localStorage=previousStorage;globalThis.matchMedia=previousMedia;}
console.log('PASS: wider-workspace toggle hides/restores the menu, removes hidden navigation from keyboard access and saves the layout preference (adapters)');
