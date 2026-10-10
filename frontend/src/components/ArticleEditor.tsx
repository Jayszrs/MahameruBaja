"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { articleReadTime, articleSlug, articleToday, type ArticleInput, type ArticleRecord } from "../data/articleCms";
import ArticleContent from "./ArticleContent";
import { mainLogo } from "../data/companyIdentity";

const RichEditor = dynamic(() => import("./ArticleRichEditor"), { ssr: false, loading: () => <div className="article-editor-loading">Menyiapkan editor…</div> });
const blank = (): ArticleInput => ({ title: "", slug: "", category: "", date: articleToday(), excerpt: "", image: "", imageAlt: "", content: "", status: "draft" });
function editable(record: ArticleRecord): ArticleInput {
  const { title, slug, category, date, excerpt, image, imageAlt, content, status } = record;
  return { title, slug, category, date, excerpt, image, imageAlt, content, status };
}

export default function ArticleEditor({ initialArticles }: { initialArticles: ArticleRecord[] }) {
  const [records, setRecords] = useState(initialArticles);
  const [activeId, setActiveId] = useState<string | null>(initialArticles[0]?.id || null);
  const [draft, setDraft] = useState<ArticleInput>(() => initialArticles[0] ? editable(initialArticles[0]) : blank());
  const [editorKey, setEditorKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [conflict, setConflict] = useState(false);
  const current = records.find(record => record.id === activeId);
  const busy = saving || uploading;
  const slugLocked = Boolean(current?.firstPublishedAt);
  const visibleRecords = records.filter(record => (filter === "all" || record.status === filter) && `${record.title} ${record.category}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    const navigation = (event: MouseEvent) => {
      if (!dirty || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      const link = (event.target as Element)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (new URL(link.href).pathname === window.location.pathname) return;
      if (!window.confirm("Perubahan artikel belum disimpan. Tinggalkan halaman?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", navigation, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigation, true); };
  }, [dirty]);

  function change(update: Partial<ArticleInput>) { setDraft(value => ({ ...value, ...update })); setDirty(true); setNotice(""); }
  function select(record?: ArticleRecord) {
    if (busy || (dirty && !window.confirm("Perubahan belum disimpan. Buka artikel lain?"))) return;
    setActiveId(record?.id || null); setDraft(record ? editable(record) : blank()); setDirty(false); setEditorKey(key => key + 1);
    setNotice(""); setPreview(false); setDeleteConfirm(false); setConflict(false);
  }
  async function save(status: ArticleInput["status"]) {
    setSaving(true); setNotice(""); setFailed(false); setConflict(false);
    try {
      const response = await fetch(current ? `/api/admin/articles/${current.id}` : "/api/admin/articles", {
        method: current ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, status, ...(current ? { revision: current.revision } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) { setConflict(result.code === "CONFLICT"); throw new Error(result.message || "Artikel belum tersimpan."); }
      const saved = result as ArticleRecord;
      setRecords(all => current ? all.map(record => record.id === saved.id ? saved : record) : [saved, ...all]);
      setActiveId(saved.id); setDraft(editable(saved)); setDirty(false); setDeleteConfirm(false);
      setNotice(saved.status === "published" ? "Tersimpan. Artikel kini tersedia di halaman publik." : "Draf tersimpan. Artikel ini belum tampil ke pengunjung.");
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
      setRecords(all); setDraft(record ? editable(record) : blank()); setActiveId(record?.id || null);
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
      setRecords(all => all.filter(record => record.id !== current.id)); setActiveId(null); setDraft(blank());
      setEditorKey(key => key + 1); setDirty(false); setDeleteConfirm(false); setFailed(false); setNotice("Artikel dihapus.");
    } catch (error) { setFailed(true); setNotice((error as Error).message); }
    finally { setSaving(false); }
  }
  async function upload(file: File) {
    setNotice(""); setFailed(false);
    if (file.size > 4_000_000) { setFailed(true); setNotice("Gambar maksimal 4 MB."); return null; }
    setUploading(true);
    try {
      const form = new FormData(); form.append("image", file);
      const response = await fetch("/api/admin/articles/upload", { method: "POST", body: form });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || "Gambar gagal diunggah.");
      setNotice("Gambar terunggah. Simpan artikel agar perubahan tersimpan."); return result.url as string;
    } catch (error) { setFailed(true); setNotice((error as Error).message); return null; }
    finally { setUploading(false); }
  }
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
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / Artikel</span><div><span className={`editor-save-state ${dirty ? "is-dirty" : ""}`}>{uploading ? "Mengunggah gambar…" : dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={busy || (!dirty && Boolean(current))} onClick={() => save(current?.status || "draft")}>{saving ? "Menyimpan…" : current?.status === "published" ? "Simpan perubahan ↗" : "Simpan draf ↗"}</button></div></header>
      <div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">ARTIKEL / PANDUAN MATERIAL</p><h1>Bagikan pengetahuan.<br /><em>Bantu pelanggan memilih.</em></h1><p>Tulis panduan, unggah gambar, dan periksa pratinjau sebelum menerbitkan. Draf hanya terlihat di ruang admin.</p></div>
        {notice && <div className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{notice}{conflict && <button type="button" disabled={busy} onClick={reload}>Muat ulang artikel</button>}</div>}
        <div className="article-workspace">
          <section className="article-list" aria-label="Daftar artikel"><div className="editor-list-heading"><h2>Artikel <span>{records.length}</span></h2><button type="button" disabled={busy} onClick={() => select()}>+ Tambah</button></div>
            <label className="editor-field">Cari artikel<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Judul atau kategori" /></label><label className="editor-field">Status<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Semua artikel</option><option value="draft">Draf</option><option value="published">Terbit</option></select></label>
            <div className="article-list-items">{visibleRecords.map(record => <button type="button" key={record.id} className={activeId === record.id ? "active" : ""} disabled={busy} onClick={() => select(record)} aria-pressed={activeId === record.id}><span className={`article-status ${record.status}`}>{record.status === "published" ? "Terbit" : "Draf"}</span><strong>{record.title || "Artikel tanpa judul"}</strong><small>{record.category || "Belum ada kategori"} · {record.date}</small></button>)}{!visibleRecords.length && <p className="article-list-empty">Tidak ada artikel yang sesuai.</p>}</div>
          </section>
          <section className="editor-panel article-form" aria-label="Form artikel"><div className="editor-panel-title"><h2>{current ? "Sunting artikel" : "Artikel baru"}</h2><button type="button" className="article-secondary-button" aria-pressed={preview} onClick={() => setPreview(value => !value)}>{preview ? "Kembali ke editor" : "Pratinjau"}</button></div>
            {preview ? <div className="article-preview"><p className="industrial-eyebrow">{draft.category || "Kategori artikel"} · {articleReadTime(draft.content)}</p><h2>{draft.title || "Judul artikel"}</h2><p className="article-preview-excerpt">{draft.excerpt}</p>{draft.image && <img className="article-preview-cover" src={draft.image} alt={draft.imageAlt || draft.title} />}<ArticleContent content={draft.content} /></div> : <>
              <div className="editor-grid">{field("Judul artikel", "title")}{field("Kategori", "category")}</div>
              <div className="editor-grid">{field("Alamat artikel", "slug")}{field("Tanggal artikel (WIB)", "date", "date")}</div><p className="article-field-hint">/informasi/{draft.slug || "alamat-artikel"}{slugLocked ? " · Alamat dikunci karena artikel pernah terbit." : " · Dibuat otomatis dari judul; boleh diubah sebelum pertama terbit."}</p>
              <label className="editor-field">Ringkasan<textarea rows={3} value={draft.excerpt} maxLength={600} disabled={busy} onChange={event => change({ excerpt: event.target.value })} /></label>
              <div className="promotion-editor-media article-cover"><div>{draft.image ? <img src={draft.image} alt={draft.imageAlt || "Pratinjau sampul"} /> : <span>Belum ada gambar sampul</span>}</div><div><label className="editor-field">Unggah gambar sampul · maksimal 4 MB<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; const url = await upload(file); if (url) change({ image: url }); }} /></label>{field("Alamat gambar sampul", "image")}{field("Deskripsi gambar sampul", "imageAlt")}</div></div>
              <div className="article-body-label"><strong>Isi artikel</strong><span>{articleReadTime(draft.content)}</span></div><RichEditor key={editorKey} value={draft.content} onChange={content => change({ content })} disabled={busy} onUpload={upload} />
            </>}
            <div className="article-form-actions"><button type="button" className="editor-save" disabled={busy} onClick={() => save(current?.status || "draft")}>{saving ? "Menyimpan…" : current?.status === "published" ? "Simpan perubahan" : "Simpan draf"}</button>{current?.status === "published" ? <button type="button" className="article-secondary-button" disabled={busy} onClick={() => save("draft")}>Jadikan draf</button> : <button type="button" className="article-publish-button" disabled={busy} onClick={() => save("published")}>Terbitkan artikel</button>}{current && <button type="button" className="article-delete-button" disabled={busy} onClick={() => setDeleteConfirm(true)}>Hapus</button>}</div>
            {deleteConfirm && current && <div className="article-delete-confirm" role="alert"><p>Hapus “{current.title || "Artikel tanpa judul"}”? Artikel dan perubahan yang belum disimpan akan hilang dari daftar.</p><button type="button" disabled={busy} onClick={remove}>Ya, hapus artikel</button><button type="button" disabled={busy} onClick={() => setDeleteConfirm(false)}>Batal</button></div>}
          </section>
        </div>
      </div>
    </main>
  </div>;
}
