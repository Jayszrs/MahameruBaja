// Actual editor event handlers via hook adapters, not a browser/viewport audit.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {load} from './test-experience-revision.mjs';
import {harness} from './test-readability-revision.mjs';
const {heroSlides,heroSlideSchema}=load(fileURLToPath(new URL('../src/data/heroSlides.ts',import.meta.url)));
const {validateUploadFile}=load(fileURLToPath(new URL('../src/lib/cmsUpload.ts',import.meta.url)));
const roles=[null,'retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection'];
const originalFetch=globalThis.fetch;let actor,workspace,sequence=0,deny=false,saves=0,uploaded;
const imports={
  './AdminIdentity':{useAdminIdentity:()=>actor},
  './AdminWorkspace':{useAdminWorkspace:value=>{workspace=value;return {refreshDashboard(){}};}},
  '../data/heroSlides':{heroSlides,heroSlideSchema},
  '../data/socialMedia':{contentId:()=>`qa-hero-${++sequence}`},
  '../lib/cmsUpload':{uploadCmsFile:async(file,kind,owner)=>{validateUploadFile(file,kind);uploaded={kind,owner};return `/media/qa-${kind}-${sequence}.${kind==='video'?'mp4':'png'}`;}},
};
const text=node=>[node.props?.children].flat(Infinity).filter(v=>typeof v==='string').join('');
const media=editor=>editor.find(node=>node.props?.slide&&typeof node.props.upload==='function');
try {
  globalThis.fetch=async(url,request)=>{
    assert.equal(url,'/api/admin/content');saves++;const {_base,...data}=JSON.parse(request.body);assert.ok(_base);
    return {ok:!deny,json:async()=>deny?{message:'Konflik revisi QA'}:{...data,revision:(data.revision||0)+1}};
  };
  for(const division of roles){
    actor={role:division?'division_admin':'super_admin',division};
    const slide={...heroSlides[0],id:'qa-slide',ownerDivision:division};
    const editor=await harness('src/components/HeroEditor.tsx',{initialContent:{revision:0,heroSlides:[slide],heroAnnouncements:[]}},false,{imports});
    await media(editor).props.upload(new File(['video'],'video.mp4',{type:'video/mp4'}));
    assert.deepEqual(uploaded,{kind:'video',owner:division});assert.equal(media(editor).props.slide.type,'video');
    await media(editor).props.upload(new File(['poster'],'poster.png',{type:'image/png'}),true);
    assert.ok(media(editor).props.slide.poster.endsWith('.png'));assert.equal(media(editor).props.slide.type,'video');
    await media(editor).props.upload(new File(['image'],'image.png',{type:'image/png'}));
    assert.equal(media(editor).props.slide.type,'image');assert.equal(media(editor).props.slide.poster,undefined);
    const existing=media(editor).props.slide.media;
    await media(editor).props.upload(new File(['bad'],'bad.gif',{type:'image/gif'}));
    assert.equal(media(editor).props.slide.media,existing);assert.ok(editor.find(node=>node.props?.role==='alert'));
    media(editor).props.update({type:'video',media:'https://media.example.test/hero.mp4'});editor.render();
    await workspace.onSave();assert.equal(media(editor).props.slide.media,'https://media.example.test/hero.mp4');
    assert.equal(workspace.dirty,false);
    editor.find(node=>node.props?.name==='hero-title-qa-slide').props.onChange({target:{value:'Judul hero disunting'}});editor.render();
    deny=true;await workspace.onSave();assert.equal(media(editor).props.slide.title,'Judul hero disunting');assert.equal(workspace.dirty,true);deny=false;
    media(editor).props.update({media:'javascript:alert(1)'});editor.render();const before=saves;
    await workspace.onSave();assert.equal(saves,before,'Unsafe media fails before a request');
    media(editor).props.update({media:existing});editor.render();await workspace.onSave();
    editor.find(node=>node.type==='button'&&text(node)==='Hapus slide').props.onClick();
    editor.find(node=>node.type==='button'&&text(node)==='Batal').props.onClick();assert.ok(media(editor));
    editor.find(node=>node.type==='button'&&text(node)==='Hapus slide').props.onClick();
    editor.find(node=>node.props?.className==='admin-danger').props.onClick();editor.render();await workspace.onSave();
    assert.ok(editor.absent(node=>node.props?.slide),'Deleting the final slide persists an empty editor');
    editor.find(node=>node.type==='button'&&text(node)==='+ Tambah slide').props.onClick();
    assert.equal(media(editor).props.slide.ownerDivision,division);assert.equal(media(editor).props.slide.published,false);
    editor.dispose();
  }
}finally{globalThis.fetch=originalFetch;}
let slide={...heroSlides[0],id:'media-fields'},uploadedFile;
const fields=await harness('src/components/HeroMediaFields.tsx',{get slide(){return slide;},busy:false,update:patch=>slide={...slide,...patch},upload:async(file,poster)=>{uploadedFile={file,poster};}},false,{imports:{'../lib/cmsUpload':{imageUploadHelp:'Image help',videoUploadHelp:'Video help'}}});
const video=new File(['video'],'hero.mp4',{type:'video/mp4'}),input={files:[video],value:'chosen'};
fields.find(node=>node.props?.name==='hero-upload-media-fields').props.onChange({currentTarget:input});assert.equal(input.value,'');assert.equal(uploadedFile.file,video);
fields.find(node=>node.props?.name==='hero-kind-media-fields').props.onChange({target:{value:'video'}});assert.equal(slide.media,'');
fields.find(node=>node.props?.name==='hero-url-media-fields').props.onChange({target:{value:' https://media.example.test/hero.mp4 '}});assert.equal(slide.media,'https://media.example.test/hero.mp4');
fields.find(node=>node.type==='video').props.onError();assert.ok(fields.find(node=>node.props?.role==='alert'));
fields.find(node=>node.type==='button'&&text(node)==='Lepas media dari slide').props.onClick();assert.equal(slide.media,'');
assert.ok(fields.absent(node=>node.type==='video'));fields.dispose();
console.log('PASS: all six role editors upload/type-detect image/video, poster, invalid file retention, HTTPS link, validation, save/conflict, cancel/delete final slide and re-create; media chooser/error/reset handlers (adapters)');
const videoHero=await harness('src/components/HeroCarousel.tsx',{slides:[{...heroSlides[0],type:'video'},heroSlides[1]],rating:0,ratingDate:'',mapsUrl:''});
videoHero.advance(5000);assert.equal(videoHero.find(node=>node.type==='h1').props.children[0],heroSlides[0].title,'A video is not cut off by the image timer');
videoHero.find(node=>node.type==='video').props.onEnded();assert.equal(videoHero.find(node=>node.type==='h1').props.children[0],heroSlides[1].title);videoHero.dispose();
console.log('PASS: video hero waits for ended rather than stopping at five seconds; existing image timer, pause, failure and reduced-motion adapters retained');
