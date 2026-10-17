// Component/source assertions, not a browser viewport or visual approval.
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {harness} from './test-readability-revision.mjs';
const divisions=[['retail-tambun','mahameru-retail'],['retail-cibitung','garuda'],['trading-proyek','mbi-trading'],['laser-cutting','mbi-laser'],['fabrikasi-erection','mbi-proyek']].map(([slug,logo])=>({slug,name:slug,label:slug,logo:`/images/brand/${logo}.png`}));
const fixtures=divisions.map((division,i)=>({id:`fixture-${i}`,name:`Kontak uji ${i}`,role:'Admin divisi',divisions:[division.slug],published:true,photo:'',phone:'081200000001',mobile:'',whatsapp:'081200000002',email:''}));
const imports={
  './DivisionDirectory':{useDivisionDirectory:()=>({divisions})},
  '../data/companyIdentity':{mainLogo:'/images/brand/mbi-laser.png'},
  '../data/siteContent':{contactVisibleInDivision:(c,slug)=>c.divisions.includes(slug),internationalPhone:value=>'62'+value.slice(1)},
};
for(const division of divisions){
  const directory=await harness('src/components/ContactDirectory.tsx',{contacts:fixtures,divisionSlug:division.slug},false,{imports});
  assert.equal(directory.find(node=>node.props?.className==='directory-cap-logo').props.src,division.logo);
  assert(directory.find(node=>node.props?.className==='directory-cap-logo').props.transparentLogo);
  assert.equal(directory.find(node=>node.props?.src==='/images/contact-admin-illustration.webp').props.alt,'Ilustrasi admin bertopi, bukan foto kontak');
  assert(directory.find(node=>node.props?.href==='tel:+6281200000001'));
  assert(directory.find(node=>node.type==='strong'&&node.props.children==='081200000002'),'WhatsApp number is visible, not just hidden behind a link');
  directory.dispose();
}
const photoDirectory=await harness('src/components/ContactDirectory.tsx',{contacts:[{...fixtures[0],photo:'/images/fixture-photo.webp'}],divisionSlug:divisions[0].slug},false,{imports});
assert(photoDirectory.absent(node=>node.props?.className==='directory-cartoon'),'A saved custom portrait is preserved');
assert(photoDirectory.find(node=>node.props?.src==='/images/fixture-photo.webp'));photoDirectory.dispose();
const avatar=await stat(new URL('../public/images/contact-admin-illustration.webp',import.meta.url));assert(avatar.size<50000);
for(const file of ['ArticleDetailPage','InformasiPage']){
  const source=await readFile(new URL(`../src/screens/${file}.tsx`,import.meta.url),'utf8');
  assert(source.includes('data-static-motion'));assert(!source.includes('data-parallax'));assert(!source.includes('auto-parallax'));
  assert(source.includes('import Image from "../components/CmsImage"'));
}
const shell=await readFile(new URL('../src/components/AppShell.tsx',import.meta.url),'utf8');
assert(shell.includes('!productPage && !articlePage && <MotionController'),'Article routes do not mount the global scroll/parallax controller');
const media=await readFile(new URL('../src/components/MotionController.tsx',import.meta.url),'utf8');
assert(media.includes('(min-width: 761px) and (pointer: fine)'));
const services=await readFile(new URL('../src/screens/LaserCuttingPage.tsx',import.meta.url),'utf8');assert(services.includes('<strong>{path.action}</strong>'));
console.log('PASS: all five division cap logos, explicit cartoon disclosure, phone/WhatsApp numbers, custom-photo preservation, 41KB asset, static article routes and desktop-only parallax (adapters/source checks)');
