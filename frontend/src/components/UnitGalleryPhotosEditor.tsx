"use client";
import { useState } from "react";
import type { SiteContent } from "../data/siteContent";
import type { SectionListRow } from "../data/sectionLists";
import { sectionListSchema } from "../data/sectionLists";
import { contentId } from "../data/socialMedia";
import { uploadCmsFile, validateUploadFile } from "../lib/cmsUpload";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import Image from "./CmsImage";
import { useAdminWorkspace } from "./AdminWorkspace";

type Photo = SectionListRow & { src: string; title: string; alt: string };
function photoList(content: SiteContent, owner: string) {
  return content.sectionLists.find(row => row.page === "gallery" && row.section === "unitGallery" && row.key === "unitGalleryPhotos" && row.ownerDivision === owner);
}

export default function UnitGalleryPhotosEditor({ initialContent, ownerDivision, initialPhotos }: { initialContent: SiteContent; ownerDivision: string; initialPhotos: Array<{ src: string; title: string }> }) {
  const savedList = photoList(initialContent, ownerDivision);
  const seeded = (savedList?.rows as Photo[] | undefined) ?? initialPhotos.map((photo, index) => ({ id: `${ownerDivision}-gallery-${index + 1}`, src: photo.src, title: photo.title || `Foto ${index + 1}`, alt: photo.title || `Foto ${index + 1}` }));
  const [content, setContent] = useState(initialContent);
  const [base, setBase] = useState(initialContent);
  const [photos, setPhotos] = useState<Photo[]>(seeded);
  const [selected, setSelected] = useState(String(seeded[0]?.id || ""));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const dirty = JSON.stringify(content.sectionLists) !== JSON.stringify(base.sectionLists);

  function sync(next: Photo[]) {
    setPhotos(next);
    const record = { id: savedList?.id || `unit-gallery-${ownerDivision}`, page: "gallery" as const, section: "unitGallery", key: "unitGalleryPhotos", ownerDivision, rows: next, published: true };
    setContent(current => ({ ...current, sectionLists: [...current.sectionLists.filter(row => !(row.page === "gallery" && row.section === "unitGallery" && row.key === "unitGalleryPhotos" && row.ownerDivision === ownerDivision)), record] }));
    setNotice(""); setFailed(false);
  }
  async function save() {
    if (busy) return;
    const record = { id: savedList?.id || `unit-gallery-${ownerDivision}`, page: "gallery" as const, section: "unitGallery", key: "unitGalleryPhotos", ownerDivision, rows: photos, published: true };
    const parsed = sectionListSchema.safeParse(record);
    if (!parsed.success) { setFailed(true); setNotice(parsed.error.issues[0]?.message || "Periksa foto galeri."); return; }
    setBusy(true); setFailed(false); setNotice("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base }) });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.message || "Perubahan belum tersimpan.");
      setContent(saved); setBase(saved); setNotice("Foto galeri tersimpan.");
    } catch (error) { setFailed(true); setNotice(error instanceof Error ? error.message : "Gagal menyimpan galeri."); }
    finally { setBusy(false); }
  }
  useAdminWorkspace({ dirty, busy, label: "Simpan section", disabled: !dirty, onSave: save });
  function patch(id: string, values: Partial<Pick<Photo, "src" | "title" | "alt">>) { sync(photos.map(photo => String(photo.id) === id ? { ...photo, ...values } : photo)); }
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const queue = Array.from(files);
    if (photos.length + queue.length > 300) { setFailed(true); setNotice("Maksimal 300 foto pada galeri ini."); return; }
    try { queue.forEach(file => validateUploadFile(file, "image")); }
    catch (error) { setFailed(true); setNotice(error instanceof Error ? error.message : "Pilih berkas gambar yang valid."); return; }
    setBusy(true); setFailed(false); setNotice("Mengunggah foto…");
    let next = [...photos]; let added = 0;
    try {
      for (const file of queue) {
        const src = await uploadCmsFile(file, "image", null);
        const title = file.name.replace(/\.[^.]+$/, "").trim() || `Foto ${next.length + 1}`;
        const row = { id: contentId(), src, title, alt: title };
        next = [...next, row]; sync(next); setSelected(String(row.id)); added++;
      }
      setNotice(`${added} foto ditambahkan. Simpan perubahan untuk menerapkannya.`);
    } catch (error) { setFailed(true); setNotice(`${added} foto berhasil diunggah. ${error instanceof Error ? error.message : "Unggahan berikutnya gagal."}`); }
    finally { setBusy(false); }
  }
  const active = photos.find(photo => String(photo.id) === selected);
  return <section className="cms-section-content">
    {notice && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{notice}</p>}
    <section className="editor-panel cms-section-list">
      <div className="editor-list-heading"><h2>Foto galeri unit</h2><label className="admin-primary cms-file-button">+ Tambah foto<input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => { void addFiles(event.target.files); event.target.value = ""; }} /></label></div>
      <AdminOrderList label="Urutan foto galeri" disabled={busy} items={photos.map((photo, index) => ({ id: String(photo.id), title: photo.title || `Foto ${index + 1}`, image: photo.src }))} selected={selected} onSelect={setSelected} onMove={(from, to) => sync(moveBefore(photos.map(photo => ({ ...photo, id: String(photo.id) })), from, to))} />
      {active && <section className="editor-panel cms-list-row unit-gallery-photo-detail"><h3>{active.title}</h3><div className="cms-list-fields"><div className="cms-gallery-photo-preview"><Image src={active.src} alt={active.alt || active.title} width={640} height={400} /></div><div className="editor-grid"><label className="editor-field">Nama foto<input maxLength={200} value={active.title} onChange={event => patch(String(active.id), { title: event.target.value })} /></label><label className="editor-field cms-wide-field">Deskripsi foto<textarea rows={3} maxLength={500} value={active.alt} onChange={event => patch(String(active.id), { alt: event.target.value })} /></label><label className="editor-field">Ganti foto<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setBusy(true); setFailed(false); setNotice("Mengunggah foto pengganti…"); try { validateUploadFile(file, "image"); patch(String(active.id), { src: await uploadCmsFile(file, "image", null) }); setNotice("Foto pengganti siap. Simpan perubahan untuk menerapkannya."); } catch (error) { setFailed(true); setNotice(error instanceof Error ? error.message : "Unggahan gagal."); } finally { setBusy(false); } }} /><small>JPG, PNG, atau WebP · maksimal 4 MB.</small></label></div><button type="button" className="admin-danger" disabled={busy} onClick={() => { const next = photos.filter(photo => String(photo.id) !== String(active.id)); sync(next); setSelected(String(next[0]?.id || "")); }}>Hapus foto</button></div></section>}
      {!photos.length && <p>Belum ada foto untuk divisi ini. Unggah foto untuk mulai mengisi galeri.</p>}
    </section>
  </section>;
}
