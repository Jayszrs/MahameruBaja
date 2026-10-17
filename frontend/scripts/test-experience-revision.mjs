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
function load(file) {
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
const {livePopupPosters} = load(path.join(frontend,'src/data/popupPosters.ts'));
const {clientPosters} = load(path.join(frontend,'src/data/clientPosters.ts'));
const {promotionSchema} = load(path.join(frontend,'src/data/promotions.ts'));
assert.equal(clientPosters.length,4);
for (const poster of clientPosters) assert.ok(promotionSchema.safeParse(poster).success);
for (const slug of [undefined,'retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection']) assert.equal(livePopupPosters(clientPosters,'2026-10-17',slug).length,4);
assert.equal(livePopupPosters(clientPosters,'2026-11-01').length,3,'October promotion expires');
assert.equal(livePopupPosters(clientPosters.map(row=>({...row,published:false})),'2026-10-17').length,0);
assert.equal(livePopupPosters(clientPosters.map(row=>({...row,audience:['retail-tambun']})),'2026-10-17','retail-cibitung').length,0,'Audience isolation');
assert.ok(clientPosters.every(row=>row.showInBanner === false),'Popup posters do not clutter the banner ribbon');
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
console.log('PASS: four unedited client posters, date/publish/audience filters, popup-only defaults');
console.log('PASS: render-time text replacement escapes HTML and preserves links, handlers and form values; text catalog unique');
const {harness}=await import('./test-readability-revision.mjs');
const savedSession=new Map(); const storage={getItem:key=>savedSession.get(key)||null,setItem:(key,value)=>savedSession.set(key,value)};
const popupOptions={storage,imports:{'next/navigation':{usePathname:()=> '/'},'../data/popupPosters':{livePopupPosters}}};
const popup=await harness('src/components/WelcomePosters.tsx',{promotions:clientPosters},false,popupOptions);
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
for(const [width,height] of [[375,667],[320,568],[1440,900],[667,375]]) {
  const posterWidth=Math.min(560,width-32,(height-144)*.66875);
  assert.ok(posterWidth<=width-32 && posterWidth*1600/1070+112<=height-32+.001,'Poster and 44px controls fit the viewport without cropping');
}
popup.find(node=>node.props?.['aria-label']==='Poster berikutnya').props.onClick(); popup.render(); assert.equal(currentPoster(),clientPosters[1].image);
popup.find(node=>node.type==='dialog').props.onCancel(); popup.render(); assert.equal(closed,1); assert.equal(popup.document.body.style.overflow,''); popup.dispose();
const repeat=await harness('src/components/WelcomePosters.tsx',{promotions:clientPosters},false,popupOptions); repeat.find(node=>node.type==='dialog').props.ref.current={showModal(){opened++;},close(){}}; repeat.advance(1000); assert.equal(opened,1,'Dismissed posters do not reopen on same-site navigation in this session'); repeat.dispose();
console.log('PASS: popup opens after delay, moves between posters, closes on cancel, restores scrolling and remembers the session (hook/dialog adapters)');
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
