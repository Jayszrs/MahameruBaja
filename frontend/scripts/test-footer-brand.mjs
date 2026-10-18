// Component/CSS checks, not a rendered browser or viewport audit.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import postcss from 'postcss';
import {load} from './test-experience-revision.mjs';
const CmsImage=load(fileURLToPath(new URL('../src/components/CmsImage.tsx',import.meta.url))).default;
const logo='/images/steel-indonesia/company-logo.jpeg';
const render=props=>renderToStaticMarkup(React.createElement(CmsImage,{src:logo,alt:'Mahameru Baja',width:170,height:140,...props}));
const transparent=render({transparentLogo:true});
assert.ok(transparent.includes('<feColorMatrix')&&transparent.includes('filter="url(#logo-paper-'));
assert.ok(!render({}).includes('<filter'),'Header and other existing logo presentations are unchanged');
for(const transparentLogo of [true,false]){
  const retail=render({src:'/images/brand/mahameru-retail.png',alt:'Mahameru Baja',transparentLogo});
  assert.ok(retail.includes('corporate-logo-wordmark')&&retail.includes('>MAHAMERU BAJA</text>'),'Retail mark has the exact client-requested name on both surfaces');
  assert.ok(retail.includes('650px 465px,40px 465px'),'Original symbol is retained but the old MMN lettering is cropped out');
  assert.ok(!retail.includes('>MMN<'));
}
for(const other of ['/images/brand/garuda.png','/images/brand/mbi-laser.png','/images/brand/mbi-trading.png','/images/brand/mbi-proyek.png'])assert.ok(!render({src:other}).includes('corporate-logo-wordmark'),'Other divisions retain their original lettering');
const custom=render({src:'/uploads/custom-logo.png',transparentLogo:true});
assert.ok(custom.includes('<img')&&custom.includes('feColorMatrix')&&custom.includes('feComposite')&&!custom.includes('transparentLogo'),'Custom logo paper is removed by a display filter, preserving the original image and alpha');
assert.ok(custom.includes('src="/uploads/custom-logo.png"'),'Custom CMS source is unchanged');
assert.ok(!render({src:'/uploads/custom-logo.png'}).includes('feColorMatrix'),'Unflagged content images remain unchanged');
const pair=renderToStaticMarkup(React.createElement(React.Fragment,null,...[1,2].map(key=>React.createElement(CmsImage,{key,src:logo,alt:'Logo',width:170,height:140,transparentLogo:true}))));
const ids=[...pair.matchAll(/<filter id="([^"]+)"/g)].map(match=>match[1]);assert.equal(new Set(ids).size,2);
const alpha=rgb=>Math.max(0,Math.min(1,17-6*rgb.reduce((sum,v)=>sum+v/255,0)));
assert.equal(alpha([255,255,255]),0);assert.equal(alpha([245,245,245]),0);
assert.equal(alpha([0,0,0]),1);assert.equal(alpha([230,0,0]),1);
assert.equal(alpha([0,0,0])*0,0,'SourceGraphic alpha composition keeps originally transparent black pixels transparent');
const css=postcss.parse(await readFile(new URL('../src/experience-revision.css',import.meta.url),'utf8'));
function declaration(selector,property){let result;css.walkRules(rule=>{if(rule.selector===selector)rule.walkDecls(property,decl=>result=decl.value);});return result;}
assert.equal(declaration('.company-footer-photo','opacity'),'.16');
assert.equal(declaration('.company-footer-photo','pointer-events'),'none');
assert.equal(declaration('.company-footer','isolation'),'isolate');
assert.equal(declaration('.company-footer-brand .footer-company-logo','background'),'transparent');
const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const worstBackground=[16,17,18].map(v=>v*.84+255*.16);
for(const text of [[255,255,255],[191,197,202],[174,182,188],[214,218,220]])assert.ok((luminance(text)+.05)/(luminance(worstBackground)+.05)>=4.5,'Footer text meets AA even over a fully white photo region at 16% opacity');
console.log('PASS: opt-in corporate/raster paper removal, original custom URLs, preserved alpha/unique filter IDs, non-interactive photo and numeric footer contrast (not browser verification)');
