"use client";
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import { useState } from "react";
import type { SiteContent } from "../data/siteContent";
import { contentOwner } from "../data/divisionCms";
import { defaultAnnouncements } from "../data/heroAnnouncements";
import { contentId } from "../data/socialMedia";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import HeroAnnouncementTicker from "./HeroAnnouncementTicker";

export default function HeroAnnouncementEditor({ content, onChange }: { content:SiteContent; onChange:(content:SiteContent)=>void }) {
  const actor=useAdminIdentity();const {divisions}=useDivisionDirectory();
  const [site,setSite]=useState(actor.division || "main");
  const owner=site==="main"?null:site;
  const division=divisions.find(item=>item.slug===owner);
  const rows=content.heroAnnouncements || [];
  const existing=rows.find(item=>contentOwner(item)===owner);
  const fallback=division?[...division.offerings.slice(0,4),"Tanyakan pilihan, harga & jadwal kepada tim divisi"]:defaultAnnouncements;
  const messages=existing?.messages || fallback;
  function update(patch:Partial<SiteContent["heroAnnouncements"][number]>) {
    const next={id:existing?.id || contentId(),ownerDivision:owner,published:true,messages,...patch};
    onChange({...content,heroAnnouncements:existing?rows.map(row=>row.id===existing.id?next:row):[...rows,next]});
  }
  return <section className="editor-panel hero-announcement-editor" id="teks-berjalan"><div className="editor-panel-title"><div><span className="hero-step-label">Langkah 1</span><h2>Teks berjalan di bawah hero</h2><p>Info material, layanan, atau promo singkat. Teks bergerak ke kanan dalam satu baris, termasuk di HP.</p></div></div>
    <label className="editor-field">Website<select name="announcement-site" value={site} disabled={Boolean(actor.division)} onChange={event=>setSite(event.target.value)}>{!actor.division&&<option value="main">Website utama</option>}{divisions.filter(d=>!actor.division || d.slug===actor.division).map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label>
    <p className="admin-field-help">Contoh: “Sedia pilihan besi untuk bangunan, tanya stok hari ini” atau informasi promo yang sudah disetujui. Jangan menjanjikan stok atau diskon yang belum dikonfirmasi.</p>
    <button type="button" className="admin-secondary" disabled={messages.length>=12} onClick={()=>{update({messages:["",...messages]});focusEditorRecord("announcement-messages");}}>+ Tambah tulisan</button>
    <ol className="announcement-editor-list" id="announcement-messages">{messages.map((message,index)=><li key={index}><label className="editor-field">Informasi {index+1}<input name={`announcement-${index}`} maxLength={160} value={message} onChange={event=>update({messages:messages.map((text,n)=>n===index?event.target.value:text)})}/></label><button type="button" className="admin-secondary" aria-label={`Hapus informasi ${index+1}`} onClick={()=>update({messages:messages.filter((_,n)=>n!==index)})}>Hapus</button></li>)}</ol>

    <p className="admin-field-help">Maksimal 12 informasi, 160 karakter per informasi. Isi atau hapus setiap baris kosong, lalu klik Simpan hero.</p>
    <AdminOrderList label="Urutan informasi" items={messages.map((text,index)=>({id:String(index),title:text || "Informasi baru"}))} onMove={(from,to)=>update({messages:moveBefore(messages.map((text,index)=>({id:String(index),text})),from,to).map(row=>row.text)})}/>
    <h3>Pratinjau strip</h3><HeroAnnouncementTicker messages={messages}/>
  </section>;
}
