"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "../data/siteContent";
import type { GalleryProject } from "../data/projectGallery";
import { divisions } from "../data/divisionContent";
import { useAdminWorkspace } from "./AdminWorkspace";

export default function GalleryEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(initialContent.galleryProjects[0]?.id || "");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const project = content.galleryProjects.find(p => p.id === selected);
  function change(update: (value: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function updateProject(update: Partial<GalleryProject>) { change(c => ({ ...c, galleryProjects: c.galleryProjects.map(p => p.id === selected ? { ...p, ...update } : p) })); }
  function addProject() {
    if (content.galleryProjects.length >= 80) return;
    const id = crypto.randomUUID();
    change(c => ({ ...c, galleryProjects: [...c.galleryProjects, { id, title: "Proyek baru", category: "Fabrikasi & erection", division: "fabrikasi-erection", description: "", location: "", year: "", photos: [], coverId: "", published: false }] }));
    setSelected(id);
  }
  async function upload(files: FileList | null) {
    if (!files || !project) return;
    const uploadedTo = project.id;
    const queue = Array.from(files);
    if (project.photos.length + queue.length > 40) { setFailed(true); setMessage("Maksimal 40 foto per proyek. Pilih lebih sedikit berkas."); return; }
    if (queue.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) { setFailed(true); setMessage("Gunakan JPG, PNG, atau WebP untuk album proyek."); return; }
    setBusy(true); setFailed(false); setMessage("");
    let count = 0;
    try {
      for (const file of queue) {
        const body = new FormData(); body.set("media", file);
        const response = await fetch("/api/admin/media", { method: "POST", body });
        const data = await response.json();
        if (!response.ok || data.type !== "image") throw new Error(data.message || "Unggah gambar gagal.");
        const id = crypto.randomUUID();
        const photo = { id, src: data.url as string, alt: `${project.title} — ${file.name.replace(/\.[^.]+$/, "").slice(0, 30)}`.slice(0, 200), caption: "" };
        setContent(c => ({ ...c, galleryProjects: c.galleryProjects.map(p => p.id === uploadedTo ? { ...p, photos: [...p.photos, photo], coverId: p.coverId || id } : p) }));
        setDirty(true); count++;
      }
      setMessage(`${count} foto diunggah. Simpan perubahan untuk menerbitkan album.`);
    } catch (error) { setFailed(true); setMessage(`${count ? `${count} foto sudah masuk ke editor. ` : ""}${(error as Error).message} Perubahan belum disimpan.`); }
    finally { setBusy(false); }
  }
  async function save() {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base.current }) });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.message || "Album belum tersimpan.");
      setContent(saved); base.current = saved; setDirty(false); workspace.refreshDashboard(); setMessage("Album tersimpan. Halaman Galeri mengikuti proyek yang diterbitkan.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  function movePhoto(id: string, direction: number) {
    if (!project) return;
    const photos = [...project.photos]; const index = photos.findIndex(p => p.id === id); const next = index + direction;
    if (index < 0 || next < 0 || next >= photos.length) return;
    [photos[index], photos[next]] = [photos[next], photos[index]]; updateProject({ photos });
  }
  function removePhoto(id: string) {
    if (!project || !window.confirm("Hapus foto dari album ini? Berkas unggahan tidak dihapus dari storage.")) return;
    const photos = project.photos.filter(p => p.id !== id);
    updateProject({ photos, coverId: project.coverId === id ? photos[0]?.id || "" : project.coverId, published: photos.length ? project.published : false });
  }
  function moveProject(direction: number) {
    const projects = [...content.galleryProjects]; const index = projects.findIndex(p => p.id === selected); const next = index + direction;
    if (index < 0 || next < 0 || next >= projects.length) return;
    [projects[index], projects[next]] = [projects[next], projects[index]]; change(c => ({ ...c, galleryProjects: projects }));
  }
  function removeProject() {
    if (!project || !window.confirm(`Hapus album ${project.title}? Foto di storage tetap disimpan.`)) return;
    const remaining = content.galleryProjects.filter(p => p.id !== selected);
    change(c => ({ ...c, galleryProjects: remaining })); setSelected(remaining[0]?.id || "");
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: "Simpan perubahan", disabled: !dirty, onSave: save });
  async function selectProject(id: string) {
    if (id === selected || busy || !(await workspace.confirmDiscard())) return;
    if (dirty) { setContent(base.current); setDirty(false); }
    setSelected(id); setMessage("");
  }
  return <div className="content-editor"><aside className="editor-sidebar"><Link className="editor-brand" href="/admin">MAHAMERU <small>CONTENT STUDIO</small></Link><p>GALERI & PROYEK</p><span className="editor-sidebar-link active">Album pengalaman proyek</span><Link className="editor-sidebar-link" href="/admin/produk">Produk & stok divisi</Link><Link className="editor-sidebar-link" href="/admin/konten">Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/promosi">Banner & kegiatan</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><Link href="/proyek" target="_blank">Lihat galeri ↗</Link></div></aside><main className="editor-main">
    <header className="editor-topbar"><span>Workspace / Galeri</span><div><span className="editor-save-state">{dirty ? "Belum disimpan" : "Tersimpan"}</span><button className="editor-save" type="button" onClick={save} disabled={busy || !dirty}>{busy ? "Memproses…" : "Simpan perubahan"}</button></div></header>
    <div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">SATU PROYEK, BANYAK FOTO</p><h1>Dokumentasi yang<br /><em>terhubung.</em></h1><p>Kelola album, unggah beberapa gambar sekaligus, pilih sampul, dan susun urutan foto. Album terbit tampil di Galeri utama dan galeri divisi yang dipilih. Konten company profile dikelola bersama oleh admin.</p></div>
      {message && <div className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</div>}
      <fieldset className="editor-fields" disabled={busy}><div className="gallery-editor-layout"><nav className="gallery-editor-albums" aria-label="Daftar album"><button type="button" className="editor-add" onClick={addProject} disabled={content.galleryProjects.length >= 80}>+ Tambah proyek</button>{content.galleryProjects.map(p => <button type="button" key={p.id} className={p.id === selected ? "is-selected" : ""} aria-pressed={p.id === selected} onClick={() => { void selectProject(p.id); }}><strong>{p.title}</strong><small>{p.published ? "Terbit" : "Draf"} · {p.photos.length} foto</small></button>)}</nav>
        {project ? <section className="editor-panel gallery-editor-project"><div className="editor-panel-title"><h2>{project.title}</h2><span>{project.photos.length} / 40 foto</span></div><div className="editor-grid">
          <label className="editor-field">Nama proyek<input maxLength={160} value={project.title} onChange={e => updateProject({ title: e.target.value })} /></label>
          <label className="editor-field">Kategori<input maxLength={80} value={project.category} onChange={e => updateProject({ category: e.target.value })} /></label>
          <label className="editor-field">Divisi<select value={project.division} onChange={e => updateProject({ division: e.target.value as GalleryProject["division"] })}>{divisions.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>
          <label className="editor-field">Lokasi (opsional)<input maxLength={160} value={project.location} onChange={e => updateProject({ location: e.target.value })} /></label>
          <label className="editor-field">Tahun / periode (opsional)<input maxLength={30} value={project.year} onChange={e => updateProject({ year: e.target.value })} /></label>
          <label className="editor-checkbox"><input type="checkbox" checked={project.published} disabled={!project.photos.length} onChange={e => updateProject({ published: e.target.checked })} />Terbitkan album</label>
        </div><label className="editor-field">Deskripsi proyek<textarea maxLength={2000} rows={4} value={project.description} onChange={e => updateProject({ description: e.target.value })} /></label>
        <div className="gallery-editor-order"><button type="button" onClick={() => moveProject(-1)} disabled={content.galleryProjects[0]?.id === selected}>↑ Urutan album</button><button type="button" onClick={() => moveProject(1)} disabled={content.galleryProjects.at(-1)?.id === selected}>↓ Urutan album</button><button type="button" className="editor-delete" onClick={removeProject}>Hapus album</button></div>
        <label className="editor-field gallery-upload">Tambah beberapa foto<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(event.currentTarget.files); event.currentTarget.value = ""; }} /><small>JPG, PNG, WebP. Maksimal 4 MB per foto di Vercel, 30 MB lokal. Sampul dan urutan dapat diganti setelah unggah.</small></label>
        <div className="gallery-editor-photos">{project.photos.map((photo, number) => <article key={photo.id}><div className="gallery-editor-photo"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 90vw, 300px" /><span>{number + 1}</span></div>
          <label className="editor-field">Deskripsi gambar (alt)<input maxLength={200} value={photo.alt} onChange={e => updateProject({ photos: project.photos.map(p => p.id === photo.id ? { ...p, alt: e.target.value } : p) })} /></label>
          <label className="editor-field">Keterangan foto<textarea maxLength={400} rows={2} value={photo.caption} onChange={e => updateProject({ photos: project.photos.map(p => p.id === photo.id ? { ...p, caption: e.target.value } : p) })} /></label>
          <label className="editor-checkbox"><input type="radio" name={`cover-${project.id}`} checked={project.coverId === photo.id} onChange={() => updateProject({ coverId: photo.id })} />Sampul album</label>
          <div className="gallery-photo-actions"><button type="button" disabled={number === 0} onClick={() => movePhoto(photo.id, -1)}>↑ Geser</button><button type="button" disabled={number === project.photos.length - 1} onClick={() => movePhoto(photo.id, 1)}>↓ Geser</button><button type="button" className="editor-delete" onClick={() => removePhoto(photo.id)}>Hapus</button></div>
        </article>)}</div>{!project.photos.length && <p className="gallery-editor-empty">Tambahkan foto pertama untuk mulai menyusun album.</p>}</section> : <p className="gallery-editor-empty">Belum ada album. Klik “Tambah proyek” untuk mulai.</p>}
      </div></fieldset>
    </div></main></div>;
}
