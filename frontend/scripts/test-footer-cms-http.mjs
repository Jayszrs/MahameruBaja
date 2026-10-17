// Only called by the isolated production-server suite, never a live CMS.
import assert from 'node:assert/strict';
export async function verifyFooterCms({call,owner,slugs}) {
  const html=async()=>{const page=await (await call('/')).text();return page.match(/<footer class="company-footer">[\s\S]*?<\/footer>/)?.[0]||'';};
  const block=(markup,slug)=>markup.match(new RegExp(`<article[^>]*data-footer-division="${slug}"[^>]*>([\\s\\S]*?)</article>`))?.[1]||'';
  const profiles=await (await call('/api/admin/divisions','GET',undefined,owner)).json();
  const original=await html();assert.equal((original.match(/data-footer-division=/g)||[]).length,5);
  assert(original.includes('href="#footer-divisi"'));assert(!original.includes('class="company-footer-brand"'));
  const groupMotto=original.indexOf('class="company-footer-motto footer-group-motto"');assert(groupMotto>=0&&groupMotto<original.indexOf('id="footer-divisi"'));
  for(const slug of slugs){
    const division=profiles.find(d=>d.slug===slug),markup=block(original,slug);assert(division&&markup);
    assert(markup.includes(`href="/unit/${slug}"`));assert(markup.includes('data-corporate-logo=')||markup.includes('<img'));
    assert(markup.includes('Admin divisi'));assert(markup.includes('href="tel:+'));assert(markup.includes(division.address.replaceAll('&','&amp;')));
    const own=await (await call(`/unit/${slug}`)).text();const footer=own.match(/<footer class="company-footer">[\s\S]*?<\/footer>/)?.[0]||'';
    assert(footer.includes('class="company-footer-brand"'));assert(!footer.includes('data-footer-division='));
  }
  const before=profiles.find(d=>d.slug===slugs[0]);
  const response=await call(`/api/admin/divisions/${before.id}`,'PUT',{...before,address:'Alamat uji footer CMS, bukan alamat toko nyata.'},owner);assert.equal(response.status,200);const saved=await response.json();
  assert(block(await html(),before.slug).includes('Alamat uji footer CMS, bukan alamat toko nyata.'));
  assert.equal((await call(`/api/admin/divisions/${before.id}`,'PUT',{...saved,address:before.address},owner)).status,200);
  const content=await (await call('/api/admin/content','GET',undefined,owner)).json();const contact=content.contacts.find(c=>c.published&&c.divisions.includes(before.slug));assert(contact);
  const changed=await call('/api/admin/content','PUT',{...content,contacts:content.contacts.map(c=>c.id===contact.id?{...c,name:'Admin Footer QA',whatsapp:'081299999001'}:c),_base:content},owner);assert.equal(changed.status,200);const current=await changed.json();
  let updated=await html();assert(block(updated,before.slug).includes('Admin Footer QA'));assert(block(updated,before.slug).includes('tel:+6281299999001'));
  assert(!block(updated,slugs[1]).includes('Admin Footer QA'),'Changed contact is not copied into an unrelated division');
  const unpublished=await call('/api/admin/content','PUT',{...current,contacts:current.contacts.map(c=>c.id===contact.id?{...c,published:false}:c),_base:current},owner);assert.equal(unpublished.status,200);const after=await unpublished.json();
  assert(!block(await html(),before.slug).includes('Admin Footer QA'),'Unpublished contact is absent from public footer');
  assert.equal((await call('/api/admin/content','PUT',{...after,contacts:content.contacts,_base:after},owner)).status,200);
  console.log('PASS: five actual footer blocks, original logos/website/address/admin links, group motto placement, own-division footer, live CMS profile/contact refresh and unpublished-contact privacy (isolated HTTP)');
}
