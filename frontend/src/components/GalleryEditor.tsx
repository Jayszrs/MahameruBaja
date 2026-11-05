"use client";
import { uploadCmsFile, validateUploadFile } from "../lib/cmsUpload";
import { useAdminIdentity } from "./AdminIdentity";

import { useDivisionDirectory } from "./DivisionDirectory";

import Link from "next/link";
import Image from "./CmsImage";
import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "../data/siteContent";
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import { galleryProjectsSchema } from "../data/projectGallery";
import type { GalleryProject } from "../data/projectGallery";
import { visibleInDivision } from "../data/divisionCms";
import { contentId } from "../data/socialMedia";

import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import AdminViewTabs from "./AdminViewTabs";
import SectionContentEditor from "./SectionContentEditor";
import { sectionListSchema, type SectionListRow } from "../data/sectionLists";

export default function GalleryEditor({ initialContent, initialKind, workspaceSaveLabel, ownerDivision = null, allowedDivisions, excludeKinds, defaultDivision, textPage = "home", textUrl = "/", textSection = "albums", mainCategories = false }: { initialContent: SiteContent; initialKind?: "portfolio" | "design"; workspaceSaveLabel?: string; ownerDivision?: string | null; allowedDivisions?: string[]; excludeKinds?: GalleryProject["kind"][]; defaultDivision?: string; textPage?: "home" | "gallery" | "services"; textUrl?: string; textSection?: "albums" | "portfolio"; mainCategories?: boolean }) {
  const actor = useAdminIdentity();
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const queryKind = params?.get("kind");
  const [kind,setKind]=useAdminView("kind",["all","portfolio","design","activity"] as const,initialKind || (queryKind === "design" || queryKind === "portfolio" ? queryKind : "all"));
  const albumLabels={all:"Seluruh album website",portfolio:"Portofolio hasil pekerjaan",design:"Jelajahi desain",activity:"Galeri › Kegiatan Mahameru"};
  const albumLabel=kind === "all" ? "Seluruh album website" : albumLabels[kind];
  const { divisions } = useDivisionDirectory();
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(initialContent.galleryProjects[0]?.id || "");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [newCategory,setNewCategory]=useState<string|null>(null);
  const [contentMode,setContentMode]=useState<"all"|"image"|"text">("all");
  const [galleryStage,setGalleryStage]=useState<"categories"|"albums">("categories");
  const [selectedCategory,setSelectedCategory]=useState("");
  const filtered=content.galleryProjects.filter(p=>(ownerDivision ? visibleInDivision(p, ownerDivision) : allowedDivisions ? allowedDivisions.includes(p.division) : true) && (!excludeKinds?.includes(p.kind) ) && (kind === "all" || (p.kind || "portfolio")===kind));
  useEffect(()=>{if(!filtered.some(p=>p.id === selected))setSelected(filtered[0]?.id || "");},[kind,content.galleryProjects,selected]);
  const project = filtered.find(p => p.id === selected);
  const savedCategoryList=content.sectionLists.find(row=>row.page==="gallery"&&row.section==="albums"&&!row.ownerDivision&&row.key==="galleryCategories");
  const categoryRows=(savedCategoryList?.rows as SectionListRow[]|undefined) || [...new Set(initialContent.galleryProjects.filter(p=>(p.kind||"portfolio")==="portfolio").map(p=>p.category).filter(Boolean))].map((label,index)=>({id:`gallery-category-${index+1}`,label}));
  const categories=mainCategories?categoryRows.map(row=>String(row.label||"")).filter(Boolean):[...new Set(content.galleryProjects.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,"id"));
  const activeCategory=categoryRows.find(row=>String(row.id)===selectedCategory)||categoryRows[0];
  function updateCategoryRows(rows:SectionListRow[]) {
    const list={...(savedCategoryList||{}),id:savedCategoryList?.id||"main-gallery-categories",page:"gallery" as const,section:"albums",key:"galleryCategories",rows,published:true};
    change(c=>({...c,sectionLists:[...c.sectionLists.filter(row=>!(row.page==="gallery"&&row.section==="albums"&&!row.ownerDivision&&row.key==="galleryCategories")),list]}));
  }
  function change(update: (value: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function updateProject(update: Partial<GalleryProject>) { change(c => ({ ...c, galleryProjects: c.galleryProjects.map(p => p.id === selected ? { ...p, ...update } : p) })); }
  function addProject() {
    if (content.galleryProjects.length >= 80) return;
    if(mainCategories&&!categories.length){setGalleryStage("categories");setMessage("Tambahkan kategori sebelum membuat album.");return;}
    const id = contentId();
    const division=ownerDivision || actor.division || defaultDivision || divisions[0]?.slug || "fabrikasi-erection";
    change(c => ({ ...c, galleryProjects: [...c.galleryProjects, { id, title: "Album baru", kind: kind === "all" ? "portfolio" : kind, category: mainCategories ? categories[0] : kind === "activity" ? "Kegiatan perusahaan" : kind === "design" ? "Referensi desain" : "Fabrikasi & erection", division, ownerDivision: ownerDivision || actor.division, description: "", location: "", year: "", photos: [], coverId: "", published: true }] }));
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
        const id = contentId();
        const photo = { id, src: url, alt: `${project.title} — ${file.name.replace(/\.[^.]+$/, "").slice(0, 30)}`.slice(0, 200), caption: "" };
        setContent(c => ({ ...c, galleryProjects: c.galleryProjects.map(p => p.id === uploadedTo ? { ...p, photos: [photo, ...p.photos], coverId: p.coverId || id } : p) }));
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
  function choosePhotos() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = () => {
      void upload(input.files);
      input.remove();
    };
    input.click();
  }
  async function save() {
    if (busy) return;
    const parsed = galleryProjectsSchema.safeParse(content.galleryProjects);
    if (!parsed.success) { setFailed(true); setMessage(parsed.error.issues[0]?.message || "Lengkapi nama proyek dan minimal satu foto sebelum menyimpan."); return; }
    if(mainCategories){const list={id:savedCategoryList?.id||"main-gallery-categories",page:"gallery" as const,section:"albums",key:"galleryCategories",rows:categoryRows,published:true};const categoryValidation=sectionListSchema.safeParse(list);if(!categoryValidation.success){setFailed(true);setMessage(categoryValidation.error.issues[0]?.message||"Periksa kategori galeri.");return;}if(new Set(categories.map(label=>label.trim().toLocaleLowerCase("id"))).size!==categories.length){setFailed(true);setMessage("Nama kategori harus berbeda.");return;}}
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
    updateProject({ photos, coverId: project.coverId === id ? photos[0]?.id || "" : project.coverId });
  }
  function removeProject() {
    if (!project || !window.confirm(`Hapus album ${project.title}? Foto di storage tetap disimpan.`)) return;
    const remaining = content.galleryProjects.filter(p => p.id !== selected);
    change(c => ({ ...c, galleryProjects: remaining })); setSelected(remaining[0]?.id || "");
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: workspaceSaveLabel || `Simpan ${albumLabel}`, disabled: !dirty, onSave: save });
  function selectProject(id: string) {
    if (busy) return;
    setSelected(id); setMessage("");
    focusEditorRecord("gallery-project-form");
  }
  return <div className="content-editor"><aside className="editor-sidebar"><Link className="editor-brand" href="/admin">MAHAMERU <small>CONTENT STUDIO</small></Link><p>GALERI & PROYEK</p><span className="editor-sidebar-link active">Album pengalaman proyek</span><Link className="editor-sidebar-link" href="/admin/produk">Produk & stok divisi</Link><Link className="editor-sidebar-link" href="/admin/konten">Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/promosi">Banner & kegiatan</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><Link href="/proyek" target="_blank">Lihat galeri ↗</Link></div></aside><main className="editor-main">
    <header className="editor-topbar"><span>Workspace / Galeri</span><div><span className="editor-save-state">{dirty ? "Belum disimpan" : "Tersimpan"}</span><button className="editor-save" type="button" onClick={save} disabled={busy || !dirty}>{busy ? "Memproses…" : "Simpan perubahan"}</button></div></header>
    <div className="editor-content"><div className="editor-title"><h1>{albumLabel}</h1></div>
      {mainCategories&&<AdminViewTabs value={galleryStage} onChange={setGalleryStage} label="Pengelolaan galeri" options={[{value:"categories",label:`Kategori (${categoryRows.length})`},{value:"albums",label:`Album & foto (${filtered.length})`}]} />}
      {(!mainCategories||galleryStage==="albums")&&<AdminViewTabs value={contentMode} onChange={setContentMode} label="Jenis isi section" options={[{value:"all",label:"Semua"},{value:"image",label:"Gambar"},{value:"text",label:"Tulisan"}]} />}
      {message && <div className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</div>}
      {busy && <p className="editor-notice" role="status">Sedang mengunggah atau menyimpan album. Tunggu hingga selesai.</p>}
      {mainCategories&&galleryStage==="categories" ? <fieldset className="editor-fields" disabled={busy}><section className="editor-panel cms-section-list"><div className="editor-list-heading"><h3>Kategori galeri</h3><button type="button" className="admin-primary" onClick={()=>{const row={id:contentId(),label:"Kategori baru"};updateCategoryRows([...categoryRows,row]);setSelectedCategory(String(row.id));}}>+ Tambah kategori</button></div><p className="admin-field-help">Atur kategori sebelum menambahkan album. Setiap album memakai satu kategori.</p><AdminOrderList label="Urutan kategori" items={categoryRows.map(row=>({id:String(row.id),title:String(row.label||"Kategori baru"),detail:`${filtered.filter(project=>project.category===row.label).length} album`}))} selected={selectedCategory||String(activeCategory?.id||"")} onSelect={setSelectedCategory} onMove={(from,to)=>updateCategoryRows(moveBefore(categoryRows.map(row=>({...row,id:String(row.id)})),from,to))}/>{activeCategory&&<div className="editor-grid"><label className="editor-field">Nama kategori<input maxLength={80} value={String(activeCategory.label||"")} onChange={event=>{const previous=String(activeCategory.label||"");const next=event.target.value;updateCategoryRows(categoryRows.map(row=>String(row.id)===String(activeCategory.id)?{...row,label:next}:row));if(previous!==next)change(c=>({...c,galleryProjects:c.galleryProjects.map(project=>(project.kind||"portfolio")==="portfolio"&&project.category===previous?{...project,category:next}:project)}));}}/></label><button type="button" className="admin-danger" onClick={()=>{const used=filtered.filter(project=>project.category===activeCategory.label).length;if(used){setFailed(true);setMessage(`Kategori ini masih dipakai ${used} album. Pindahkan albumnya sebelum menghapus kategori.`);return;}if(categoryRows.length<=1){setFailed(true);setMessage("Sisakan setidaknya satu kategori galeri.");return;}updateCategoryRows(categoryRows.filter(row=>String(row.id)!==String(activeCategory.id)));setSelectedCategory("");setMessage("Kategori dihapus. Simpan perubahan untuk menerapkan.");setFailed(false);}}>Hapus kategori</button></div>}</section></fieldset> : <>
      {contentMode === "text" ? <SectionContentEditor initialContent={initialContent} page={textPage} section={textSection} url={textUrl} ownerDivision={ownerDivision} hideImages hideActions hideGuidance /> : <>
      <fieldset className="editor-fields" disabled={busy}><div className="gallery-editor-layout"><nav className="gallery-editor-albums" aria-label="Daftar album"><button type="button" className="editor-add" onClick={addProject} disabled={content.galleryProjects.length >= 80||Boolean(mainCategories&&!categories.length)}>+ Tambah album {kind === "activity" ? "kegiatan" : kind === "design" ? "referensi desain" : "hasil pekerjaan"}</button>{mainCategories&&!categories.length&&<p className="admin-field-help">Tambahkan kategori terlebih dahulu.</p>}<AdminOrderList label="Urutan album" disabled={busy} selected={selected} items={filtered.map(p => ({ id: p.id, title: p.title, detail: `${p.photos.length} foto`, image: p.photos.find(photo => photo.id === p.coverId)?.src || p.photos[0]?.src }))} onSelect={selectProject} onMove={(from, to) => change(c => ({ ...c, galleryProjects: moveBefore(c.galleryProjects, from, to) }))} /></nav>
        {project ? <section className="editor-panel gallery-editor-project" id="gallery-project-form"><div className="editor-panel-title"><h2>{project.title}</h2><span>{project.photos.length} / 40 foto</span></div><div className="editor-grid">
          {initialKind === undefined && <label className="editor-field">Jenis album<select aria-label="Jenis album" value={project.kind || "portfolio"} onChange={e => updateProject({ kind: e.target.value as GalleryProject["kind"] })}><option value="portfolio">Portofolio — hasil pekerjaan / proyek nyata</option><option value="design">Album desain — referensi jasa</option><option value="activity">Galeri — kegiatan perusahaan</option></select></label>}{initialKind === undefined && <label className="editor-checkbox gallery-publish-choice"><input type="checkbox" checked={project.published} onChange={e => updateProject({ published: e.target.checked })} />Terbitkan album</label>}<label className="editor-field">Nama album<input maxLength={160} value={project.title} onChange={e => updateProject({ title: e.target.value })} /></label>
          <label className="editor-field">Kategori<select value={project.category} onChange={e=>{if(e.target.value==="__add__"){setNewCategory("");return;}updateProject({category:e.target.value});}}><option value={project.category}>{project.category}</option>{categories.filter(category=>category!==project.category).map(category=><option key={category} value={category}>{category}</option>)}{!mainCategories&&<option value="__add__">+ Tambah kategori baru…</option>}</select></label>{!mainCategories&&newCategory!==null&&<div className="gallery-category-add"><label className="editor-field">Nama kategori baru<input autoFocus maxLength={80} value={newCategory} onChange={event=>setNewCategory(event.target.value)} /></label><button type="button" className="admin-secondary" disabled={!newCategory.trim()} onClick={()=>{updateProject({category:newCategory.trim()});setNewCategory(null);}}>Gunakan kategori</button></div>}
        </div><label className="editor-field">Keterangan album<textarea maxLength={2000} rows={4} value={project.description} onChange={e => updateProject({ description: e.target.value })} /></label>
        <div className="gallery-editor-order"><button type="button" className="editor-delete" onClick={removeProject}>Hapus album</button></div>
        <AdminOrderList label="Urutan foto" disabled={busy} items={project.photos.map(photo => ({ id: photo.id, title: photo.alt, image: photo.src }))} onMove={(from, to) => updateProject({ photos: moveBefore(project.photos, from, to) })}>
          <button type="button" className="admin-primary" onClick={choosePhotos} disabled={busy}>+ Tambah foto</button>
        </AdminOrderList>
        <div className="gallery-editor-photos">{project.photos.map((photo, number) => <article key={photo.id}><div className="gallery-editor-photo"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 90vw, 300px" /><span>{number + 1}</span></div>
          <label className="editor-field">Deskripsi gambar (alt)<input maxLength={200} value={photo.alt} onChange={e => updateProject({ photos: project.photos.map(p => p.id === photo.id ? { ...p, alt: e.target.value } : p) })} /></label>
          <label className="editor-field">Keterangan foto<textarea maxLength={400} rows={2} value={photo.caption} onChange={e => updateProject({ photos: project.photos.map(p => p.id === photo.id ? { ...p, caption: e.target.value } : p) })} /></label>
          <label className="editor-checkbox gallery-cover-choice"><input type="checkbox" checked={project.coverId === photo.id} onChange={() => updateProject({ coverId: photo.id })} />Jadikan sampul album</label>
          <div className="gallery-photo-actions"><button type="button" className="editor-delete" onClick={() => removePhoto(photo.id)}>Hapus</button></div>
        </article>)}</div>{!project.photos.length && <p className="gallery-editor-empty">Tambahkan foto pertama untuk mulai menyusun album.</p>}</section> : <p className="gallery-editor-empty">Belum ada album. Klik “Tambah proyek” untuk mulai.</p>}
      </div></fieldset></>}</>}
    </div></main></div>;
}
