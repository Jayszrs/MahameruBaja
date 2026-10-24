"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "../data/siteContent";
import { textPages, normalizeWebsiteText, type TextPage } from "../data/websiteTexts";
import { choicesForWebsite,choiceOnPage,textAreaNames,type OwnedWebsiteTextChoice } from "../data/websiteTextChoices";
import catalog from "../data/websiteTextCatalog.json";
import { contentId } from "../data/socialMedia";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import { useAdminWorkspace } from "./AdminWorkspace";
import { contentOwner } from "../data/divisionCms";

export default function WebsiteTextEditor({ initialContent, articleChoices=[] }: { initialContent:SiteContent; articleChoices?:OwnedWebsiteTextChoice[] }) {
  const actor=useAdminIdentity();const {divisions}=useDivisionDirectory();
  const [content,setContent]=useState(initialContent);const base=useRef(initialContent);
  const [site,setSite]=useState(actor.division || "main");const [page,setPage]=useState<TextPage>("all");
  const [query,setQuery]=useState("");const [area,setArea]=useState("all");const [limit,setLimit]=useState(24);
  const [source,setSource]=useState("");const [replacement,setReplacement]=useState("");
  const [dirty,setDirty]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [failed,setFailed]=useState(false);
  const owner=site==="main"?null:site;const division=divisions.find(d=>d.slug===owner);
  const owned=content.websiteTexts.filter(row=>contentOwner(row)===owner);
  const rows=owned.filter(row=>row.page===page);
  const choices=choicesForWebsite(catalog,division,content.heroSlides.filter(slide=>!owner || contentOwner(slide)===owner),owned,content,divisions,articleChoices,page).filter(choice=>choiceOnPage(choice,page,division));
  const found=choices.filter(choice=>(area==="all" || choice.area===area || choice.areas?.includes(area)) && `${choice.source} ${owned.filter(row=>normalizeWebsiteText(row.source)===choice.source).map(row=>row.replacement).join(' ')}`.toLocaleLowerCase('id').includes(normalizeWebsiteText(query).toLocaleLowerCase('id')));
  function update(next:SiteContent) {setContent(next);setDirty(true);setMessage("");}
  function edit(original:string,value:string) {
    const normalized=normalizeWebsiteText(original);const existing=rows.find(row=>normalizeWebsiteText(row.source)===normalized);
    const inherited=page!=="all"&&owned.find(row=>row.page==="all"&&normalizeWebsiteText(row.source)===normalized);
    if(value===original && (!inherited || inherited.replacement===original)) {if(existing)update({...content,websiteTexts:content.websiteTexts.filter(row=>row.id!==existing.id)});return;}
    if(!existing && content.websiteTexts.length>=2000) {setFailed(true);setMessage("Daftar perubahan penuh. Hapus penggantian yang tidak diperlukan sebelum menambah tulisan baru.");return;}
    const row={id:existing?.id || contentId(),ownerDivision:owner,page,source:normalized,replacement:value,published:true};
    update({...content,websiteTexts:existing?content.websiteTexts.map(item=>item.id===row.id?row:item):[...content.websiteTexts,row]});
  }
  async function save() {
    if(content.websiteTexts.some(row=>!row.replacement.trim())) {setFailed(true);setMessage("Ada tulisan baru yang masih kosong. Isi teksnya atau kembalikan ke tulisan bawaan.");return;}
    if(source.trim() || replacement.trim()) {setFailed(true);setMessage("Tambahkan teks khusus ke daftar atau kosongkan kolomnya sebelum menyimpan.");return;}
    setBusy(true);setFailed(false);setMessage("");
    try {
      const response=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...content,_base:base.current})});
      const next=await response.json();if(!response.ok)throw new Error(next.message || "Teks belum tersimpan. Coba lagi.");
      setContent(next);base.current=next;setDirty(false);workspace.refreshDashboard();setMessage("Teks tersimpan. Buka halaman website untuk melihat hasilnya.");
    }catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}
  }
  const workspace=useAdminWorkspace({dirty:dirty || Boolean(source || replacement),busy,label:"Simpan teks website",disabled:!dirty,onSave:save});
  return <div className="admin-management website-copy-editor"><header className="admin-page-heading"><div><p className="industrial-eyebrow">ISI WEBSITE</p><h1>Edit kata-kata website</h1><p>Pilih website dan halaman. Ubah tulisan langsung di kolomnya, lalu simpan. Tautan dan fungsi tombol tetap sama.</p></div><Link className="admin-secondary" href={owner?`/unit/${owner}`:"/"} target="_blank" rel="noopener noreferrer">Buka website</Link></header>
    {message&&<p role={failed?"alert":"status"} className={`editor-notice ${failed?"error":"success"}`}>{message}</p>}
    <fieldset disabled={busy} className="website-copy-fieldset"><section className="website-copy-filters editor-panel"><div className="text-editor-controls"><label className="editor-field">Website<select name="copy-site" value={site} disabled={Boolean(actor.division)} onChange={event=>{setSite(event.target.value);setArea("all");setLimit(24);}}>{!actor.division&&<option value="main">Website utama</option>}{divisions.filter(d=>!actor.division || d.slug===actor.division).map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label><label className="editor-field">Halaman<select name="copy-page" value={page} onChange={event=>{setPage(event.target.value as TextPage);setArea("all");setLimit(24);}}>{Object.entries(textPages).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="editor-field">Bagian<select name="copy-area" value={area} onChange={event=>{setArea(event.target.value);setLimit(24);}}><option value="all">Semua bagian</option>{[...new Set(choices.flatMap(choice=>choice.areas || [choice.area]))].map(key=><option key={key} value={key}>{textAreaNames[key] || key.replace(/Page$|Section$/g,"")}</option>)}</select></label></div>
    <label className="editor-field">Cari tulisan<input name="copy-search" type="search" value={query} placeholder="Misalnya: Punya gambar struktur, hubungi, layanan" onChange={event=>{setQuery(event.target.value);setLimit(24);}}/></label><div className="website-copy-count"><p role="status">{found.length} tulisan ditemukan · {rows.length} penggantian untuk pilihan halaman ini</p><button type="button" className="admin-secondary" onClick={()=>{setQuery("");setArea("all");setLimit(24);}}>Bersihkan pencarian</button></div></section>
    <p className="website-copy-help">Kalimat judul dan bagian berwarna merah diedit terpisah. Pilih “Semua halaman” agar satu penggantian dipakai di seluruh halaman website ini. Penggantian khusus halaman akan didahulukan.</p>
    <div className="website-copy-grid">{found.slice(0,limit).map(choice=>{const row=rows.find(item=>normalizeWebsiteText(item.source)===choice.source);const inherited=owned.find(item=>item.page==="all"&&normalizeWebsiteText(item.source)===choice.source);const value=row?.replacement ?? inherited?.replacement ?? choice.source;const websiteName=division?.name || "Website utama";return <section className={`text-editor-card${row?" is-edited":""}`} key={choice.source}><header><span>{websiteName} › {textPages[page]} › {textAreaNames[choice.area] || choice.area}</span>{row&&<small>Diubah untuk halaman ini</small>}</header><details><summary>Lihat tulisan bawaan</summary><p className="text-editor-original">{choice.source}</p></details><label className="editor-field">Tulisan yang ditampilkan<textarea rows={choice.source.length>180?5:3} name={`copy-${choice.source.slice(0,30)}`} value={value} maxLength={5000} onChange={event=>edit(choice.source,event.target.value)}/></label><button type="button" className="admin-secondary" disabled={!row} onClick={()=>update({...content,websiteTexts:content.websiteTexts.filter(item=>item.id!==row?.id)})}>{inherited&&page!=="all"?"Ikuti tulisan semua halaman":"Kembalikan tulisan bawaan"}</button></section>;})}</div>
    {!found.length&&<p className="admin-inline-empty">Tulisan belum ditemukan. Pilih semua bagian/halaman, atau tambahkan teks khusus di bawah dengan menyalin tulisan dari website.</p>}
    {found.length>limit&&<button className="admin-secondary website-copy-more" type="button" onClick={()=>setLimit(count=>count+24)}>Tampilkan 24 tulisan berikutnya</button>}
    <details className="editor-panel website-copy-custom"><summary>Teks khusus yang belum ada di daftar</summary><p>Salin satu bagian tulisan dari website. Untuk judul dua warna, salin masing-masing bagian secara terpisah.</p><label className="editor-field">Tulisan asli<textarea name="copy-custom-source" rows={2} value={source} maxLength={5000} onChange={event=>setSource(event.target.value)}/></label><label className="editor-field">Tulisan baru<textarea name="copy-custom-replacement" rows={3} value={replacement} maxLength={5000} onChange={event=>setReplacement(event.target.value)}/></label><button className="admin-secondary" type="button" disabled={!source.trim()||!replacement.trim()} onClick={()=>{edit(source,replacement);setSource("");setReplacement("");}}>Tambahkan penggantian</button></details>
    <div className="website-copy-links"><Link href="/admin/hero">Gambar & susunan hero</Link><Link href="/admin/divisi">Profil & layanan divisi</Link><Link href="/admin/promosi?view=popup">Poster & promo</Link></div>
    <div className="admin-form-actions website-copy-save"><p>{dirty?"Perubahan belum disimpan.":"Semua perubahan tersimpan."}</p><button type="button" className="admin-primary" disabled={!dirty} onClick={()=>void save()}>{busy?"Menyimpan…":"Simpan teks website"}</button></div></fieldset>
  </div>;
}
