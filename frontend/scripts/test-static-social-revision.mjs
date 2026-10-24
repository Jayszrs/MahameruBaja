// Data, hook and DOM adapters. These are not browser screenshots or FPS tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
import sharp from 'sharp';
import {load} from './test-experience-revision.mjs';
import {harness} from './test-readability-revision.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url);
const {instagramArchive,originalInstagramMedia}=load(path.join(root,'src/data/instagramArchive.ts'));
const {contactIllustration}=load(path.join(root,'src/data/contactIllustrations.ts'));
const {divisionSchema}=load(path.join(root,'src/data/divisionCms.ts'));
const archive=originalInstagramMedia({platform:'instagram',url:'https://www.instagram.com/p/Dd5a7EzDk9N/'});
assert.equal(archive.photos.length,9);assert.equal(archive.first,6);
for(const [key,item] of Object.entries(instagramArchive)){
  const url=`https://www.instagram.com/p/${key}/`;
  assert.equal(originalInstagramMedia({platform:'instagram',url}),item);
  for(const patch of [{platform:'youtube'},{displayMode:'embed'},{image:'/images/own.jpg'},{videoUrl:'/media/own.mp4'},{url:`https://instagram.example.test/p/${key}/`}])assert.equal(originalInstagramMedia({platform:'instagram',url,...patch}),undefined);
  for(const photo of item.photos){
    const meta=await sharp(path.join(root,'public',photo.src)).metadata();assert.equal(meta.width,photo.width);assert.equal(meta.height,photo.height);
    if(photo.frame){assert(photo.frame.left+photo.frame.width<=photo.width);assert(photo.frame.top+photo.frame.height<=photo.height);}
  }
  if(item.video){const bytes=fs.readFileSync(path.join(root,'public',item.video));assert.equal(bytes.subarray(4,8).toString(),'ftyp');}
}
assert.equal(originalInstagramMedia({platform:'instagram',url:'https://www.instagram.com/p/unknown/'}),undefined);
const gallery=await harness('src/components/SocialPhotoGallery.tsx',{photos:archive.photos,title:'Material',url:'https://www.instagram.com/p/Dd5a7EzDk9N/',first:archive.first});
const selected=()=>gallery.find(node=>node.props?.src?.includes('/images/social/')).props;
assert(selected().src.endsWith('-07.jpg'));assert.equal(gallery.find(node=>node.props?.className==='social-photo-crop').props.style.width,`${1440/1243*100}%`);assert.equal(selected().fill,true);assert.equal(selected().style,undefined,'Crop dimensions belong to a wrapper; Next fill images cannot override width or height');
gallery.find(node=>node.type==='button'&&node.props.children==='Foto berikutnya').props.onClick();assert(selected().src.endsWith('-08.jpg'));
gallery.find(node=>node.type==='button'&&node.props.children==='Foto sebelumnya').props.onClick();assert(selected().src.endsWith('-07.jpg'));
const stage=gallery.find(node=>node.props?.className==='social-photo-gallery');
stage.props.onPointerDown({pointerType:'touch',clientX:200});stage.props.onPointerUp({clientX:90});assert(selected().src.endsWith('-08.jpg'));
let prevented=false;stage.props.onClickCapture({preventDefault(){prevented=true;},stopPropagation(){}});assert(prevented);
selected().onError();assert(gallery.find(node=>node.props?.className==='social-photo-failure'));
gallery.find(node=>node.type==='button').props.onClick();assert(selected().src.endsWith('-07.jpg'));gallery.dispose();
for(const id of ['retail-tambun-nuri','retail-cibitung-nuri','trading-proyek-putri'])assert.equal(contactIllustration({id}),'female');
assert.equal(contactIllustration({id:'new-contact-nuri'}),'male','Do not infer gender from a name');
assert.equal(contactIllustration({id:'retail-tambun-nuri',illustration:'male'}),'male','Explicit CMS choice wins');
const femalePath=path.join(root,'public/images/contact-admin-female-v1.webp');const female=await sharp(femalePath).metadata();assert.equal(female.hasAlpha,true);assert.equal(female.width,640);assert(fs.statSync(femalePath).size<100000);
const contact=await harness('src/components/ContactDirectory.tsx',{contacts:[{id:'trading-proyek-putri',name:'Putri',published:true,divisions:[],phone:'081200001',whatsapp:'081200001'}]},false,{imports:{'./DivisionDirectory':{useDivisionDirectory:()=>({divisions:[]})},'../data/contactIllustrations':{contactIllustration},'../data/siteContent':{internationalPhone:value=>value}}});
assert(contact.find(node=>node.props?.src==='/images/contact-admin-female-v1.webp'));contact.dispose();
const logos=[{id:'one',name:'Supplier',logo:'/images/logo.png'}];
const ribbon=await harness('src/components/LogoMarquee.tsx',{logos,kind:'supplier'});
assert.equal(ribbon.find(node=>node.props?.['data-running']!==undefined).props['data-running'],true);
assert(ribbon.absent(node=>node.type==='button'));assert(ribbon.find(node=>node.props?.['aria-hidden']===true));
ribbon.hidden(true);assert.equal(ribbon.find(node=>node.props?.['data-running']!==undefined).props['data-running'],false);ribbon.dispose();
const route=divisionSchema.shape.routeMedia;
assert.equal(route.parse(undefined),null);
assert(route.safeParse({type:'video',media:'https://media.example.test/clip.mp4',poster:'/images/cover.jpg'}).success);
assert(!route.safeParse({type:'video',media:'javascript:alert(1)'}).success);
assert(!route.safeParse({type:'iframe',media:'/images/a.jpg'}).success);
let changed,uploaded;
const fields=await harness('src/components/DivisionCardMediaFields.tsx',{value:{type:'video',media:'/media/test.mp4'},disabled:false,update:v=>changed=v,upload:async(file,poster)=>{uploaded={file,poster};}});
fields.find(node=>node.type==='select').props.onChange({target:{value:'image'}});assert.deepEqual(changed,{type:'image',media:''});
const file={type:'video/mp4'};fields.find(node=>node.type==='input'&&node.props.accept?.includes('video/mp4')).props.onChange({currentTarget:{files:[file],value:'selected'}});assert.equal(uploaded.file,file);
fields.find(node=>node.type==='button').props.onClick();assert.equal(changed,null);fields.dispose();
// Exercise the viewport/visibility/data-preference lifecycle of route videos.
const module={exports:{}};let effect,cleanup,deliver,ready=false,reduced=false,hidden=false,saveData=false,disconnected=0,plays=0,pauses=0,cursor=0;
const listeners=new Map(),preferenceListeners=new Map();
class Observer{constructor(cb){deliver=cb;}observe(){}disconnect(){disconnected++;}}
const refs=[{current:{}},{current:{play(){plays++;return Promise.resolve();},pause(){pauses++;}}}];
const react={useRef:()=>refs[cursor++],useState:()=>{cursor++;return cursor===3?[ready,v=>ready=v]:[false,()=>{}];},useEffect:cb=>effect=cb};
const win={IntersectionObserver:Observer,matchMedia:()=>({get matches(){return reduced;},addEventListener:(n,fn)=>preferenceListeners.set(n,fn),removeEventListener:n=>preferenceListeners.delete(n)})};
const doc={get hidden(){return hidden;},addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n)};
const connection={get saveData(){return saveData;},addEventListener:(n,fn)=>preferenceListeners.set('data-'+n,fn),removeEventListener:n=>preferenceListeners.delete('data-'+n)};
const source=ts.transpileModule(fs.readFileSync(path.join(root,'src/components/DivisionCardMedia.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
new Function('require','module','exports','window','document','navigator','IntersectionObserver',source)(name=>name==='react'?react:name==='react/jsx-runtime'?require(name):{default:()=>null},module,module.exports,win,doc,{connection},Observer);
const render=()=>{cursor=0;return module.exports.default({media:{type:'video',media:'/media/test.mp4'},fallback:'/images/cover.jpg',alt:'Divisi'});};
assert.equal(render().props.children[1],false);cleanup=effect();assert.equal(ready,false);
deliver([{isIntersecting:true}]);assert.equal(ready,true);assert.equal(render().props.children[1].type,'video');
hidden=true;listeners.get('visibilitychange')();assert.equal(ready,false);
hidden=false;listeners.get('visibilitychange')();assert.equal(ready,true);
reduced=true;preferenceListeners.get('change')();assert.equal(ready,false);
reduced=false;saveData=true;preferenceListeners.get('data-change')();assert.equal(ready,false);
saveData=false;deliver([{isIntersecting:true}]);deliver([{isIntersecting:false}]);assert.equal(ready,false);assert(plays>0&&pauses>0);
cleanup();assert.equal(disconnected,1);assert.equal(listeners.size,0);assert.equal(preferenceListeners.size,0);
console.log('PASS: original Instagram sources, nine-photo framing, swipe/retry, explicit female choices, alpha asset, automatic duplicate-safe logo strip, route media schema/editor and viewport/visibility/reduced-motion/save-data lifecycle');
