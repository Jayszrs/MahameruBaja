// Hook/source/CSS checks, not a browser breakpoint audit.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';
import {harness} from './test-readability-revision.mjs';
const slugs=['retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection'];
const divisions=slugs.map((slug,i)=>({slug,status:'active',name:`Divisi uji ${i}`,logo:`/images/test-${i}.png`,address:`Alamat uji ${i}`,mapsUrl:`https://maps.app.goo.gl/fixture${i}`,admins:[{name:`Admin uji ${i}`,phone:`08123456789${i}`}]}));
const imports={'../data/siteContent':{internationalPhone:value=>'62'+value.slice(1)}};
const footer=await harness('src/components/FooterDivisions.tsx',{divisions},false,{imports});
for(const division of divisions){
  const block=footer.find(node=>node.props?.['data-footer-division']===division.slug);
  assert(block);assert(footer.find(node=>node.props?.href===`/unit/${division.slug}`&&node.props.className==='footer-division-website'));
  assert(footer.find(node=>node.type==='h3'&&node.props.children===division.name));
  const logo=footer.find(node=>node.props?.src===division.logo);assert(logo.props.transparentLogo);assert.equal(logo.props.loading,'lazy');
  assert(footer.find(node=>node.props?.href===division.mapsUrl&&node.props.children===division.address));
  assert(footer.find(node=>node.props?.href===`tel:+62${division.admins[0].phone.slice(1)}`));
}
footer.dispose();
const fallback=await harness('src/components/FooterDivisions.tsx',{divisions:[{...divisions[0],address:'',mapsUrl:'',admins:[]}]},false,{imports});
assert(fallback.find(node=>node.type==='address'&&node.props.children==='Alamat: konfirmasi dengan admin divisi.'));
assert(fallback.find(node=>node.props?.href===`/unit/${slugs[0]}/kontak`));fallback.dispose();
const empty=await harness('src/components/FooterDivisions.tsx',{divisions:[]},false,{imports});assert.equal(empty.render(),null);empty.dispose();
const wrapperImports={'./DivisionDirectory':{useDivisionDirectory:()=>({divisions,divisionIdentity:Object.fromEntries(divisions.map(d=>[d.slug,{logo:d.logo}])),divisionWhatsApp:()=> 'https://wa.me/628123456789'})},'../data/companyIdentity':{mainLogo:'/images/main.png',groupMotto:'Motto uji'},'./DivisionChrome':{divisionNavigation:()=>[]}};
const group=await harness('src/components/Footer.tsx',{},false,{imports:wrapperImports});
assert(group.find(node=>node.props?.className==='footer-contact-link'&&node.props.href==='#footer-divisi'));
assert(group.find(node=>node.props?.divisions===divisions));assert(group.absent(node=>node.props?.className==='company-footer-brand'),'Main footer does not keep a single cutting-only identity');group.dispose();
const own=await harness('src/components/Footer.tsx',{division:{...divisions[0],label:'Divisi uji'}},false,{imports:wrapperImports});
assert(own.find(node=>node.props?.className==='company-footer-brand'));assert(own.absent(node=>node.props?.divisions===divisions));own.dispose();
const css=postcss.parse(await readFile(new URL('../src/experience-revision.css',import.meta.url),'utf8'));
const columns=[];css.walkRules(rule=>{if(rule.selector==='.footer-division-list')rule.walkDecls('grid-template-columns',d=>columns.push(d.value));});
for(const count of ['repeat(5,minmax(0,1fr))','repeat(3,minmax(0,1fr))','repeat(2,minmax(0,1fr))','minmax(0,1fr)'])assert(columns.includes(count));
console.log('PASS: all five CMS-backed footer logos, website/map/phone links, original alpha flag, missing-data fallbacks, main/own-division separation and responsive CSS columns (adapters/source checks)');
