"use client";
import { useState } from "react";
import Link from "next/link";
import type { SiteContent } from "../data/siteContent";
import { useAdminWorkspace } from "./AdminWorkspace";
import AdminOrderList from "./AdminOrderList";

export default function HomeQuickLinksEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [base, setBase] = useState(initialContent);
  const [draft, setDraft] = useState({ label: "", href: "/unit/" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const dirty = JSON.stringify(content.homeQuickLinks) !== JSON.stringify(base.homeQuickLinks) || content.homeQuickLinksTitle !== base.homeQuickLinksTitle;
  function change(id: string, key: "label" | "href", value: string) {
    setContent(current => ({ ...current, homeQuickLinks: current.homeQuickLinks.map(row => row.id === id ? { ...row, [key]: value } : row) }));
  }
  function add() {
    const label = draft.label.trim(), href = draft.href.trim();
    if (!label || !href.startsWith("/" ) || href.startsWith("//") || href.includes("\\") || href.includes("javascript:")) { setFailed(true); setMessage("Isi label dan tautan internal yang diawali /, misalnya /unit/retail-tambun."); return; }
    if (content.homeQuickLinks.length >= 20) { setFailed(true); setMessage("Maksimal 20 pilihan kebutuhan."); return; }
    setContent(current => ({ ...current, homeQuickLinks: [{ id: crypto.randomUUID(), label, href }, ...current.homeQuickLinks] }));
    setDraft({ label: "", href: "/unit/" }); setFailed(false); setMessage("Pilihan ditambahkan. Simpan perubahan untuk menerbitkannya.");
  }
  async function save() {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base }) });
      const next = await response.json(); if (!response.ok) throw new Error(next.message || "Perubahan belum tersimpan.");
      setContent(next); setBase(next); setMessage("Pilihan kebutuhan tersimpan dan tampil di beranda.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan perubahan."); }
    finally { setBusy(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: "Simpan pilihan", disabled: !dirty, onSave: save });
  return <div className="admin-management">
    <header className="admin-page-heading"><div><p className="industrial-eyebrow">BERANDA / PILIHAN KEBUTUHAN</p><h1>Mulai dari kebutuhan Anda</h1><p>Atur tautan pilihan pada beranda. Urutan di sini sama dengan urutan tampil di website.</p></div><Link className="admin-secondary" href="/#pilih-divisi" target="_blank" rel="noopener noreferrer">Buka pratinjau section ↗</Link></header>
    {message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}
    <div className="editor-panel">
      <label className="editor-field">Judul section<input value={content.homeQuickLinksTitle} maxLength={200} onChange={event => setContent(current => ({ ...current, homeQuickLinksTitle: event.target.value }))}/></label>
      <div className="editor-list-heading"><h2>Tambah pilihan kebutuhan</h2></div>
      <div className="editor-grid"><label className="editor-field">Teks tombol<input value={draft.label} maxLength={180} onChange={event => setDraft(value => ({ ...value, label: event.target.value }))} placeholder="Contoh: Saya mencari material untuk toko" /></label><label className="editor-field">Tujuan tautan<input value={draft.href} maxLength={500} onChange={event => setDraft(value => ({ ...value, href: event.target.value }))} placeholder="/unit/retail-tambun" /></label></div>
      <button type="button" className="admin-secondary" disabled={busy} onClick={add}>+ Tambah pilihan</button>
    </div>
    <section className="editor-panel"><div className="editor-list-heading"><h2>Urutan pilihan ({content.homeQuickLinks.length})</h2><a href="/#pilih-divisi" target="_blank" rel="noopener noreferrer">Lihat section di website ↗</a></div>
      <AdminOrderList label="Urutan pilihan kebutuhan" items={content.homeQuickLinks.map(row => ({ id: row.id, title: row.label, detail: row.href }))} disabled={busy} onMove={(from, to) => setContent(current => { const items = [...current.homeQuickLinks]; const index = items.findIndex(row => row.id === from); const target = items.findIndex(row => row.id === to); if (index < 0 || target < 0) return current; const [item] = items.splice(index, 1); items.splice(target, 0, item); return { ...current, homeQuickLinks: items }; })} />
      {content.homeQuickLinks.map((row, index) => <div className="editor-panel" key={row.id}><div className="editor-list-heading"><h3>Pilihan {index + 1}</h3><button type="button" className="admin-danger" disabled={busy} onClick={() => setContent(current => ({ ...current, homeQuickLinks: current.homeQuickLinks.filter(item => item.id !== row.id) }))}>Hapus</button></div><div className="editor-grid"><label className="editor-field">Teks tombol<input value={row.label} maxLength={180} onChange={event => change(row.id, "label", event.target.value)} /></label><label className="editor-field">Tujuan tautan<input value={row.href} maxLength={500} onChange={event => change(row.id, "href", event.target.value)} /></label></div><a href={row.href} target="_blank" rel="noopener noreferrer">Buka tujuan untuk pratinjau ↗</a></div>)}
    </section>
    <div className="admin-form-actions"><p>{dirty ? "Perubahan belum disimpan." : "Semua perubahan tersimpan."}</p><button type="button" className="admin-primary" disabled={!dirty || busy} onClick={() => void save()}>{busy ? "Menyimpan…" : "Simpan pilihan"}</button></div>
  </div>;
}
