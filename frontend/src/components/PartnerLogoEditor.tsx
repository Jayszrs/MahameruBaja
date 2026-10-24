"use client";
import { useRef, useState } from "react";
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import Image from "./CmsImage";
import ContentOwnership from "./ContentOwnership";
import AdminViewTabs from "./AdminViewTabs";
import { useAdminIdentity } from "./AdminIdentity";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import { imageUploadHelp, uploadCmsFile } from "../lib/cmsUpload";
import { contentId } from "../data/socialMedia";
import { contentOwner, assetUrl } from "../data/divisionCms";
import { partnerLogoListSchema, type PartnerLogo } from "../data/partnerLogos";
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
  const [newId,setNewId]=useState("");
  const [selectedIds,setSelectedIds]=useState<string[]>([]);
  const kind=tab==="suppliers"?"supplier":"client";
  const rows=content.partnerLogos.filter(row=>row.kind===kind).sort((a,b)=>Number(a.published)-Number(b.published));
  function change(update:(rows:PartnerLogo[])=>PartnerLogo[]) {setContent(current=>({...current,partnerLogos:update(current.partnerLogos)}));setDirty(true);setMessage("");}
  function update(id:string,patch:Partial<PartnerLogo>) {change(items=>items.map(item=>item.id===id?{...item,...patch}:item));}
  async function upload(item:PartnerLogo,file:File) {
    setBusy(true);setFailed(false);setMessage("");
    try {const logo=await uploadCmsFile(file,"image",contentOwner(item));update(item.id,{logo});setMessage("Logo diunggah. Simpan perubahan untuk menampilkannya di website.");}
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
      setContent(result);base.current=result;setDirty(false);workspace.refreshDashboard();setMessage("Tersimpan. Logo sudah diperbarui di website.");
    } catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}
  }
  const workspace=useAdminWorkspace({dirty,busy,label:"Simpan logo",disabled:!dirty,onSave:save});
  return <div className="partner-logo-editor">
    <div className="admin-page-heading"><div><h1>Supplier & perusahaan rekanan</h1><p>Kelola logo asli pemasok dan perusahaan yang pernah bekerja sama. Simpan logo untuk langsung menampilkannya di website.</p></div></div>
    <AdminViewTabs value={tab} onChange={value=>{setTab(value);setDeleteId(null);setSelectedIds([]);}} disabled={busy} label="Jenis logo" options={[{value:"suppliers",label:"Supplier"},{value:"clients",label:"Perusahaan rekanan"}]}/>
    {message&&<p className={`editor-notice ${failed?"error":"success"}`} role={failed?"alert":"status"}>{message}</p>}
    {busy&&<p className="editor-notice" role="status">Sedang mengunggah logo atau menyimpan perubahan…</p>}
    <fieldset className="editor-fields" disabled={busy}>
      {kind==="supplier"&&actor.role==="super_admin"&&<section className="editor-panel"><div className="editor-panel-title"><div><h2>Logo supplier di halaman utama</h2><p>{content.supplierLogosHomeVisible?"Bagian logo supplier sedang tampil di website.":"Bagian logo supplier disembunyikan sementara; pengaturan dan logo tetap tersimpan."}</p></div><button type="button" className="admin-secondary" aria-pressed={!content.supplierLogosHomeVisible} onClick={()=>{setContent(value=>({...value,supplierLogosHomeVisible:!value.supplierLogosHomeVisible}));setDirty(true);setMessage("");}}>{content.supplierLogosHomeVisible?"Sembunyikan bagian supplier":"Tampilkan bagian supplier"}</button></div></section>}
      <div className="editor-list-heading"><div><h2>{kind==="supplier"?"Logo supplier":"Logo perusahaan rekanan"} <span>{rows.length}</span></h2><p>Draf tampil paling atas agar mudah ditemukan.</p></div><div className="editor-item-actions"><button type="button" className="admin-secondary" disabled={!rows.some(row=>!row.published&&row.logo)} onClick={()=>change(items=>items.map(row=>row.kind===kind&&row.logo?{...row,published:true}:row))}>Terbitkan logo siap</button><button type="button" className="admin-secondary" disabled={!rows.some(row=>row.published)} onClick={()=>change(items=>items.map(row=>row.kind===kind?{...row,published:false}:row))}>Jadikan draf semua</button><button type="button" className="admin-danger" disabled={!selectedIds.length} onClick={()=>{if(window.confirm(`Hapus ${selectedIds.length} logo terpilih? Perubahan berlaku setelah disimpan.`)){change(items=>items.filter(row=>!selectedIds.includes(row.id)));setSelectedIds([]);}}}>Hapus pilihan ({selectedIds.length})</button><button type="button" disabled={content.partnerLogos.length>=100} onClick={()=>{const id=contentId();setNewId(id);change(items=>[{id,kind,name:"",logo:"",published:false,ownerDivision:actor.division},...items]);focusEditorRecord(`partner-${id}`);}}>+ Tambah logo</button></div></div>
      {!rows.length&&<div className="editor-empty"><h3>Belum ada logo {kind==="supplier"?"supplier":"rekanan"}.</h3><p>Tambahkan logo asli, periksa namanya, lalu simpan.</p></div>}
      <AdminOrderList label="Urutan logo" disabled={busy} items={rows.map(item=>({id:item.id,title:item.name || "Logo baru",image:item.logo}))} onSelect={id=>focusEditorRecord(`partner-${id}`)} onMove={(from,to)=>change(items=>{const ordered=moveBefore(rows,from,to);let index=0;return items.map(row=>row.kind===kind?ordered[index++]:row);})}/>
      {rows.map(item=><details className="editor-panel partner-editor-record" key={item.id} id={`partner-${item.id}`} open={rows.length===1 || item.id===newId}><summary><strong>{item.name || "Logo tanpa nama"}</strong><span className={`admin-status-pill${item.published?"":" draft"}`}>{item.published?"Terbit":"Draf"}</span></summary>
        <label className="partner-bulk-select"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={event=>setSelectedIds(ids=>event.target.checked?[...ids,item.id]:ids.filter(id=>id!==item.id))}/><span>Pilih untuk tindakan massal</span></label>
        <ContentOwnership value={item} onChange={patch=>update(item.id,patch)}/>
        <div className="partner-editor-fields"><LogoPreview key={item.logo} item={item}/><div>
          <label className="editor-field">Nama {kind==="supplier"?"supplier":"perusahaan"}<input name={`partner-name-${item.id}`} value={item.name} maxLength={160} placeholder="Nama sesuai identitas perusahaan" onChange={event=>update(item.id,{name:event.target.value})}/></label>
          <label className="editor-field">Unggah logo<input type="file" name={`partner-upload-${item.id}`} accept="image/jpeg,image/png,image/webp" onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value="";if(file)void upload(item,file);}}/><small>{imageUploadHelp} PNG atau WebP transparan disarankan.</small></label>
          <label className="editor-field">Alamat gambar (opsional jika sudah unggah)<input name={`partner-url-${item.id}`} value={item.logo} maxLength={2000} placeholder="https://... atau /images/..." onChange={event=>update(item.id,{logo:event.target.value.trim()})}/><small>Gunakan alamat gambar langsung, bukan halaman website perusahaan.</small></label>
        </div></div>
        <div className="editor-item-actions">
          <button type="button" className="admin-secondary" disabled={item.published&&!item.logo} onClick={()=>update(item.id,{published:!item.published})}>{item.published?"Jadikan draf":"Terbitkan logo"}</button>
          {deleteId===item.id?<><span>Hapus logo dari website?</span><button type="button" className="danger" onClick={()=>{change(items=>items.filter(row=>row.id!==item.id));setDeleteId(null);}}>Ya, hapus</button><button type="button" onClick={()=>setDeleteId(null)}>Batal</button></>:<button type="button" className="danger" onClick={()=>setDeleteId(item.id)}>Hapus</button>}
        </div>
      </details>)}
    </fieldset>
    <p className="editor-footer-note">Urutan mengikuti daftar per jenis logo. Hapus hanya melepas logo dari daftar; berkas unggahan tidak dihapus permanen.</p>
  </div>;
}
