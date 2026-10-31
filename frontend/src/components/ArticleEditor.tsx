"use client";
import { uploadCmsFile } from "../lib/cmsUpload";

import AdminOrderList, { focusEditorRecord, moveBefore } from "./AdminOrderList";
import ContentOwnership from "./ContentOwnership";
import { useAdminIdentity } from "./AdminIdentity";
import Link from "next/link";
import Image from "./CmsImage";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { articleInputSchema, articleReadTime, articleSlug, articleToday, type ArticleInput, type ArticleRecord } from "../data/articleCms";
import ArticleContent from "./ArticleContent";
import { mainLogo } from "../data/companyIdentity";
import { useAdminRecordId, useAdminView, useAdminWorkspace } from "./AdminWorkspace";

const RichEditor = dynamic(() => import("./ArticleRichEditor"), { ssr: false, loading: () => <div className="article-editor-loading">Menyiapkan editor…</div> });
const blank = (): ArticleInput => ({ title: "", slug: "", category: "", date: articleToday(), excerpt: "", image: "", imageAlt: "", content: "", status: "published" });
function editable(record: ArticleRecord): ArticleInput {
  const { ownerDivision, audience, title, slug, category, date, excerpt, image, imageAlt, content, status } = record;
  return { ownerDivision, audience, title, slug, category, date, excerpt, image, imageAlt, content, status };
}

