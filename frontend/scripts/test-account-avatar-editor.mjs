// Real component handlers with hook/fetch adapters; no browser visual approval.
import assert from 'node:assert/strict';
import {harness} from './test-readability-revision.mjs';
const originalFetch=globalThis.fetch;
const actor={id:'fixture-admin',name:'Fixture admin',email:'fixture@example.test',role:'division_admin',division:'retail-tambun',mustChangePassword:false,avatar:''};
let profile={avatar:'',revision:3},workspace,requests=[],deny=false,loadFails=false,refreshes=0,uploadOwner;
const schema={safeParse:value=>({success:!value || value.startsWith('/images/') || value.startsWith('/api/cms/media/') || value.startsWith('https://')})};
const imports={
  './AdminIdentity':{useAdminIdentity:()=>actor},
  'next/navigation':{useRouter:()=>({refresh(){refreshes++;}})},
  '../data/adminAccount':{accountAvatarSchema:schema},
  '../lib/cmsUpload':{uploadCmsFile:async(file,kind,owner)=>{assert.equal(kind,'image');uploadOwner=owner;return '/api/cms/media/fixture-avatar.webp';}},
};
const flush=async editor=>{editor.render();await new Promise(resolve=>setImmediate(resolve));editor.render();};
const text=node=>[node.props?.children].flat(Infinity).filter(v=>typeof v==='string').join('');
try{
  globalThis.fetch=async(url,options={})=>{
    assert.equal(url,'/api/admin/profile');
    const method=options.method||'GET';requests.push({method,...(options.body?{body:JSON.parse(options.body)}:{})});
    if(method==='GET')return {ok:!loadFails,json:async()=>loadFails?{message:'Profil gagal dimuat'}:profile};
    if(deny)return {ok:false,json:async()=>({message:'Akun telah diubah. Muat ulang.'})};
    const body=JSON.parse(options.body);assert.equal(body.revision,profile.revision);
    profile={avatar:body.avatar,revision:profile.revision+1};return {ok:true,json:async()=>profile};
  };
  const props={onWorkspaceChange:value=>{workspace=value;}};
  const editor=await harness('src/components/AccountAvatar.tsx',props,false,{imports});editor.render();await flush(editor);
  const url=()=>editor.find(node=>node.type==='input'&&node.props.type==='text');
  assert.equal(workspace.dirty,false);assert.equal(workspace.disabled,true);
  url().props.onChange({target:{value:'javascript:alert(1)'}});editor.render();assert.equal(workspace.dirty,true);assert.equal(workspace.disabled,true);
  assert.equal(url().props['aria-invalid'],true);assert(editor.absent(node=>node.props?.src==='javascript:alert(1)'));
  editor.find(node=>node.type==='button'&&text(node)==='Batalkan perubahan foto').props.onClick();editor.render();assert.equal(workspace.dirty,false);
  url().props.onChange({target:{value:'https://example.test/profile.webp'}});editor.render();
  assert.equal(workspace.disabled,false);workspace.onSave();editor.render();assert.equal(workspace.busy,true);await flush(editor);
  assert.equal(profile.avatar,'https://example.test/profile.webp');assert.equal(workspace.dirty,false);assert.equal(workspace.busy,false);assert.equal(refreshes,1);
  editor.find(node=>node.type==='input'&&node.props.type==='file').props.onChange({target:{files:[new File(['fixture'],'profile.webp',{type:'image/webp'})],value:'selected'}});await flush(editor);
  assert.equal(uploadOwner,'retail-tambun');assert.equal(workspace.dirty,true);
  deny=true;workspace.onSave();await flush(editor);assert.equal(workspace.dirty,true);assert(editor.find(node=>node.props?.role==='alert'));
  deny=false;editor.find(node=>node.type==='button'&&text(node)==='Batalkan & muat ulang profil').props.onClick();await flush(editor);assert.equal(workspace.dirty,false);
  url().props.onChange({target:{value:'https://example.test/unsaved-photo.webp'}});editor.render();
  profile={...profile,revision:profile.revision+1};props.profileVersion=1;await flush(editor);
  assert.equal(url().props.value,'https://example.test/unsaved-photo.webp','Password/profile revision refresh preserves an unsaved photo');
  workspace.onSave();await flush(editor);assert.equal(profile.avatar,'https://example.test/unsaved-photo.webp');
  editor.find(node=>node.type==='button'&&text(node)==='Hapus foto').props.onClick();editor.render();assert.equal(workspace.dirty,true);workspace.onSave();await flush(editor);assert.equal(profile.avatar,'');assert.equal(workspace.dirty,false);
  editor.dispose();
  loadFails=true;const retry=await harness('src/components/AccountAvatar.tsx',props,false,{imports});retry.render();await flush(retry);
  assert.equal(retry.find(node=>node.type==='fieldset').props.disabled,true);assert(retry.find(node=>node.props?.role==='alert'));
  loadFails=false;retry.find(node=>node.type==='button'&&text(node)==='Batalkan & muat ulang profil').props.onClick();await flush(retry);assert.equal(retry.find(node=>node.type==='fieldset').props.disabled,false);retry.dispose();
  let parentWorkspace;
  const parent=await harness('src/components/AccountSelf.tsx',{},false,{imports:{
    './AdminIdentity':{useAdminIdentity:()=>actor},
    './AdminWorkspace':{useAdminWorkspace:value=>{parentWorkspace=value;}},
    './DivisionDirectory':{useDivisionDirectory:()=>({divisions:[]})},
    'next/navigation':{useRouter:()=>({refresh(){},replace(){}})},
  }});
  parent.render();const child=()=>parent.find(node=>typeof node.props?.onWorkspaceChange==='function');
  let saves=0;const photoSave=()=>{saves++;};
  child().props.onWorkspaceChange({dirty:true,busy:false,disabled:false,onSave:photoSave});parent.render();
  assert.equal(parentWorkspace.dirty,true);assert.equal(parentWorkspace.label,'Simpan foto profil');parentWorkspace.onSave();assert.equal(saves,1);
  parent.find(node=>node.type==='input'&&node.props.autoComplete==='current-password').props.onChange({target:{value:'fixture-password'}});parent.render();
  assert.equal(parentWorkspace.label,'Ganti password');assert.equal(parentWorkspace.secondaryLabel,'Simpan foto profil');parentWorkspace.onSecondary();assert.equal(saves,2);
  child().props.onWorkspaceChange({dirty:true,busy:true,disabled:true,onSave:photoSave});parent.render();assert.equal(parentWorkspace.busy,true);assert.equal(parent.find(node=>node.type==='fieldset').props.disabled,true);parent.dispose();
}finally{globalThis.fetch=originalFetch;}
console.log('PASS: profile load/edit/upload/save/remove/cancel/retry/conflict, unsafe preview rejection, toolbar save, combined dirty/busy navigation guard and separate password/profile actions (hook adapters)');
