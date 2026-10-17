"use client";
import { imageUploadHelp, uploadCmsFile, videoUploadHelp } from "../lib/cmsUpload";
import ContentOwnership from "./ContentOwnership";
import AdminDialog from "./AdminDialog";
import { useAdminIdentity } from "./AdminIdentity";
import { useRef, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "../data/siteContent";
import { heroSlides, type HeroSlide } from "../data/heroSlides";
import { contentId } from "../data/socialMedia";
import { useAdminWorkspace } from "./AdminWorkspace";
import HeroAnnouncementEditor from "./HeroAnnouncementEditor";

export default function HeroEditor({ initialContent }: { initialContent: SiteContent }) {
  const actor = useAdminIdentity();
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  function update(id: string, patch: Partial<HeroSlide>) { setContent(c => ({ ...c, heroSlides: c.heroSlides.map(s => s.id === id ? { ...s, ...patch } : s) })); setDirty(true); }
  async function upload(id: string, file: File, poster = false) {
    const slide = content.heroSlides.find(s=>s.id===id);
    if (!slide) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const kind = poster ? "image" : slide.type;
      const url = await uploadCmsFile(file, kind, slide.ownerDivision || null);
      update(id, poster ? { poster: url } : { media: url, type: kind });
      setMessage("Unggahan selesai. Simpan perubahan untuk menayangkan.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function save() {
    if (content.heroAnnouncements.some(row=>row.messages.some(text=>!text.trim()))) { setFailed(true); setMessage("Ada tulisan berjalan yang masih kosong. Isi atau hapus baris kosong sebelum menyimpan."); return; }
    setBusy(true); setMessage(""); setFailed(false);
    try { const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base.current }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message); setContent(data); base.current = data; setDirty(false); workspace.refreshDashboard(); setMessage("Hero tersimpan. Buka beranda untuk melihat hasilnya."); }
    catch (error) { setFailed(true); setMessage((error as Error).message); } finally { setBusy(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: "Simpan hero", disabled: !dirty, onSave: save });
  return <div className="content-editor"><aside className="editor-sidebar"><Link href="/admin">← Dashboard</Link><h2>Hero beranda</h2><p>Hero berganti setiap 2 detik. Video tidak diulang setelah selesai.</p><Link href="/" target="_blank">Preview beranda ↗</Link></aside><main className="editor-main"><header className="editor-topbar"><h1>Hero & teks berjalan</h1><button className="editor-save" disabled={busy || !dirty} onClick={save}>{busy ? "Memproses…" : "Simpan hero"}</button></header><div className="editor-content"><p>{imageUploadHelp} {videoUploadHelp} Gunakan gambar poster agar Hero langsung terlihat sebelum video siap.</p>{message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}<fieldset disabled={busy}>
    <HeroAnnouncementEditor content={content} onChange={next=>{setContent(next);setDirty(true);setMessage("");}}/>
    {content.heroSlides.map((slide, index) => <section className="editor-panel" key={slide.id}><div className="editor-panel-title"><h2>Slide {index + 1} · {slide.eyebrow}</h2><button disabled={false} onClick={() => setDeleteId(slide.id)}>Hapus</button></div><ContentOwnership value={slide} onChange={patch=>update(slide.id,patch)}/><label className="admin-checkbox"><input type="checkbox" checked={slide.published ?? true} onChange={e=>update(slide.id,{published:e.target.checked})}/>Terbit</label><div className="editor-grid"><label className="editor-field">Jenis<select value={slide.type} onChange={e => update(slide.id, { type: e.target.value as HeroSlide["type"] })}><option value="image">Gambar</option><option value="video">Video</option></select></label><label className="editor-field">{slide.type === "video" ? "Unggah video MP4" : "Unggah gambar"}<input type="file" accept={slide.type === "video" ? "video/mp4" : "image/jpeg,image/png,image/webp"} onChange={e => { const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void upload(slide.id,file); }} /><small>{slide.type === "video" ? videoUploadHelp : imageUploadHelp}</small></label><label className="editor-field">URL media<input value={slide.media} onChange={e => update(slide.id, { media: e.target.value })} /></label><label className="editor-field">Deskripsi gambar<input value={slide.alt} onChange={e => update(slide.id, { alt: e.target.value })} /></label>{slide.type === "video" && <><label className="editor-field">Unggah poster (maks. 4 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void upload(slide.id,file,true); }} /></label><label className="editor-field">URL poster<input value={slide.poster || ""} onChange={e => update(slide.id, { poster: e.target.value || undefined })} /></label></>}{(["eyebrow","title","accent","description"] as const).map(key => <label key={key} className="editor-field">{{eyebrow:"Label layanan",title:"Judul",accent:"Lanjutan judul",description:"Deskripsi"}[key]}<input value={slide[key]} onChange={e => update(slide.id, { [key]: e.target.value })} /></label>)}{(["primaryAction","secondaryAction"] as const).map(key => <label key={key} className="editor-field">Tombol {key === "primaryAction" ? "utama" : "kedua"}<input aria-label="Label tombol" value={slide[key].label} onChange={e => update(slide.id, { [key]: { ...slide[key], label: e.target.value } })} /><input aria-label="Tujuan tombol" value={slide[key].href} onChange={e => update(slide.id, { [key]: { ...slide[key], href: e.target.value } })} /></label>)}</div><div className="hero-editor-preview">{slide.type === "video" ? <video src={slide.media} poster={slide.poster} controls playsInline preload="metadata" /> : <img src={slide.media} alt={slide.alt} />}</div><div className="editor-item-actions"><button disabled={index === 0} onClick={() => { setContent(c => { const heroSlides = [...c.heroSlides]; [heroSlides[index - 1], heroSlides[index]] = [heroSlides[index], heroSlides[index - 1]]; return { ...c, heroSlides }; }); setDirty(true); }}>↑ Naik</button><button disabled={index === content.heroSlides.length - 1} onClick={() => { setContent(c => { const heroSlides = [...c.heroSlides]; [heroSlides[index + 1], heroSlides[index]] = [heroSlides[index], heroSlides[index + 1]]; return { ...c, heroSlides }; }); setDirty(true); }}>↓ Turun</button></div></section>)}<button className="editor-save" disabled={content.heroSlides.length >= 10} onClick={() => { setContent(c => ({ ...c, heroSlides: [...c.heroSlides, { ...heroSlides[0], ownerDivision:actor.division, published:false, id: contentId() }] })); setDirty(true); }}>+ Tambah slide</button></fieldset></div></main>{deleteId && <AdminDialog title="Hapus slide Hero?" onClose={() => setDeleteId(null)}><p>Slide akan dihapus setelah perubahan disimpan.</p><div className="admin-dialog-actions"><button type="button" onClick={() => setDeleteId(null)}>Batal</button><button type="button" className="admin-danger" onClick={() => { setContent(c => ({ ...c, heroSlides: c.heroSlides.filter(s => s.id !== deleteId) })); setDirty(true); setDeleteId(null); }}>Hapus slide</button></div></AdminDialog>}</div>;
}
