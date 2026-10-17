// Pure component/data tests, not a browser click-through. No live Blob access.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();
export function load(file) {
  file = path.resolve(file); if (modules.has(file)) return modules.get(file).exports;
  const module = {exports:{}}; modules.set(file,module);
  const localRequire = name => {
    if (name === 'next/navigation') return {usePathname:()=>'/'};
    if (!name.startsWith('.')) return require(name);
    return load(path.resolve(path.dirname(file),name + (fs.existsSync(path.resolve(path.dirname(file),name+'.ts'))?'.ts':'.tsx')));
  };
  const output = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',output)(localRequire,module,module.exports); return module.exports;
}
const {livePopupPosters,posterDetails,posterPeriod,promotionProviderSlug,posterContactMatches} = load(path.join(frontend,'src/data/popupPosters.ts'));
const {clientPosters} = load(path.join(frontend,'src/data/clientPosters.ts'));
const {promotionSchema} = load(path.join(frontend,'src/data/promotions.ts'));
assert.equal(clientPosters.length,4);
for (const poster of clientPosters) assert.ok(promotionSchema.safeParse(poster).success);
for (const slug of [undefined,'retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection']) assert.equal(livePopupPosters(clientPosters,'2026-10-17',slug).length,4);
assert.equal(livePopupPosters(clientPosters,'2026-11-01').length,3,'October promotion expires');
assert.equal(livePopupPosters(clientPosters.map(row=>({...row,published:false})),'2026-10-17').length,0);
assert.equal(livePopupPosters(clientPosters.map(row=>({...row,audience:['retail-tambun']})),'2026-10-17','retail-cibitung').length,0,'Audience isolation');
assert.ok(clientPosters.every(row=>row.showInBanner === true),'The same popup posters also appear in the homepage banner ribbon');
const React = require('react'); const {renderToStaticMarkup} = require('react-dom/server');
const {translatePublicTree} = load(path.join(frontend,'src/components/PublicText.tsx'));
let called=false; const click=()=>{called=true;};
const node=React.createElement('a',{href:'/kontak',onClick:click},'Hubungi kami');
const translated=translatePublicTree(node,text=>text==='Hubungi kami'?'<script>hello</script>':text)[0];
assert.equal(translated.props.href,'/kontak'); assert.equal(translated.props.onClick,click); translated.props.onClick(); assert.ok(called);
assert.ok(renderToStaticMarkup(translated).includes('&lt;script&gt;hello&lt;/script&gt;'),'Replacement is escaped text, not HTML');
const input=translatePublicTree(React.createElement('input',{name:'name',value:'Hubungi kami',placeholder:'Hubungi kami',onChange:()=>{}}),()=> 'Tanya tim')[0];
assert.equal(input.props.value,'Hubungi kami'); assert.equal(input.props.name,'name'); assert.equal(input.props.placeholder,'Tanya tim');
const {websitePage}=load(path.join(frontend,'src/data/websiteTexts.ts'));
assert.equal(websitePage('/unit/retail-cibitung/layanan'),'services'); assert.equal(websitePage('/unit/retail-tambun'),'home');
const catalog=JSON.parse(fs.readFileSync(path.join(frontend,'src/data/websiteTextCatalog.json'),'utf8')); assert.ok(catalog.length>200); assert.equal(new Set(catalog.map(row=>row.source)).size,catalog.length);
const originalDirectory='C:/Users/jaela/Downloads/WhatsApp Unknown 2026-10-17 at 11.29.35';
const files=[['WhatsApp Image 2026-10-17 at 11.29.21 (1).jpeg','ring-cakar-sloof.jpeg'],['WhatsApp Image 2026-10-17 at 11.29.21 (2).jpeg','selamat-pagi.jpeg'],['WhatsApp Image 2026-10-17 at 11.29.21.jpeg','promo-hollow-oktober.jpeg'],['WhatsApp Image 2026-10-17 at 11.29.22.jpeg','jasa-laser-cutting.jpeg']];
for (const [original,copy] of files) if(fs.existsSync(path.join(originalDirectory,original))) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(originalDirectory,original))).digest('hex'),createHash('sha256').update(fs.readFileSync(path.join(frontend,'public/images/posters',copy))).digest('hex'));
console.log('PASS: four unedited client posters shared by popup and banner, date/publish/audience filters');
console.log('PASS: render-time text replacement escapes HTML and preserves links, handlers and form values; text catalog unique');
const {harness}=await import('./test-readability-revision.mjs');
const savedSession=new Map(); const storage={getItem:key=>savedSession.get(key)||null,setItem:(key,value)=>savedSession.set(key,value)};
const divisions=['retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection'].map(slug=>({slug,name:slug,status:'active',label:'Divisi',logo:'/images/logo.png',area:'Bekasi'}));
const contacts=divisions.map((d,i)=>({id:`contact-${i}`,name:`Tim ${d.slug}`,role:'Admin divisi',phone:'081234567890',whatsapp:'081234567890',mobile:'',divisions:[d.slug],published:true}));
assert.equal(posterDetails(clientPosters[0],divisions,contacts).division.slug,'retail-tambun');
assert.equal(posterDetails(clientPosters[3],divisions,contacts).division.slug,'laser-cutting');
assert.equal(posterDetails({...clientPosters[0],contactId:'contact-1'},divisions,contacts).contact,undefined,'Do not substitute a contact from another division');
assert.equal(posterDetails({...clientPosters[0],contactUnavailable:true},divisions,contacts).contact,undefined,'Redacted contact references do not silently select someone else');
assert.equal(posterDetails(clientPosters[0],divisions,contacts.map(c=>({...c,published:false}))).whatsappHref,'','Unpublished contacts are never displayed');
assert.equal(posterDetails(clientPosters[0],divisions,contacts.map(c=>({...c,audience:[]}))).contact,undefined,'Contact audience restrictions are respected');
assert.equal(posterDetails(clientPosters[0],divisions.filter(d=>d.slug!=='retail-tambun'),contacts).contact,undefined);
assert.ok(posterDetails(clientPosters[0],divisions,contacts).whatsappHref.startsWith('https://wa.me/6281234567890?text='));
assert.ok(posterPeriod(clientPosters[2]).includes('31 Oktober 2026'));
let publicPath='/';
const popupOptions={storage,imports:{'next/navigation':{usePathname:()=>publicPath},'../data/popupPosters':{livePopupPosters,posterDetails,posterPeriod}}};
const popup=await harness('src/components/WelcomePosters.tsx',{promotions:clientPosters,divisions,contacts},false,popupOptions);
let opened=0,closed=0;
popup.find(node=>node.type==='dialog').props.ref.current={showModal(){opened++;},close(){closed++;}};
popup.advance(699); assert.equal(opened,0); popup.advance(1); assert.equal(opened,1); assert.equal(popup.document.body.style.overflow,'hidden');
const currentPoster=()=>popup.find(node=>node.props?.className==='poster-welcome-image').props.children.props.src;
assert.equal(currentPoster(),clientPosters[0].image);
const posterLink=popup.find(node=>node.props?.className==='poster-welcome-image');
assert.equal(posterLink.props.href,clientPosters[0].ctaHref,'The poster itself opens its configured offer');
assert.ok(posterLink.props['aria-label'].includes(clientPosters[0].title));
assert.throws(()=>popup.find(node=>node.props?.className==='poster-welcome-header'),/Expected component element/,'No visible white-card header');
assert.throws(()=>popup.find(node=>node.props?.className==='poster-welcome-footer'),/Expected component element/,'No visible white-card footer');
const popupCss=fs.readFileSync(path.join(frontend,'src/experience-revision.css'),'utf8');
const dialogCss=/\.poster-welcome \{([^}]+)\}/.exec(popupCss)[1];
assert.match(dialogCss,/position:fixed/); assert.match(dialogCss,/inset:0/); assert.match(dialogCss,/margin:auto/); assert.match(dialogCss,/background:transparent/);
assert.match(dialogCss,/overflow:auto/,'Details scroll inside the viewport-constrained dialog');
assert.ok(popup.find(node=>node.props?.className==='poster-welcome-details'));
assert.ok(popup.find(node=>node.props?.className==='poster-contact-button').props.href.startsWith('https://wa.me/'));
assert.ok(popup.find(node=>node.type==='h2').props.children===clientPosters[0].title);
assert.match(popupCss,/\.poster-welcome-layout \{ grid-template-columns:minmax\(0,1fr\);/,'Mobile stacks artwork and readable details');
popup.find(node=>node.props?.['aria-label']==='Poster berikutnya').props.onClick(); popup.render(); assert.equal(currentPoster(),clientPosters[1].image);
popup.find(node=>node.type==='dialog').props.onCancel(); popup.render(); assert.equal(closed,1); assert.equal(popup.document.body.style.overflow,'');
publicPath='/tentang-kami';popup.render();popup.advance(1000);assert.equal(opened,1,'Same-document route navigation does not immediately reopen dismissed posters');popup.dispose();
const repeat=await harness('src/components/WelcomePosters.tsx',{promotions:clientPosters},false,popupOptions); repeat.find(node=>node.type==='dialog').props.ref.current={showModal(){opened++;},close(){}}; repeat.advance(1000); assert.equal(opened,2,'Reloading the document opens posters again without session-storage suppression'); repeat.dispose();publicPath='/';
console.log('PASS: popup delay, navigation, cancel, scroll restoration, same-document suppression and repeat on refresh (hook/dialog adapters)');
const beforePreview=savedSession.size;let previewClosed=0;
const preview=await harness('src/components/WelcomePosters.tsx',{promotions:[],preview:{...clientPosters[0],published:false},divisions,contacts,onPreviewClose:()=>previewClosed++},false,{...popupOptions,imports:{...popupOptions.imports,'next/navigation':{usePathname:()=>'/admin/promosi'}}});
assert.ok(preview.find(node=>node.props?.className==='poster-preview-label'));
preview.find(node=>node.props?.['aria-label']==='Tutup poster').props.onClick();assert.equal(previewClosed,1);assert.equal(savedSession.size,beforePreview);preview.dispose();
console.log('PASS: issuer/contact isolation, named WhatsApp action, readable details and draft preview without consuming visitor sessions (adapters)');
const {heroAnnouncementMessages,defaultAnnouncements,heroAnnouncementSchema}=load(path.join(frontend,'src/data/heroAnnouncements.ts'));
const announcement={id:'test-announcement',ownerDivision:'retail-tambun',messages:['Info material Tambun'],published:true};
assert.ok(heroAnnouncementSchema.safeParse(announcement).success);
assert.ok(!heroAnnouncementSchema.safeParse({...announcement,messages:['']}).success);
assert.deepEqual(heroAnnouncementMessages([],undefined),defaultAnnouncements);
assert.deepEqual(heroAnnouncementMessages([announcement],'retail-tambun'),announcement.messages);
assert.ok(!heroAnnouncementMessages([announcement],'retail-cibitung',['Pilihan Cibitung']).includes(announcement.messages[0]));
assert.deepEqual(heroAnnouncementMessages([{...announcement,published:false}],'retail-tambun'),[]);
const ticker=await harness('src/components/HeroAnnouncementTicker.tsx',{messages:['Info besi','Tanya promo']});
assert.equal(ticker.find(node=>node.props?.className==='hero-announcement-track').props.children.length,2);
assert.equal(ticker.find(node=>node.props?.className==='hero-announcement-group'&&node.key==='1').props['aria-hidden'],true);
ticker.find(node=>node.type==='button').props.onClick();assert.ok(ticker.find(node=>node.props?.className==='hero-announcement is-paused'));
ticker.find(node=>node.type==='button').props.onClick();ticker.hidden(true);assert.ok(ticker.find(node=>node.props?.className==='hero-announcement is-paused'));ticker.dispose();
const emptyTicker=await harness('src/components/HeroAnnouncementTicker.tsx',{messages:[]});assert.equal(emptyTicker.render(),null);emptyTicker.dispose();
assert.match(popupCss,/@keyframes hero-announcement-right \{ from \{ transform:translateX\(-50%\)/);
assert.match(popupCss,/\.hero-announcement-track \{ animation:none/,'Reduced motion stops the continuous ticker');
assert.match(popupCss,/\.hero-announcement-group>span \{[^}]*white-space:nowrap/,'Single-line messages on mobile and desktop');
let nextId=0;
const editorProps={content:{heroAnnouncements:[]},onChange:next=>{editorProps.content=next;}};
const editor=await harness('src/components/HeroAnnouncementEditor.tsx',editorProps,false,{imports:{
  './AdminIdentity':{useAdminIdentity:()=>({role:'super_admin',division:null})},
  './DivisionDirectory':{useDivisionDirectory:()=>({divisions:divisions.map(d=>({...d,offerings:['Pilihan material']}))})},
  '../data/divisionCms':{contentOwner:row=>row.ownerDivision || null},
  '../data/heroAnnouncements':{defaultAnnouncements},'../data/socialMedia':{contentId:()=>`test-${++nextId}`},
}});
editor.find(node=>node.props?.name==='announcement-0').props.onChange({target:{value:'Info website utama'}});
assert.equal(editorProps.content.heroAnnouncements[0].messages[0],'Info website utama');
editor.find(node=>node.props?.name==='announcement-site').props.onChange({target:{value:'retail-cibitung'}});
editor.find(node=>node.props?.name==='announcement-0').props.onChange({target:{value:'Info milik Cibitung'}});
assert.equal(editorProps.content.heroAnnouncements.find(row=>row.ownerDivision==='retail-cibitung').messages[0],'Info milik Cibitung');
assert.equal(editorProps.content.heroAnnouncements.find(row=>row.ownerDivision===null).messages[0],'Info website utama');
editor.dispose();
console.log('PASS: owned announcement messages, disable/empty states, continuous rightward CSS, pause/visibility/reduced-motion controls and per-site CMS editing (adapters)');
let promoActor={role:'super_admin',division:null}, promoView='all', workspaceState;
const promoOptions={imports:{
  './AdminIdentity':{useAdminIdentity:()=>promoActor},
  './DivisionDirectory':{useDivisionDirectory:()=>({divisions})},
  './AdminWorkspace':{useAdminView:()=>[promoView,value=>{promoView=value;}],useAdminWorkspace:options=>{workspaceState=options;return {refreshDashboard(){}};}},
  '../data/promotions':{promotionDestinations:[['/kontak','Kontak perusahaan']],countdownInputWib:()=>''},
  '../data/popupPosters':{promotionProviderSlug,posterContactMatches},
  '../data/divisionCms':{contentOwner:row=>row.ownerDivision || null},
  '../data/adminDashboard':{bannerIsLive:row=>row.published},
  '../data/socialMedia':{contentId:()=>`new-poster-${++nextId}`},
}};
const promoEditor=await harness('src/components/PromotionEditor.tsx',{initialContent:{promotions:clientPosters,contacts}},false,promoOptions);
promoEditor.find(node=>node.props?.name==='poster-site').props.onChange({target:{value:'retail-cibitung'}});
promoEditor.find(node=>node.type==='button'&&node.props.children==='+ Tambah poster popup').props.onClick();
assert.equal(promoView,'popup');
const providerSelect=promoEditor.find(node=>node.props?.name?.startsWith('provider-new-poster-'));
assert.equal(providerSelect.props.value,'retail-cibitung');
const createdId=providerSelect.props.name.slice('provider-'.length);
assert.ok(workspaceState.dirty);
promoEditor.find(node=>node.props?.name===`contact-${createdId}`).props.onChange({target:{value:'contact-1'}});
promoEditor.find(node=>node.type==='button'&&node.props.children==='Lihat pratinjau popup').props.onClick();
const previewElement=promoEditor.find(node=>Object.hasOwn(node.props || {},'onPreviewClose'));
assert.equal(previewElement.props.preview.providerDivision,'retail-cibitung');
assert.equal(previewElement.props.preview.contactId,'contact-1');
assert.equal(previewElement.props.preview.published,false,'Adding/previewing never automatically publishes');
previewElement.props.onPreviewClose();assert.equal(promoEditor.find(node=>Object.hasOwn(node.props || {},'onPreviewClose')).props.preview,null);
promoEditor.dispose();
for(const division of divisions) {
  promoActor={role:'division_admin',division:division.slug};promoView='all';
  const ownEditor=await harness('src/components/PromotionEditor.tsx',{initialContent:{promotions:[],contacts:contacts.filter(c=>c.divisions.includes(division.slug))}},false,promoOptions);
  ownEditor.find(node=>node.type==='button'&&node.props.children==='+ Tambah poster popup').props.onClick();
  const ownProvider=ownEditor.find(node=>node.props?.name?.startsWith('provider-new-poster-'));
  assert.equal(ownProvider.props.value,division.slug);assert.equal(ownProvider.props.disabled,true);
  assert.ok(ownEditor.absent(node=>node.props?.name==='poster-site'));ownEditor.dispose();
}
console.log('PASS: CMS popup creation, provider/contact selection, preview open/close, safe draft defaults and all five division editor controls (adapters)');
function luminance(hex) {const rgb=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
for(const [fg,bg] of [['ffffff','bc2730'],['ffffff','b92330'],['c4cdd0','181d20'],['e1e5e7','181d20']]) {const a=luminance(fg),b=luminance(bg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg} on ${bg} normal-text contrast`);}
console.log('PASS: defined popup text/action and announcement colors meet 4.5:1 in numeric checks; rendered surfaces still need browser verification');
const events=new Map(); let cleanup;
class FakeNode {}
class FakeElement extends FakeNode {}
class FakeTrack extends FakeElement {
  scrollLeft=0; scrollWidth=1200; clientWidth=400;
  classList={add(){},remove(){}};
  closest(){return this;} matches(){return true;} contains(node){return node===this;}
  setPointerCapture(){} scrollTo({left}){this.scrollLeft=left;}
}
const track=new FakeTrack(); const eventDocument={addEventListener:(name,handler)=>events.set(name,handler),removeEventListener:name=>events.delete(name)};
const ribbonModule={exports:{}};
const ribbonCode=ts.transpileModule(fs.readFileSync(path.join(frontend,'src/components/HorizontalRibbons.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
new Function('require','module','exports','document','window','Element','HTMLElement','Node','matchMedia',ribbonCode)(()=>({useEffect:fn=>{cleanup=fn();}}),ribbonModule,ribbonModule.exports,eventDocument,{},FakeElement,FakeTrack,FakeNode,()=>({matches:false}));
ribbonModule.exports.default();
events.get('pointerdown')({pointerType:'mouse',button:0,target:track,pointerId:1,clientX:200});
events.get('pointermove')({buttons:1,pointerId:1,clientX:100,preventDefault(){}}); assert.equal(track.scrollLeft,100);
events.get('pointerup')(); let canceled=false;
events.get('click')({target:track,preventDefault(){canceled=true;},stopPropagation(){}}); assert.ok(canceled,'Drag does not open the card');
events.get('pointerdown')({pointerType:'mouse',button:0,target:track,pointerId:2,clientX:100}); events.get('pointerup')(); canceled=false;
events.get('click')({target:track,preventDefault(){canceled=true;},stopPropagation(){}}); assert.equal(canceled,false,'Normal click still opens card');
events.get('keydown')({target:track,key:'End',preventDefault(){}}); assert.equal(track.scrollLeft,800);
events.get('keydown')({target:track,key:'Home',preventDefault(){}}); assert.equal(track.scrollLeft,0);
cleanup(); assert.equal(events.size,0);
console.log('PASS: shared ribbon mouse drag, click suppression, normal click, keyboard scrolling and listener cleanup (event adapters)');
