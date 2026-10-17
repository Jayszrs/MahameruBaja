"use client";
import { uploadCmsFile } from "../lib/cmsUpload";
import ContentOwnership from "./ContentOwnership";
import AdminDialog from "./AdminDialog";
import { useAdminIdentity } from "./AdminIdentity";
import { useRef, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "../data/siteContent";
import { heroSlides, heroSlideSchema, type HeroSlide } from "../data/heroSlides";
import { contentId } from "../data/socialMedia";
import { useAdminWorkspace } from "./AdminWorkspace";
import HeroAnnouncementEditor from "./HeroAnnouncementEditor";
import HeroMediaFields from "./HeroMediaFields";

export default function HeroEditor({ initialContent }: { initialContent: SiteContent }) {
  const actor = useAdminIdentity();
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  function change(update: (current: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function update(id: string, patch: Partial<HeroSlide>) { change(current => ({ ...current, heroSlides: current.heroSlides.map(slide => slide.id === id ? { ...slide, ...patch } : slide) })); }
  async function upload(id: string, file: File, poster = false) {
    const slide = content.heroSlides.find(row => row.id === id);
    if (!slide || busy) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const kind = poster || file.type !== "video/mp4" ? "image" : "video";
      const url = await uploadCmsFile(file, kind, slide.ownerDivision || null);
      update(id, poster ? { poster: url } : { media: url, type: kind, ...(kind === "image" ? { poster: undefined } : {}) });
      setMessage("Unggahan selesai. Simpan hero untuk menayangkan perubahan.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  async function save() {
    if (busy) return;
    if (content.heroAnnouncements.some(row => row.messages.some(text => !text.trim()))) { setFailed(true); setMessage("Ada tulisan berjalan yang masih kosong. Isi atau hapus baris kosong sebelum menyimpan."); return; }
    for (const [index, slide] of content.heroSlides.entries()) {
      const parsed = heroSlideSchema.safeParse(slide);
      if (!parsed.success) {
        setFailed(true);
        const first = parsed.error.issues[0];
        setMessage(`Slide ${index + 1}: ${first.path[0] === "media" ? "pilih gambar/video atau masukkan link file yang valid." : first.message}`);
        return;
      }
    }
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base.current }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Hero belum tersimpan. Coba kembali.");
      setContent(data); base.current = data; setDirty(false); workspace.refreshDashboard(); setMessage("Hero tersimpan. Buka beranda untuk melihat hasilnya.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  function move(index: number, offset: number) {
    change(current => { const slides = [...current.heroSlides]; [slides[index], slides[index + offset]] = [slides[index + offset], slides[index]]; return { ...current, heroSlides: slides }; });
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: "Simpan hero", disabled: !dirty, onSave: save });
  return <div className="content-editor">
    <aside className="editor-sidebar"><Link href="/admin">Dashboard</Link><h2>Hero beranda</h2><p>Kelola gambar, video, dan teks berjalan.</p></aside>
    <main className="editor-main">
      <header className="editor-topbar"><h1>Hero & teks berjalan</h1><button type="button" className="editor-save" disabled={busy || !dirty} onClick={save}>{busy ? "Memproses…" : "Simpan hero"}</button></header>
      <div className="editor-content">
        <div className="hero-editor-heading"><div><h2>Hero beranda</h2><p>Tambah slide, pilih gambar atau video, lalu simpan. Gambar berganti setiap 2 detik; video berpindah setelah selesai.</p></div><Link className="admin-secondary" href={actor.division ? `/unit/${actor.division}` : "/"} target="_blank" rel="noopener noreferrer">Buka beranda</Link></div>
        {message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}
        {busy && <p className="editor-notice" role="status">Sedang memproses. Tunggu sampai selesai sebelum meninggalkan halaman.</p>}
        <fieldset disabled={busy}>
          <HeroAnnouncementEditor content={content} onChange={next => change(() => next)} />
          {!content.heroSlides.length && <div className="editor-empty"><h3>Belum ada slide hero</h3><p>Tambahkan slide untuk menampilkan gambar atau video pilihan Anda di beranda.</p></div>}
          {content.heroSlides.map((slide, index) => <section className="editor-panel hero-slide-editor" key={slide.id}>
            <div className="editor-panel-title"><h2>Slide {index + 1} · {slide.eyebrow}</h2><button type="button" onClick={() => setDeleteId(slide.id)}>Hapus slide</button></div>
            <ContentOwnership value={slide} onChange={patch => update(slide.id, patch)} />
            <label className="admin-checkbox"><input type="checkbox" checked={slide.published ?? true} onChange={event => update(slide.id, { published: event.target.checked })} />Terbit di website</label>
            <HeroMediaFields slide={slide} busy={busy} update={patch => update(slide.id, patch)} upload={(file, poster) => upload(slide.id, file, poster)} />
            <div className="editor-grid">
              {(["eyebrow", "title", "accent", "description"] as const).map(key => <label key={key} className="editor-field">{{ eyebrow: "Label layanan", title: "Judul", accent: "Lanjutan judul", description: "Deskripsi" }[key]}<input name={`hero-${key}-${slide.id}`} value={slide[key]} onChange={event => update(slide.id, { [key]: event.target.value })} /></label>)}
              {(["primaryAction", "secondaryAction"] as const).map(key => <div key={key} className="editor-field"><strong>Tombol {key === "primaryAction" ? "utama" : "kedua"}</strong><label>Label tombol<input aria-label={`Label tombol ${key === "primaryAction" ? "utama" : "kedua"}`} value={slide[key].label} onChange={event => update(slide.id, { [key]: { ...slide[key], label: event.target.value } })} /></label><label>Tujuan tombol<input aria-label={`Tujuan tombol ${key === "primaryAction" ? "utama" : "kedua"}`} value={slide[key].href} onChange={event => update(slide.id, { [key]: { ...slide[key], href: event.target.value } })} /></label></div>)}
            </div>
            <div className="editor-item-actions"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Naik</button><button type="button" disabled={index === content.heroSlides.length - 1} onClick={() => move(index, 1)}>Turun</button></div>
          </section>)}
          <button type="button" className="admin-primary" disabled={content.heroSlides.length >= 100} onClick={() => change(current => ({ ...current, heroSlides: [...current.heroSlides, { ...heroSlides[0], ownerDivision: actor.division, published: false, id: contentId() }] }))}>+ Tambah slide</button>
        </fieldset>
      </div>
    </main>
    {deleteId && <AdminDialog title="Hapus slide hero?" onClose={() => setDeleteId(null)}><p>Slide akan dihapus dari website setelah perubahan disimpan. File yang dipakai slide lain tidak ikut dihapus.</p><div className="admin-dialog-actions"><button type="button" disabled={busy} onClick={() => setDeleteId(null)}>Batal</button><button type="button" className="admin-danger" disabled={busy} onClick={() => { change(current => ({ ...current, heroSlides: current.heroSlides.filter(slide => slide.id !== deleteId) })); setDeleteId(null); }}>Hapus slide</button></div></AdminDialog>}
  </div>;
}
