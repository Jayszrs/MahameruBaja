// Called by the isolated production-server suite, never against a live CMS.
import assert from 'node:assert/strict';
export async function verifyPartnerLogos({call,origin,owner,sessions,slugs,picture}) {
  const get=async cookie=>(await (await call('/api/admin/content','GET',undefined,cookie)).json());
  const put=(current,partnerLogos,cookie)=>call('/api/admin/content','PUT',{...current,partnerLogos,_base:current},cookie);
  const markup=async slug=>(await (await call(slug?`/unit/${slug}`:'/')).text());
  const marker=id=>`data-partner-id="${id}"`;
  const original=await get(owner);assert.equal(original.partnerLogos.length,23,'Legacy profile starts with the 17 supplied supplier and 6 client logos');
  for(const [i,slug] of slugs.entries()) {
    const actor=sessions[i],other=sessions[(i+1)%sessions.length];
    assert.equal((await call('/admin/mitra?tab=suppliers','GET',undefined,actor)).status,200);
    assert.equal((await call('/admin/mitra?tab=clients','GET',undefined,actor)).status,200);
    const media=new FormData();media.set('media',new Blob([picture],{type:'image/png'}),'qa-partner.png');media.set('kind','image');media.set('ownerDivision',slug);
    const uploaded=await fetch(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,Cookie:actor},body:media});assert.equal(uploaded.status,200);
    const {url}=await uploaded.json();
    const initial=await get(actor);assert.deepEqual(initial.partnerLogos,[],'Division cannot see central or another division’s editable records');
    const first={id:`qa-supplier-a-${slug}`,name:`Supplier QA ${slug}`,kind:'supplier',logo:url,ownerDivision:slug,published:false};
    const second={...first,id:`qa-supplier-b-${slug}`,logo:'/images/brand/mbi-laser.png',name:`Supplier B QA ${slug}`};
    const client={...second,id:`qa-client-${slug}`,kind:'client',name:`Rekanan QA ${slug}`};
    assert.equal((await put(initial,[first,second,client],actor)).status,200);
    assert(!(await markup(slug)).includes(first.name),'Draft logo data stays out of the public page');
    assert.equal((await call(url)).status,404);assert.equal((await call(url,'GET',undefined,other)).status,404);assert.equal((await call(url,'GET',undefined,actor)).status,200);
    let current=await get(actor);
    assert.equal((await put(current,current.partnerLogos.map(row=>({...row,published:true})),actor)).status,200);
    let own=await markup(slug);
    for(const row of [first,second,client])assert.equal(own.split(marker(row.id)).length-1,1,'One published logo instance, no animation duplicates');
    assert(!(await markup()).includes(marker(first.id)));assert(!(await markup(slugs[(i+1)%slugs.length])).includes(marker(first.id)));
    assert.equal((await call(url)).status,200,'A referenced published logo becomes public');
    current=await get(actor);
    assert.equal((await put(current,[current.partnerLogos[1],current.partnerLogos[0],current.partnerLogos[2]],actor)).status,200);
    own=await markup(slug);assert(own.indexOf(marker(second.id))<own.indexOf(marker(first.id)),'Saved order reaches rendered supplier strip');
    current=await get(actor);
    for(const patch of [{ownerDivision:slugs[(i+1)%slugs.length]},{audience:[slugs[(i+1)%slugs.length]]}])assert.equal((await put(current,current.partnerLogos.map((row,j)=>j?row:{...row,...patch}),actor)).status,403);
    for(const patch of [{logo:'javascript:alert(1)'},{logo:''}])assert.equal((await put(current,current.partnerLogos.map((row,j)=>j?row:{...row,...patch}),actor)).status,400);
    assert.equal((await put(current,[...current.partnerLogos,current.partnerLogos[0]],actor)).status,400);
    const foreign=await get(other);assert.equal((await put(foreign,[{...first,published:true}],other)).status,403,'Existing foreign ID cannot be appropriated');
    const stale=structuredClone(current);
    assert.equal((await put(current,current.partnerLogos.map(row=>row.id===first.id?{...row,name:'Nama baru QA'}:row),actor)).status,200);
    assert.equal((await put(stale,stale.partnerLogos.map(row=>row.id===first.id?{...row,name:'Perubahan basi QA'}:row),actor)).status,409);
    current=await get(actor);
    assert.equal((await put(current,current.partnerLogos.map(row=>({...row,published:false})),actor)).status,200);
    assert.equal((await call(url)).status,404,'Unpublishing revokes anonymous access to the uploaded logo');
    current=await get(actor);assert.equal((await put(current,[],actor)).status,200);assert.deepEqual((await get(actor)).partnerLogos,[],'Deleting final records does not restore seeds');
  }
  let current=await get(owner);
  const shared={id:'qa-shared-partner',name:'Rekanan pusat QA',kind:'client',logo:'/images/brand/mbi-laser.png',published:true,ownerDivision:null};
  assert.equal((await put(current,[...current.partnerLogos,shared],owner)).status,200);
  for(const slug of [undefined,...slugs])assert.equal((await markup(slug)).split(marker(shared.id)).length-1,1,'Central default logo is shared once on each website');
  current=await get(owner);assert.equal((await put(current,current.partnerLogos.map(row=>row.id===shared.id?{...row,audience:[slugs[0]]}:row),owner)).status,200);
  assert((await markup(slugs[0])).includes(marker(shared.id)));assert(!(await markup(slugs[1])).includes(marker(shared.id)));
  current=await get(owner);assert.equal((await put(current,current.partnerLogos.filter(row=>row.id!==shared.id),owner)).status,200);
  assert.deepEqual((await get(owner)).partnerLogos,original.partnerLogos,'Fixture cleanup preserves all original supplied logos and order');
  current=await get(owner);assert.equal((await put(current,[],owner)).status,200);
  const cleared=await get(owner);assert.deepEqual(cleared.partnerLogos,[],'Explicitly deleting all central logos never restores legacy seeds');
  assert(!(await markup()).includes('data-partner-id='),'An empty published partner list leaves no fabricated logo section');
  assert.equal((await put(cleared,original.partnerLogos,owner)).status,200);
  assert.equal((await call('/api/admin/content')).status,401);
  console.log('PASS: supplier/client logo CMS for all six roles: PNG upload, draft/public media privacy, publication, single-instance SSR, order, edits, stale-write conflict, foreign ownership/audience denial, validation, unpublish, final deletion and central sharing');
}
