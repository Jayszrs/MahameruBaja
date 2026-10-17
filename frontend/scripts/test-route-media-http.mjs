// Only called by the isolated CMS suite; never modifies live accounts or content.
import assert from 'node:assert/strict';
import {cmsVideo} from './fixtures/cms-video.mjs';
export async function verifyRouteMedia({call,origin,owner,sessions,slugs,picture}) {
  const get=async (slug,cookie)=>(await (await call(`/api/admin/divisions/${slug}`,'GET',undefined,cookie)).json());
  const upload=async(cookie,slug,bytes,kind)=>{
    const data=new FormData();data.set('media',new Blob([bytes],{type:kind==='video'?'video/mp4':'image/png'}),kind==='video'?'route.mp4':'route.png');data.set('kind',kind);data.set('ownerDivision',slug);
    const response=await fetch(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,Cookie:cookie},body:data});assert.equal(response.status,200);return (await response.json()).url;
  };
  for(const [i,slug] of slugs.entries()){
    const cookie=sessions[i],other=sessions[(i+1)%sessions.length];
    const before=await get(slug,cookie);assert.equal(before.routeMedia,null);
    const image=await upload(cookie,slug,picture,'image'),video=await upload(cookie,slug,cmsVideo,'video');
    assert.equal((await call(image)).status,404);assert.equal((await call(image,'GET',undefined,other)).status,404);assert.equal((await call(image,'GET',undefined,cookie)).status,200);
    const put=patch=>call(`/api/admin/divisions/${before.id}`,'PUT',patch,cookie);
    let response=await put({...before,routeMedia:{type:'image',media:image}});assert.equal(response.status,200);let current=await response.json();
    assert.equal(current.hero,before.hero,'Card upload does not replace the division hero');assert.equal((await call(image)).status,200);
    let html=await (await call('/')).text();assert(html.includes(image));assert(html.includes('data-static-motion='));
    assert.equal((await put({...current,routeMedia:{type:'image',media:video}})).status,400,'MP4 cannot be presented as an image');
    assert.equal((await put({...current,routeMedia:{type:'video',media:video,poster:video}})).status,400,'A video cannot be its own image poster');
    assert.equal((await put({...current,routeMedia:{type:'video',media:'javascript:alert(1)'}})).status,400);
    assert.equal((await call(`/api/admin/divisions/${before.id}`,'PUT',{...current,routeMedia:{type:'video',media:video,poster:image}},other)).status,403);
    response=await put({...current,routeMedia:{type:'video',media:video,poster:image}});assert.equal(response.status,200);current=await response.json();
    assert.equal(current.routeMedia.type,'video');assert.equal((await call(video)).status,200);html=await (await call('/')).text();
    assert(!html.includes(`src="${video}"`),'Offscreen background video is not fetched by server markup');assert(html.includes(image));
    const stale=current;
    response=await put({...current,routeMedia:null});assert.equal(response.status,200);current=await response.json();
    assert.equal((await call(video)).status,404);assert.equal((await call(image)).status,404,'Removing the last reference revokes anonymous media access');
    assert.equal((await put({...stale,routeMedia:null})).status,409);
    assert.equal((await get(slug,owner)).routeMedia,null);
    const content=await (await call('/api/admin/content','GET',undefined,cookie)).json();const contact=content.contacts[0];
    assert(contact);const saved=await call('/api/admin/content','PUT',{...content,contacts:content.contacts.map(c=>c.id===contact.id?{...c,illustration:'female'}:c),_base:content},cookie);assert.equal(saved.status,200);
    const changed=await saved.json();assert.equal(changed.contacts.find(c=>c.id===contact.id).illustration,'female');
    assert((await (await call(`/unit/${slug}/kontak`)).text()).includes('contact-admin-female-v1.webp'),'Published character selection reaches the contact portrait, including optimized image URLs');
    const restored=await call('/api/admin/content','PUT',{...changed,contacts:content.contacts,_base:changed},cookie);assert.equal(restored.status,200);
  }
  for(const asset of ['/images/social/Dd5a7EzDk9N-07.jpg','/images/contact-admin-female-v1.webp'])assert.equal((await call(asset)).status,200);
  const range=await fetch(origin+'/videos/social/DeG2uVRh2uq.mp4',{headers:{Range:'bytes=0-1023'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,1024);
  console.log('PASS: route-card PNG/MP4 uploads for five divisions, preserved heroes, deferred SSR video, publication/reference revocation, wrong-kind/foreign/stale rejection, female character CMS persistence and original video range delivery');
}
