// Component/event and CSS checks, not rendered viewport or FPS measurements.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';
import {load} from './test-experience-revision.mjs';
import {harness} from './test-readability-revision.mjs';
const require=createRequire(import.meta.url), React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=fileURLToPath(new URL('../',import.meta.url));
async function component(file,overrides={},globals={}) {
  const target=path.join(root,file), module={exports:{}};
  const code=ts.transpileModule(await readFile(target,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const resolve=name=>overrides[name] || (name.startsWith('.') ? load(path.resolve(path.dirname(target),name+(name.endsWith('.json')?'':'.ts'))) : require(name));
  new Function('require','module','exports','window','IntersectionObserver',code)(resolve,module,module.exports,globals.window,globals.IntersectionObserver);
  return module.exports;
}
const {serviceWording,publicServiceWording}=load(path.join(root,'src/data/serviceWording.ts'));
assert.equal(serviceWording('Laser Cutting & CNC Bending'),'Laser Cutting & Bending');
const stored={id:'cnc-bending',title:'CNC Bending',excerpt:'Jasa CNC bending',image:'/images/cnc-bending-visual-v1.png',href:'/cnc-bending',offerings:['CNC Bending'],offeringDescriptions:{'CNC Bending':'Tekuk plat dengan CNC bending.'},websiteTexts:[{source:'CNC Bending',replacement:'Layanan CNC bending'}],reviews:[{text:'Ulasan asli CNC bending'}]};
const visible=publicServiceWording(stored);
assert.equal(visible.title,'Bending');assert.equal(visible.excerpt,'Jasa bending');
assert.equal(visible.offeringDescriptions[visible.offerings[0]],'Tekuk plat dengan bending.');
for(const key of ['id','image','href'])assert.equal(visible[key],stored[key]);
assert.deepEqual(visible.websiteTexts,stored.websiteTexts);assert.deepEqual(visible.reviews,stored.reviews);
assert.equal(stored.title,'CNC Bending','Display policy does not mutate saved CMS data');
const textRows=[{source:'Laser Cutting & CNC Bending',replacement:'Jasa CNC bending sesuai gambar',published:true,page:'all',ownerDivision:null}];
const {default:PublicText}=await component('src/components/PublicText.tsx',{
  react:{...React,useContext:()=>textRows,useMemo:fn=>fn()},'next/navigation':{usePathname:()=>'/jasa'},
  '../data/divisionCms':load(path.join(root,'src/data/divisionCms.ts')),
  '../data/websiteTexts':load(path.join(root,'src/data/websiteTexts.ts')),
  '../data/serviceWording':{serviceWording},
});
const label=renderToStaticMarkup(React.createElement(PublicText,null,React.createElement('a',{href:'/jasa'},'Laser Cutting & Bending')));
assert.equal(label,'<a href="/jasa">Jasa bending sesuai gambar</a>','Legacy CNC source aliases still match current CMS text');
console.log('PASS: legacy wording/CMS aliases, custom service description keys, unchanged identifiers/media URLs/review quotations and immutable stored data');

const post={id:'fixture-post',platform:'instagram',url:'https://www.instagram.com/p/fixture123/',published:true,title:'Unggahan uji',caption:'',image:'/images/steel-indonesia/toko-mahameru.jpg',videoUrl:''};
const hub=await harness('src/components/SocialHub.tsx',{accounts:[],posts:[post]},false,{imports:{
  './PublicText':{__esModule:true,default:({children})=>children},
  './CmsImage':{__esModule:true,default:({fill,...props})=>React.createElement('img',props)},
  './SocialEmbed':{__esModule:true,default:props=>React.createElement('iframe',props)},
  './DivisionDirectory':{useDivisionDirectory:()=>({divisions:[]})},
  '../data/socialMedia':load(path.join(root,'src/data/socialMedia.ts')),
}});
const Post=hub.find(node=>node.props?.post).type;
const photoHtml=renderToStaticMarkup(React.createElement(Post,{post}));
assert(photoHtml.includes('social-image-preview')&&photoHtml.includes(post.image));assert(!photoHtml.includes('<iframe'));
const videoHtml=renderToStaticMarkup(React.createElement(Post,{post:{...post,videoUrl:'https://media.example.test/test.mp4'}}));
assert(videoHtml.includes('preload="none"')&&videoHtml.includes('controls=""'));hub.dispose();
const embed=await harness('src/components/SocialEmbed.tsx',{src:'https://www.instagram.com/p/fixture123/embed/',title:'Unggahan uji'});
assert(embed.absent(node=>node.type==='iframe'),'Third-party frame is absent until near viewport or explicit load');
embed.find(node=>node.type==='button').props.onClick();
const frame=embed.find(node=>node.type==='iframe');
assert.equal(frame.props.src,'https://www.instagram.com/p/fixture123/embed/');
assert.equal(frame.props.allow,'fullscreen; encrypted-media; picture-in-picture');
assert.equal(frame.props.allowFullScreen,undefined,'Use one modern fullscreen permission attribute');embed.dispose();
let ready=false,deliver,observed=0,disconnected=0;
class Observer {
  constructor(callback,options){deliver=callback;assert.equal(options.rootMargin,'150px');}
  observe(){observed++;}
  disconnect(){disconnected++;}
}
const {default:AutoEmbed}=await component('src/components/SocialEmbed.tsx',{react:{
  useRef:()=>({current:{}}),useState:()=>[ready,value=>{ready=value;}],useEffect:callback=>callback(),
}},{window:{IntersectionObserver:Observer},IntersectionObserver:Observer});
let auto=AutoEmbed({src:'https://www.instagram.com/p/fixture123/embed/',title:'Uji viewport'});
assert.equal(auto.props.children.type,'button');assert.equal(observed,1);
deliver([{isIntersecting:false}]);assert.equal(ready,false);
deliver([{isIntersecting:true}]);assert.equal(disconnected,1);
auto=AutoEmbed({src:'https://www.instagram.com/p/fixture123/embed/',title:'Uji viewport'});
assert.equal(auto.props.children.type,'iframe');assert.equal(observed,1,'No second observer after frame becomes ready');
// The mobile gate must exit before querying the main element or creating any observers.
const motion=await harness('src/components/MotionController.tsx',{},true);assert.equal(motion.render(),null);motion.dispose();
const css=postcss.parse(await readFile(path.join(root,'src/experience-revision.css'),'utf8'));
function declaration(selector,property,value){let found=false;css.walkRules(rule=>{if(rule.selector===selector)rule.walkDecls(property,d=>{if(d.value===value)found=true;});});assert(found,`${selector} ${property}:${value}`);}
declaration('.directory-cartoon .directory-avatar-art>.directory-cap-logo','height','9%');
declaration('.directory-portrait .directory-cartoon .directory-avatar-art','aspect-ratio','1');
declaration('.article-editorial-visual','inset','0');
declaration('.article-editorial-visual img','object-fit','cover');
declaration('.social-feed .social-image-preview img','object-fit','cover');
declaration('.admin-shell .editor-item-actions button','padding','10px 14px');
console.log('PASS: real image preview before external embed, video downloads deferred, explicit iframe load, early mobile motion exit, cap stage, full-bleed article and readable CMS action CSS');
