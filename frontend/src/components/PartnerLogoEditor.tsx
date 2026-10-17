"use client";
import { useRef, useState } from "react";
import Image from "./CmsImage";
import ContentOwnership from "./ContentOwnership";
import AdminViewTabs from "./AdminViewTabs";
import { useAdminIdentity } from "./AdminIdentity";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import { imageUploadHelp, uploadCmsFile } from "../lib/cmsUpload";
import { contentId } from "../data/socialMedia";
import { contentOwner, assetUrl } from "../data/divisionCms";
import { movePartnerLogo, partnerLogoListSchema, type PartnerLogo } from "../data/partnerLogos";
import type { SiteContent } from "../data/siteContent";

function LogoPreview({item}:{item:PartnerLogo}) {
  const [failed,setFailed]=useState(false);
  return <div className="partner-editor-preview">{item.logo && assetUrl.safeParse(item.logo).success && !failed ? <Image src={item.logo} alt={item.name || "Pratinjau logo"} width={280} height={160} sizes="280px" onError={()=>setFailed(true)}/> : <p>{failed ? "Logo belum termuat. Periksa alamat gambar atau unggah kembali." : "Unggah logo atau isi alamat gambar untuk melihat pratinjau."}</p>}</div>;
}
export default function PartnerLogoEditor({initialContent}:{initialContent:SiteContent}) {
  const actor=useAdminIdentity();
  const [content,setContent]=useState(initialContent), base=useRef(initialContent);
  const [tab,setTab]=useAdminView("tab",["suppliers","clients"] as const,"suppliers");
  const [dirty,setDirty]=useState(false),[busy,setBusy]=useState(false);
  const [message,setMessage]=useState(""),[failed,setFailed]=useState(false),[deleteId,setDeleteId]=useState<string|null>(null);
  const kind=tab==="suppliers"?"supplier":"client";
  const rows=content.partnerLogos.filter(row=>row.kind===kind);
  function change(update:(rows:PartnerLogo[])=>PartnerLogo[]) {setContent(current=>({...current,partnerLogos:update(current.partnerLogos)}));setDirty(true);setMessage("");}
  function update(id:string,patch:Partial<PartnerLogo>) {change(items=>items.map(item=>item.id===id?{...item,...patch}:item));}
  async function upload(item:PartnerLogo,file:File) {
    setBusy(true);setFailed(false);setMessage("");
    try {const logo=await uploadCmsFile(file,"image",contentOwner(item));update(item.id,{logo});setMessage("Logo diunggah. Simpan perubahan untuk menerbitkan.");}
    catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}
  }
  async function save() {
    setFailed(false);setMessage("");
    const parsed=partnerLogoListSchema.safeParse(content.partnerLogos);
    if(!parsed.success){setFailed(true);setMessage(parsed.error.issues[0]?.message || "Periksa data logo.");return;}
    setBusy(true);
    try {
      const response=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...content,_base:base.current})});
      const result=await response.json();if(!response.ok)throw new Error(result.message || "Logo gagal disimpan. Coba kembali.");
      setContent(result);base.current=result;setDirty(false);workspace.refreshDashboard();setMessage("Tersimpan. Logo terbit sudah diperbarui di website.");
    } catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}
  }
  const workspace=useAdminWorkspace({dirty,busy,label:"Simpan logo",disabled:!dirty,onSave:save});
  return <div className="partner-logo-editor">
    <div className="admin-page-heading"><div><p className="industrial-eyebrow">ISI WEBSITE / LOGO MITRA</p><h1>Supplier & perusahaan rekanan</h1><p>Kelola logo asli pemasok dan perusahaan yang pernah bekerja sama. Hanya terbitkan hubungan yang sudah dikonfirmasi.</p></div></div>
    <AdminViewTabs value={tab} onChange={value=>{setTab(value);setDeleteId(null);}} disabled={busy} label="Jenis logo" options={[{value:"suppliers",label:"Supplier"},{value:"clients",label:"Perusahaan rekanan"}]}/>
    {message&&<p className={`editor-notice ${failed?"error":"success"}`} role={failed?"alert":"status"}>{message}</p>}
    <fieldset className="editor-fields" disabled={busy}>
      <div className="editor-list-heading"><h2>{kind==="supplier"?"Logo supplier":"Logo perusahaan rekanan"} <span>{rows.length}</span></h2><button type="button" disabled={content.partnerLogos.length>=100} onClick={()=>change(items=>[...items,{id:contentId(),kind,name:"",logo:"",published:false,ownerDivision:actor.division}])}>+ Tambah logo</button></div>
      {!rows.length&&<div className="editor-empty"><h3>Belum ada logo {kind==="supplier"?"supplier":"rekanan"}.</h3><p>Tambahkan logo asli, periksa namanya, lalu aktifkan Terbit dan simpan.</p></div>}
      {rows.map((item,index)=><details className="editor-panel partner-editor-record" key={item.id} open={rows.length===1}><summary><strong>{item.name || "Logo tanpa nama"}</strong><span>{item.published?"Terbit":"Draf"}</span></summary>
        <ContentOwnership value={item} onChange={patch=>update(item.id,patch)}/>
        <div className="partner-editor-fields"><LogoPreview key={item.logo} item={item}/><div>
          <label className="editor-field">Nama {kind==="supplier"?"supplier":"perusahaan"}<input name={`partner-name-${item.id}`} value={item.name} maxLength={160} placeholder="Nama sesuai identitas perusahaan" onChange={event=>update(item.id,{name:event.target.value})}/></label>
          <label className="editor-field">Unggah logo<input type="file" name={`partner-upload-${item.id}`} accept="image/jpeg,image/png,image/webp" onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value="";if(file)void upload(item,file);}}/><small>{imageUploadHelp} PNG atau WebP transparan disarankan.</small></label>
          <label className="editor-field">Alamat gambar (opsional jika sudah unggah)<input name={`partner-url-${item.id}`} value={item.logo} maxLength={2000} placeholder="https://... atau /images/..." onChange={event=>update(item.id,{logo:event.target.value.trim()})}/><small>Gunakan alamat gambar langsung, bukan halaman website perusahaan.</small></label>
          <label className="editor-publish"><input type="checkbox" name={`partner-published-${item.id}`} checked={item.published} onChange={event=>update(item.id,{published:event.target.checked})}/>Terbit di website</label>
        </div></div>
        <div className="editor-item-actions"><button type="button" disabled={index===0} onClick={()=>change(items=>movePartnerLogo(items,item.id,-1))}>Naik</button><button type="button" disabled={index===rows.length-1} onClick={()=>change(items=>movePartnerLogo(items,item.id,1))}>Turun</button>
          {deleteId===item.id?<><span>Hapus logo dari website?</span><button type="button" className="danger" onClick={()=>{change(items=>items.filter(row=>row.id!==item.id));setDeleteId(null);}}>Ya, hapus</button><button type="button" onClick={()=>setDeleteId(null)}>Batal</button></>:<button type="button" className="danger" onClick={()=>setDeleteId(item.id)}>Hapus</button>}
        </div>
      </details>)}
    </fieldset>
    <p className="editor-footer-note">Urutan mengikuti daftar per jenis logo. Hapus hanya melepas logo dari daftar; berkas unggahan tidak dihapus permanen.</p>
  </div>;
}
