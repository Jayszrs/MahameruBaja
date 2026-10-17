// Component/event adapters only. No browser, live CMS or Blob writes.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import postcss from 'postcss';
import { harness } from './test-readability-revision.mjs';

const slugs=['retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection'];
const names=['Mahameru Baja','Garuda Marginal Baja','MBI Trading','MBI Laser Cutting & Bending','MBI Project Fabrikasi & Erection'];
const records=slugs.map((slug,i)=>({
  id:`test-${i}`,slug,name:names[i],revision:3,status:'active',label:`Divisi ${i+1}`,area:'Bekasi',
  kind:i<3?'material':'service',logo:`/images/test-logo-${i}.png`,title:'Judul awal',intro:'Pengantar',
  description:'Profil awal',mission:'Misi',aboutHeadline:'Tentang',values:[],hero:'',images:[],offerings:[],
  offeringDescriptions:{},process:[],faq:[],address:'Bekasi',mapsUrl:'',mapEmbed:'',useCentralReviews:false,
  primary:{label:'Lihat produk',href:`/unit/${slug}/produk`},quote:'',admins:[],createdAt:'',updatedAt:''
}));
let identity={role:'super_admin',division:null}, canDiscard=true, state, refreshed=0;
const workspace={confirmDiscard:async()=>canDiscard,refreshDashboard:()=>refreshed++};
const imports={
  './AdminIdentity':{useAdminIdentity:()=>identity},
  './AdminWorkspace':{useAdminWorkspace:options=>{state=options;return workspace;}},
  '../data/serviceDescriptions':{serviceDescription:()=> 'Penjelasan layanan'},
  '../data/articleCms':{articleSlug:name=>name.toLowerCase().replaceAll(' ','-')},
};
const mount=()=>harness('src/components/DivisionEditor.tsx',{initialDivisions:identity.role==='super_admin'?records:[records[1]]},false,{imports});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const picker=(editor,index)=>editor.find(node=>node.type==='button'&&node.key===records[index].id);
const tab=(editor,name)=>editor.find(node=>node.type==='button'&&node.key===name&&node.props['aria-controls']==='division-profile-fields');
const heading=editor=>editor.find(node=>node.props?.className==='division-profile-identity').props.children[1].props.children[1].props.children;
const editor=await mount();
assert.ok(editor.absent(node=>node.props?.['aria-pressed']===true));
canDiscard=false;picker(editor,0).props.onClick();await flush();assert.ok(editor.absent(node=>node.props?.className==='division-profile-heading'));
canDiscard=true;
for(let i=0;i<records.length;i++) {
  picker(editor,i).props.onClick();await flush();
  assert.equal(heading(editor),records[i].name);assert.equal(picker(editor,i).props['aria-pressed'],true);
  assert.equal(editor.find(node=>node.props?.href===`/unit/${slugs[i]}`).props.target,'_blank');
  assert.ok(tab(editor,'identity').props['aria-pressed']);
}
picker(editor,1).props.onClick();await flush();
const editedName='Nama Garuda diperbarui';
editor.find(node=>node.type==='input'&&node.props.value===records[1].name).props.onChange({target:{value:editedName}});
tab(editor,'profile').props.onClick();editor.render();assert.equal(heading(editor),editedName);assert.ok(state.dirty);
tab(editor,'media').props.onClick();editor.render();assert.ok(tab(editor,'media').props['aria-pressed']);
tab(editor,'contact').props.onClick();editor.render();assert.ok(editor.find(node=>node.props?.href==='/admin/konten?tab=contacts'));
canDiscard=false;picker(editor,0).props.onClick();await flush();assert.equal(heading(editor),editedName,'Discard rejection keeps the current draft');
const originalFetch=globalThis.fetch;let savedInput;
try {
  globalThis.fetch=async(url,options)=>{
    assert.equal(url,'/api/admin/divisions/test-1');assert.equal(options.method,'PUT');
    savedInput=JSON.parse(options.body);
    return {ok:true,json:async()=>({...records[1],...savedInput,revision:4})};
  };
  state.onSave();await flush();editor.render();
  assert.equal(savedInput.name,editedName);assert.equal(savedInput.revision,3);assert.equal(savedInput.slug,slugs[1]);
  assert.equal(state.dirty,false);assert.equal(state.busy,false);assert.equal(refreshed,1);
} finally {globalThis.fetch=originalFetch;}
editor.find(node=>node.props?.name==='division-search').props.onChange({target:{value:'no-match'}});
assert.ok(editor.find(node=>node.props?.className==='admin-inline-empty'));
editor.dispose();
identity={role:'division_admin',division:slugs[1]};
const own=await mount();assert.equal(heading(own),records[1].name);
assert.ok(own.absent(node=>node.props?.className?.includes('division-picker')),'Division admin has no other-division picker');
assert.ok(own.absent(node=>node.props?.className==='division-more-actions'),'Super-admin actions remain hidden');
assert.ok(own.find(node=>node.props?.href===`/unit/${slugs[1]}`));own.dispose();
console.log('PASS: all five division buttons, selected state, four section controls, website links, discard guard, save revision and division-role UI (adapters)');

const css=postcss.parse(await readFile(new URL('../src/experience-revision.css',import.meta.url),'utf8'));
function has(selector,property,value) {let found=false;css.walkRules(rule=>{if(rule.selector===selector)rule.walkDecls(property,decl=>{if(decl.value===value)found=true;});});assert.ok(found,`${selector} ${property}: ${value}`);}
has('.admin-shell :is(.admin-primary,.admin-secondary,.admin-danger)','min-height','44px');
has('.admin-shell :is(.admin-primary,.admin-secondary,.admin-danger)','font-size','14px');
has('.division-editor .admin-profile-tabs button','white-space','normal');
has('.division-picker-options','overflow-x','auto');
has('.division-picker-options','scrollbar-width','none');
console.log('PASS: 44px action targets, readable button labels, wrapping section titles and native mobile scrolling (CSS checks, not visual QA)');
