"use client";
import { imageUploadHelp, uploadCmsFile, validateUploadFile } from "../lib/cmsUpload";
import ContentOwnership from "./ContentOwnership";
import { useAdminIdentity } from "./AdminIdentity";

import { useDivisionDirectory } from "./DivisionDirectory";

import Link from "next/link";
import Image from "./CmsImage";
import { useRef, useState } from "react";
import type { SiteContent } from "../data/siteContent";
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import { galleryProjectsSchema } from "../data/projectGallery";
import type { GalleryProject } from "../data/projectGallery";

import { useAdminWorkspace } from "./AdminWorkspace";

export default function GalleryEditor({ initialContent }: { initialContent: SiteContent }) {
  const actor = useAdminIdentity();
  const { divisions } = useDivisionDirectory();
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(initialContent.galleryProjects[0]?.id || "");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const project = content.galleryProjects.find(p => p.id === selected);
  function change(update: (value: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function updateProject(update: Partial<GalleryProject>) { change(c => ({ ...c, galleryProjects: c.galleryProjects.map(p => p.id === selected ? { ...p, ...update, published: true } : p) })); }
  function addProject() {
    if (content.galleryProjects.length >= 80) return;
    const id = crypto.randomUUID();
    change(c => ({ ...c, galleryProjects: [{ id, title: "Proyek baru", category: "Fabrikasi & erection", division: actor.division || divisions[0]?.slug || "fabrikasi-erection", ownerDivision:actor.division, description: "", location: "", year: "", photos: [], coverId: "", published: true }, ...c.galleryProjects] }));
    setSelected(id); focusEditorRecord("gallery-project-form");
  }
  async function upload(files: FileList | null) {
    if (!files || !project) return;
    const uploadedTo = project.id;
    const queue = Array.from(files);
    if (project.photos.length + queue.length > 40) { setFailed(true); setMessage("Maksimal 40 foto per proyek. Pilih lebih sedikit berkas."); return; }
    try { for (const file of queue) validateUploadFile(file, "image"); }
    catch (error) { setFailed(true); setMessage(`${(error as Error).message} Belum ada foto dari pilihan ini yang diunggah.`); return; }
    setBusy(true); setFailed(false); setMessage("");
    let count = 0;
    try {
      for (const file of queue) {
        const url = await uploadCmsFile(file, "image", project.ownerDivision || null);
        const id = crypto.randomUUID();
        const photo = { id, src: url, alt: `${project.title} — ${file.name.replace(/\.[^.]+$/, "").slice(0, 30)}`.slice(0, 200), caption: "" };
        setContent(c => ({ ...c, galleryProjects: c.galleryProjects.map(p => p.id === uploadedTo ? { ...p, photos: [photo, ...p.photos], coverId: p.coverId || id, published: true } : p) }));
        setDirty(true); count++;
      }
      setMessage(`${count} foto diunggah. Simpan perubahan untuk menampilkan album di website.`);
    } catch (error) {
      const remaining = queue.slice(count + 1).map(file => file.name);
      setFailed(true);
      setMessage(`${count} dari ${queue.length} foto berhasil masuk ke editor. ${queue[count]?.name || "Foto"} gagal: ${(error as Error).message}${remaining.length ? ` ${remaining.length} foto belum dicoba: ${remaining.join(", ")}.` : ""} Foto yang berhasil belum disimpan ke CMS; simpan perubahan, lalu unggah ulang hanya foto yang gagal atau belum dicoba.`);
    }
    finally { setBusy(false); }
  }
  async function save() {
    if (busy) return;
    const parsed = galleryProjectsSchema.safeParse(content.galleryProjects);
    if (!parsed.success) { setFailed(true); setMessage(parsed.error.issues[0]?.message || "Lengkapi nama proyek dan minimal satu foto sebelum menyimpan."); return; }
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base.current }) });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.message || "Album belum tersimpan.");
      setContent(saved); base.current = saved; setDirty(false); workspace.refreshDashboard(); setMessage("Album tersimpan dan sudah tampil di website.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  function removePhoto(id: string) {
    if (!project || !window.confirm("Hapus foto dari album ini? Berkas unggahan tidak dihapus dari storage.")) return;
    const photos = project.photos.filter(p => p.id !== id);
    updateProject({ photos, coverId: project.coverId === id ? photos[0]?.id || "" : project.coverId, published: true });
  }
  function removeProject() {
    if (!project || !window.confirm(`Hapus album ${project.title}? Foto di storage tetap disimpan.`)) return;
    const remaining = content.galleryProjects.filter(p => p.id !== selected);
    change(c => ({ ...c, galleryProjects: remaining })); setSelected(remaining[0]?.id || "");
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: "Simpan perubahan", disabled: !dirty, onSave: save });
  function selectProject(id: string) {
    if (busy) return;
    setSelected(id); setMessage("");
    focusEditorRecord("gallery-project-form");
  }
  return <div className="content-editor"><aside className="editor-sidebar"><Link className="editor-brand" href="/admin">MAHAMERU <small>CONTENT STUDIO</small></Link><p>GALERI & PROYEK</p><span className="editor-sidebar-link active">Album pengalaman proyek</span><Link className="editor-sidebar-link" href="/admin/produk">Produk & stok divisi</Link><Link className="editor-sidebar-link" href="/admin/konten">Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/promosi">Banner & kegiatan</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><Link href="/proyek" target="_blank">Lihat galeri ↗</Link></div></aside><main className="editor-main">
    <header className="editor-topbar"><span>Workspace / Galeri</span><div><span className="editor-save-state">{dirty ? "Belum disimpan" : "Tersimpan"}</span><button className="editor-save" type="button" onClick={save} disabled={busy || !dirty}>{busy ? "Memproses…" : "Simpan perubahan"}</button></div></header>
    <div className="editor-content"><div className="editor-title"><h1>Galeri & proyek</h1><p>Kelola album, unggah beberapa gambar sekaligus, pilih sampul, dan susun urutan foto. Perubahan langsung tampil di galeri setelah disimpan.</p></div>
      {message && <div className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</div>}
      {busy && <p className="editor-notice" role="status">Sedang mengunggah atau menyimpan album. Tunggu hingga selesai.</p>}
      <fieldset className="editor-fields" disabled={busy}><div className="gallery-editor-layout"><nav className="gallery-editor-albums" aria-label="Daftar album"><button type="button" className="editor-add" onClick={addProject} disabled={content.galleryProjects.length >= 80}>+ Tambah proyek</button><AdminOrderList label="Urutan album" disabled={busy} selected={selected} items={content.galleryProjects.map(p => ({ id: p.id, title: p.title, detail: `${p.photos.length} foto`, image: p.photos.find(photo => photo.id === p.coverId)?.src || p.photos[0]?.src }))} onSelect={selectProject} onMove={(from, to) => change(c => ({ ...c, galleryProjects: moveBefore(c.galleryProjects, from, to) }))} /></nav>
        {project ? <section className="editor-panel gallery-editor-project" id="gallery-project-form"><div className="editor-panel-title"><h2>{project.title}</h2><span>{project.photos.length} / 40 foto</span></div><ContentOwnership value={project} onChange={updateProject}/><div className="editor-grid">
          <label className="editor-field">Nama proyek<input maxLength={160} value={project.title} onChange={e => updateProject({ title: e.target.value })} /></label>
          <label className="editor-field">Kategori<input maxLength={80} value={project.category} onChange={e => updateProject({ category: e.target.value })} /></label>
          <label className="editor-field">Divisi<select value={project.division} onChange={e => updateProject({ division: e.target.value as GalleryProject["division"] })}>{divisions.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>
          <label className="editor-field">Lokasi (opsional)<input maxLength={160} value={project.location} onChange={e => updateProject({ location: e.target.value })} /></label>
          <label className="editor-field">Tahun / periode (opsional)<input maxLength={30} value={project.year} onChange={e => updateProject({ year: e.target.value })} /></label>
        </div><label className="editor-field">Deskripsi proyek<textarea maxLength={2000} rows={4} value={project.description} onChange={e => updateProject({ description: e.target.value })} /></label>
        <div className="gallery-editor-order"><button type="button" className="editor-delete" onClick={removeProject}>Hapus album</button></div>
        <label className="editor-field gallery-upload">Tambah beberapa foto<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(event.currentTarget.files); event.currentTarget.value = ""; }} /><small>{imageUploadHelp} Sampul dan urutan dapat diganti setelah unggah.</small></label>
        <AdminOrderList label="Urutan foto" disabled={busy} items={project.photos.map(photo => ({ id: photo.id, title: photo.alt, image: photo.src }))} onMove={(from, to) => updateProject({ photos: moveBefore(project.photos, from, to) })} />
        <div className="gallery-editor-photos">{project.photos.map((photo, number) => <article key={photo.id}><div className="gallery-editor-photo"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 90vw, 300px" /><span>{number + 1}</span></div>
          <label className="editor-field">Deskripsi gambar (alt)<input maxLength={200} value={photo.alt} onChange={e => updateProject({ photos: project.photos.map(p => p.id === photo.id ? { ...p, alt: e.target.value } : p) })} /></label>
          <label className="editor-field">Keterangan foto<textarea maxLength={400} rows={2} value={photo.caption} onChange={e => updateProject({ photos: project.photos.map(p => p.id === photo.id ? { ...p, caption: e.target.value } : p) })} /></label>
          <label className="editor-checkbox"><input type="radio" name={`cover-${project.id}`} checked={project.coverId === photo.id} onChange={() => updateProject({ coverId: photo.id })} />Sampul album</label>
          <div className="gallery-photo-actions"><button type="button" className="editor-delete" onClick={() => removePhoto(photo.id)}>Hapus</button></div>
        </article>)}</div>{!project.photos.length && <p className="gallery-editor-empty">Tambahkan foto pertama untuk mulai menyusun album.</p>}</section> : <p className="gallery-editor-empty">Belum ada album. Klik “Tambah proyek” untuk mulai.</p>}
      </div></fieldset>
    </div></main></div>;
}
