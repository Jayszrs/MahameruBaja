"use client";
import { useState } from "react";
import type { SiteContent } from "../data/siteContent";
import { useAdminWorkspace } from "./AdminWorkspace";
import { useAdminIdentity } from "./AdminIdentity";
import { uploadCmsFile } from "../lib/cmsUpload";

export default function ArticleIntroEditor({ initialContent }: { initialContent: SiteContent }) {
  const actor = useAdminIdentity();
  const [content, setContent] = useState(initialContent);
  const [base, setBase] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const dirty = JSON.stringify(content.articleIntro) !== JSON.stringify(base.articleIntro);
  function change(key: keyof SiteContent["articleIntro"], value: string) { setContent(current => ({ ...current, articleIntro: { ...current.articleIntro, [key]: value } })); }
  async function save() {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base }) });
      const next = await response.json(); if (!response.ok) throw new Error(next.message || "Pembuka artikel belum tersimpan.");
      setContent(next); setBase(next); setMessage("Pembuka Artikel tersimpan.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan."); }
    finally { setBusy(false); }
  }
  useAdminWorkspace({ dirty, busy, label: "Simpan pembuka Artikel", disabled: !dirty || Boolean(actor.division), onSave: save });
  return <section className="editor-panel article-intro-editor">
    {actor.division && <p role="status">Pembuka halaman Artikel website utama dikelola Super Admin.</p>}
    {message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}
    <fieldset disabled={busy || Boolean(actor.division)} className="website-copy-fieldset">
      <div className="editor-grid"><label className="editor-field">Teks pengantar<input value={content.articleIntro.eyebrow} maxLength={180} onChange={event => change("eyebrow", event.target.value)} /></label><label className="editor-field">Judul halaman<input value={content.articleIntro.title} required maxLength={300} onChange={event => change("title", event.target.value)} /></label></div>
      <label className="editor-field">Deskripsi<textarea rows={4} value={content.articleIntro.description} maxLength={2000} onChange={event => change("description", event.target.value)} /></label>
      <div className="editor-grid"><label className="editor-field">Unggah gambar pembuka<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
        setBusy(true); setFailed(false); setMessage("Mengunggah gambar…");
        try { const url = await uploadCmsFile(file, "image", null); change("image", url); setMessage("Unggahan selesai. Simpan untuk menggunakan gambar baru."); }
        catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Unggahan gagal."); }
        finally { setBusy(false); }
      }} /><small>JPG, PNG, WebP · maksimal 4 MB. Gambar lama tetap tersimpan sampai penggantian berhasil.</small></label><label className="editor-field">Tautan gambar<input value={content.articleIntro.image} onChange={event => change("image", event.target.value)} /></label></div>
      {content.articleIntro.image && <div className="article-intro-image-preview"><img src={content.articleIntro.image} alt="Pratinjau gambar pembuka Artikel" /><button className="admin-secondary" type="button" onClick={() => change("image", "")}>Hapus gambar dari halaman</button></div>}
      <label className="editor-field">Keterangan visual<input value={content.articleIntro.visualNote} maxLength={180} onChange={event => change("visualNote", event.target.value)} /></label>
    </fieldset>
  </section>;
}