export default function ArticleEditor({ initialArticles }: { initialArticles: ArticleRecord[] }) {
  const actor = useAdminIdentity();
  const newDraft = () => ({...blank(),ownerDivision:actor.division});
  const [filter, setFilter] = useAdminView("status", ["all", "draft", "published"] as const, "all");
  const requestedId = useAdminRecordId();
  const selectionKey = `${requestedId || ""}:${filter}`;
  const previousSelectionKey = useRef(selectionKey);
  const initialRecord = initialArticles.find(record => record.id === requestedId && (filter === "all" || record.status === filter)) || initialArticles.find(record => filter === "all" || record.status === filter);
  const [records, setRecords] = useState(initialArticles);
  const [activeId, setActiveId] = useState<string | null>(initialRecord?.id || null);
  const [draft, setDraft] = useState<ArticleInput>(() => initialRecord ? editable(initialRecord) : newDraft());
  const [editorKey, setEditorKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [conflict, setConflict] = useState(false);
  const current = records.find(record => record.id === activeId);
  const busy = saving || uploading;
  const slugLocked = Boolean(current?.firstPublishedAt);
  const visibleRecords = records.filter(record => (filter === "all" || record.status === filter) && `${record.title} ${record.category}`.toLowerCase().includes(query.toLowerCase()));

  function change(update: Partial<ArticleInput>) { setDraft(value => ({ ...value, ...update })); setDirty(true); setNotice(""); }
  async function select(record?: ArticleRecord) {
    if (busy || dirty && !(await workspace.confirmDiscard())) return;
    setActiveId(record?.id || null); setDraft(record ? editable(record) : newDraft()); setDirty(false); setEditorKey(key => key + 1);
    setNotice(""); setPreview(false); setDeleteConfirm(false); setConflict(false);
    if (!record) focusEditorRecord("article-form");
  }
  function reorder(from: string, to: string) {
    const ids = new Set(visibleRecords.map(record => record.id)); const moved = moveBefore(visibleRecords, from, to); let index = 0;
    setRecords(all => all.map(record => ids.has(record.id) ? moved[index++] : record));setOrderDirty(true);setNotice("");
  }
  async function persistOrder(items: ArticleRecord[]) {
    const response = await fetch("/api/admin/articles/reorder", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({items:items.map(({id,revision})=>({id,revision}))}) });
    const next = await response.json(); if(!response.ok) {setConflict(response.status===409);throw new Error(next.message || "Urutan artikel belum tersimpan.");}
    setRecords(next);setOrderDirty(false);
  }
  async function save() {
    if (busy) return;
    if (!dirty && orderDirty) {
      setSaving(true);setNotice("");setFailed(false);
      try {await persistOrder(records);workspace.refreshDashboard();setNotice("Urutan artikel tersimpan dan langsung digunakan di website.");}
      catch(error) {setFailed(true);setNotice((error as Error).message);}finally {setSaving(false);}return;
    }
    const parsed = articleInputSchema.safeParse({ ...draft, status: "published" });
    if (!parsed.success) { setFailed(true); setNotice(`Lengkapi ${({title:"judul",category:"kategori",excerpt:"ringkasan",image:"gambar sampul",imageAlt:"deskripsi gambar sampul",content:"isi artikel"} as Record<string,string>)[String(parsed.error.issues[0]?.path[0])] || "isian artikel"}: ${parsed.error.issues[0]?.message || "isian belum lengkap"}`); return; }
    setSaving(true); setNotice(""); setFailed(false); setConflict(false);
    try {
      const response = await fetch(current ? `/api/admin/articles/${current.id}` : "/api/admin/articles", {
        method: current ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, status: "published", ...(current ? { revision: current.revision } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) { setConflict(result.code === "CONFLICT"); throw new Error(result.message || "Artikel belum tersimpan."); }
      const saved = result as ArticleRecord;
      const nextRecords = current ? records.map(record => record.id === saved.id ? saved : record) : [saved, ...records];
      setRecords(nextRecords);
      setActiveId(saved.id); setDraft(editable(saved)); setDirty(false); setDeleteConfirm(false); workspace.refreshDashboard();
      if(orderDirty)await persistOrder(nextRecords);
      setNotice("Artikel tersimpan dan sudah tampil di website.");
    } catch (error) { setFailed(true); setNotice((error as Error).message); }
    finally { setSaving(false); }
  }
  async function reload() {
    if (dirty && !window.confirm("Muat ulang dan ganti perubahan lokal dengan versi tersimpan?")) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/admin/articles", { cache: "no-store" });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      const all = result as ArticleRecord[]; const record = all.find(item => item.id === activeId);
      setRecords(all);setOrderDirty(false); setDraft(record ? editable(record) : newDraft()); setActiveId(record?.id || null);
      setEditorKey(key => key + 1); setDirty(false); setConflict(false); setFailed(false); setNotice("Versi terbaru dimuat.");
    } catch (error) { setFailed(true); setNotice((error as Error).message); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!current) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/articles/${current.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: current.revision }) });
      const result = await response.json(); if (!response.ok) { setConflict(result.code === "CONFLICT"); throw new Error(result.message); }
      setRecords(all => all.filter(record => record.id !== current.id)); setActiveId(null); setDraft(newDraft()); workspace.refreshDashboard();
      setEditorKey(key => key + 1); setDirty(false); setDeleteConfirm(false); setFailed(false); setNotice("Artikel dihapus.");
    } catch (error) { setFailed(true); setNotice((error as Error).message); }
    finally { setSaving(false); }
  }
  async function upload(file: File) {
    setNotice(""); setFailed(false);
    if (file.size > 4_000_000) { setFailed(true); setNotice("Gambar maksimal 4 MB."); return null; }
    setUploading(true);
    try {
      const url = await uploadCmsFile(file, "image", draft.ownerDivision || null, "/api/admin/articles/upload");
      setNotice("Gambar terunggah. Simpan artikel agar perubahan tersimpan."); return url;
    } catch (error) { setFailed(true); setNotice((error as Error).message); return null; }
    finally { setUploading(false); }
  }
  const workspace = useAdminWorkspace({ dirty:dirty || orderDirty, busy, label: "Simpan artikel", disabled: !dirty && !orderDirty && Boolean(current), onSave: () => save() });
  useEffect(() => {
    if (dirty || busy) return;
    if (previousSelectionKey.current === selectionKey) return;
    previousSelectionKey.current = selectionKey;
    const next = records.find(record => record.id === requestedId && (filter === "all" || record.status === filter)) || records.find(record => filter === "all" || record.status === filter);
    if (next?.id === activeId || (!next && !activeId)) return;
    setActiveId(next?.id || null); setDraft(next ? editable(next) : newDraft()); setEditorKey(key => key + 1);
    setPreview(false); setDeleteConfirm(false);
  }, [selectionKey, requestedId, filter, records, dirty, busy, activeId]);
  function field(label: string, key: "title" | "slug" | "category" | "date" | "image" | "imageAlt", type = "text") {
    return <label className="editor-field">{label}<input type={type} value={draft[key]} maxLength={{ title: 180, slug: 140, category: 100, date: 10, image: 2000, imageAlt: 250 }[key]} disabled={busy || (key === "slug" && slugLocked)} onChange={event => {
      const value = event.target.value;
      if (key === "title") change({ title: value, ...(!slugLocked && (!draft.slug || draft.slug === articleSlug(draft.title)) ? { slug: articleSlug(value) } : {}) });
      else change({ [key]: value });
    }} /></label>;
  }

  return <div className="content-editor article-editor">
    <aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><Image src={mainLogo} alt="MBI Laser Cutting" width={64} height={58} sizes="64px" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link>
      <p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">01 · Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/sosial">02 · Sosial media</Link><Link className="editor-sidebar-link" href="/admin/promosi">03 · Banner & promo</Link><span className="editor-sidebar-link active">04 · Artikel</span><Link className="editor-sidebar-link" href="/admin/permintaan">05 · Permintaan pelanggan ↗</Link>
      <div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/informasi" target="_blank" rel="noopener noreferrer">Lihat artikel di website ↗</a><form action="/api/admin/logout" method="post" onSubmit={event => { if (dirty && !window.confirm("Perubahan belum disimpan. Keluar?")) event.preventDefault(); }}><button type="submit">Keluar</button></form></div>
    </aside>
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / Artikel</span><div><span className={`editor-save-state ${dirty || orderDirty ? "is-dirty" : ""}`}>{uploading ? "Mengunggah gambar…" : dirty || orderDirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={busy || (!dirty && !orderDirty && Boolean(current))} onClick={() => save()}>{saving ? "Menyimpan…" : "Simpan artikel"}</button></div></header>
      <div className="editor-content"><div className="editor-title"><h1>Artikel & panduan</h1><p>Tulis panduan, unggah gambar, lalu periksa pratinjau. Artikel langsung tampil di website setelah disimpan.</p></div>
        {notice && <div className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{notice}{conflict && <button type="button" disabled={busy} onClick={reload}>Muat ulang artikel</button>}</div>}
        {busy && <p className="editor-notice" role="status">{uploading ? "Sedang mengunggah gambar…" : "Sedang menyimpan artikel…"}</p>}
        <div className={`article-workspace${!current ? " is-creating" : ""}`}>
          <section className="article-list" aria-label="Daftar artikel"><div className="editor-list-heading"><h2>Artikel <span>{records.length}</span></h2><button type="button" disabled={busy} onClick={() => select()}>+ Tambah</button></div>
            <label className="editor-field">Cari artikel<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Judul atau kategori" /></label>
            <AdminOrderList label="Urutan artikel" disabled={busy} selected={activeId || undefined} items={visibleRecords.map(record=>({id:record.id,title:record.title || "Artikel tanpa judul",detail:record.category}))} onMove={reorder} onSelect={id=>{const record=records.find(record=>record.id===id);if(record)void select(record);}} />
            {!visibleRecords.length && <p className="article-list-empty">Tidak ada artikel yang sesuai.</p>}
          </section>
          <section className="editor-panel article-form" id="article-form" aria-label="Form artikel"><div className="editor-panel-title"><h2>{current ? "Sunting artikel" : "Artikel baru"}</h2><button type="button" className="article-secondary-button" aria-pressed={preview} onClick={() => setPreview(value => !value)}>{preview ? "Kembali ke editor" : "Pratinjau"}</button></div>
            {preview ? <div className="article-preview"><p className="industrial-eyebrow">{draft.category || "Kategori artikel"} · {articleReadTime(draft.content)}</p><h2>{draft.title || "Judul artikel"}</h2><p className="article-preview-excerpt">{draft.excerpt}</p>{draft.image && <img className="article-preview-cover" src={draft.image} alt={draft.imageAlt || draft.title} />}<ArticleContent content={draft.content} /></div> : <>
              <ContentOwnership value={draft} onChange={change}/><div className="editor-grid">{field("Judul artikel", "title")}{field("Kategori", "category")}</div>
              <div className="editor-grid">{field("Alamat artikel", "slug")}{field("Tanggal artikel (WIB)", "date", "date")}</div><p className="article-field-hint">/informasi/{draft.slug || "alamat-artikel"}{slugLocked ? " · Alamat dikunci karena artikel pernah terbit." : " · Dibuat otomatis dari judul; boleh diubah sebelum pertama terbit."}</p>
              <label className="editor-field">Ringkasan<textarea rows={3} value={draft.excerpt} maxLength={600} disabled={busy} onChange={event => change({ excerpt: event.target.value })} /></label>
              <div className="promotion-editor-media article-cover"><div>{draft.image ? <img src={draft.image} alt={draft.imageAlt || "Pratinjau sampul"} /> : <span>Belum ada gambar sampul</span>}</div><div><label className="editor-field">Artikel › {draft.title || "Artikel baru"} — unggah gambar sampul (maks. 4 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; const url = await upload(file); if (url) change({ image: url }); }} /></label>{field("Alamat gambar sampul", "image")}{field("Deskripsi gambar sampul", "imageAlt")}</div></div>
              <div className="article-body-label"><strong>Isi artikel</strong><span>{articleReadTime(draft.content)}</span></div><RichEditor key={editorKey} value={draft.content} onChange={content => change({ content })} disabled={busy} onUpload={upload} />
            </>}
            <div className="article-form-actions"><button type="button" className="editor-save" disabled={busy} onClick={() => save()}>{saving ? "Menyimpan…" : "Simpan artikel"}</button>{current && <button type="button" className="article-delete-button" disabled={busy} onClick={() => setDeleteConfirm(true)}>Hapus</button>}</div>
            {deleteConfirm && current && <div className="article-delete-confirm" role="alert"><p>Hapus “{current.title || "Artikel tanpa judul"}”? Artikel dan perubahan yang belum disimpan akan hilang dari daftar.</p><button type="button" disabled={busy} onClick={remove}>Ya, hapus artikel</button><button type="button" disabled={busy} onClick={() => setDeleteConfirm(false)}>Batal</button></div>}
          </section>
        </div>
      </div>
    </main>
  </div>;
}
