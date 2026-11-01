"use client";
import { useState } from "react";
import type { SiteContent } from "../data/siteContent";
import type { Division } from "../data/divisionCms";
import { uploadCmsFile } from "../lib/cmsUpload";
import AdminViewTabs from "./AdminViewTabs";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import SectionContentEditor from "./SectionContentEditor";
import { useAdminWorkspace } from "./AdminWorkspace";

type Mode = "all" | "text" | "image" | "faq";
type CardDraft = Pick<Division, "id" | "revision" | "slug" | "name" | "label" | "intro" | "hero" | "logo" | "routeMedia" | "primary">;

function cardOf(row: Division): CardDraft {
  return { id: row.id, revision: row.revision, slug: row.slug, name: row.name, label: row.label, intro: row.intro, hero: row.hero, logo: row.logo, routeMedia: row.routeMedia, primary: row.primary };
}

export default function HomeNetworkEditor({ initialContent, initialDivisions, ownerDivision = null, url = "/" }: { initialContent: SiteContent; initialDivisions: Division[]; ownerDivision?: string | null; url?: string }) {
  const [mode, setMode] = useState<Mode>("all");
  const [cards, setCards] = useState(() => initialDivisions.map(cardOf));
  const [selected, setSelected] = useState(initialDivisions.find(row => row.slug === ownerDivision)?.id || initialDivisions[0]?.id || "");
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const current = cards.find(row => row.id === selected);
  const appearance = content.websiteAppearance.find(row => (row.ownerDivision || null) === ownerDivision) || content.websiteAppearance[0];
  const faqRows = appearance?.needs || [];
  const dirtyCards = JSON.stringify(cards) !== JSON.stringify(initialDivisions.map(cardOf));
  const dirtyFaq = JSON.stringify(content.websiteAppearance) !== JSON.stringify(initialContent.websiteAppearance);
  useAdminWorkspace({ dirty: dirtyCards || dirtyFaq, busy, label: "Simpan jaringan", disabled: !dirtyCards && !dirtyFaq, onSave: async () => { if (dirtyCards && current) { await saveCard(); await saveOrder(); } if (dirtyFaq) await saveFaq(); } });
  const text = <SectionContentEditor initialContent={initialContent} page="home" section="divisions" url={url} ownerDivision={ownerDivision} hideImages hideGuidance hideActions hiddenLabels={["Subjudul", "Teks tombol / tautan"]} />;

  function updateCard(patch: Partial<CardDraft>) {
    setCards(rows => rows.map(row => row.id === selected ? { ...row, ...patch } : row));
    setMessage("");
  }
  async function saveCard() {
    if (!current) return;
    setBusy(true); setFailed(false); setMessage("");
    try {
      const source = initialDivisions.find(row => row.id === current.id);
      if (!source) throw new Error("Kartu divisi tidak ditemukan.");
      const response = await fetch(`/api/admin/divisions/${current.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...source, ...current, revision: current.revision }) });
      const next = await response.json();
      if (!response.ok) throw new Error(next.message || "Kartu belum tersimpan.");
      setCards(rows => rows.map(row => row.id === current.id ? cardOf(next) : row));
      setMessage("Kartu divisi tersimpan.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan kartu."); }
    finally { setBusy(false); }
  }
  async function saveOrder() {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/divisions/reorder", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cards.map(row => ({ id: row.id, revision: row.revision })) }) });
      const next = await response.json();
      if (!response.ok) throw new Error(next.message || "Urutan kartu belum tersimpan.");
      setCards(next.map(cardOf));
      setMessage("Urutan kartu tersimpan.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan urutan."); }
    finally { setBusy(false); }
  }
  async function upload(key: "hero" | "logo" | "routeMedia", file: File) {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const src = await uploadCmsFile(file, "image", current?.slug || null);
      updateCard(key === "routeMedia" ? { routeMedia: { type: "image", media: src } } : { [key]: src });
      setMessage("Gambar selesai diunggah. Klik Simpan jaringan.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal mengunggah gambar."); }
    finally { setBusy(false); }
  }
  function updateFaq(id: string, patch: Partial<typeof faqRows[number]>) {
    setContent(value => ({ ...value, websiteAppearance: value.websiteAppearance.map(row => row === appearance ? { ...row, needs: row.needs.map(item => item.id === id ? { ...item, ...patch } : item) } : row) }));
  }
  async function saveFaq() {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: initialContent }) });
      const next = await response.json(); if (!response.ok) throw new Error(next.message || "FAQ belum tersimpan.");
      setContent(next); setMessage("Quick FAQ tersimpan.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan FAQ."); }
    finally { setBusy(false); }
  }
  const image = <section className="home-network-image-editor">
    <AdminOrderList label="Urutan kartu website divisi" items={cards.map(row => ({ id: row.id, title: row.name, image: row.routeMedia?.media || row.hero }))} selected={selected} onSelect={setSelected} onMove={(from, to) => setCards(rows => moveBefore(rows, from, to))} disabled={busy} />
    {current && <section className="editor-panel"><h3>{current.name}</h3><div className="editor-grid">
      <label className="editor-field">Title Kartu<input value={current.label} onChange={event => updateCard({ label: event.target.value })} /></label>
      <label className="editor-field">Judul<input value={current.name} onChange={event => updateCard({ name: event.target.value })} /></label>
      <label className="editor-field">Deskripsi<textarea rows={4} value={current.intro} onChange={event => updateCard({ intro: event.target.value })} /></label>
      <label className="editor-field">URL Tujuan<input value={current.primary.href} onChange={event => updateCard({ primary: { ...current.primary, href: event.target.value } })} /></label>
      <label className="editor-field">Logo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload("logo", file); }} /><small>{current.logo || "Belum ada logo"}</small></label>
      <label className="editor-field">Background<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload("routeMedia", file); }} /><small>{current.routeMedia?.media || current.hero || "Belum ada background"}</small></label>
    </div></section>}
  </section>;
  const faq = <section className="home-network-faq"><div className="editor-list-heading"><h2>Quick Call to Action — Mulai dari kebutuhan Anda</h2><button type="button" className="admin-primary" disabled={busy || !dirtyFaq} onClick={() => void saveFaq()}>Simpan CTA</button></div>{faqRows.map((row, index) => <div className="editor-panel" key={row.id}><div className="editor-panel-title"><h3>{index + 1}. Pertanyaan</h3></div><label className="editor-field">Pertanyaan<input value={row.title} onChange={event => updateFaq(row.id, { title: event.target.value })} /></label><label className="editor-field">URL tujuan<input value={row.href} onChange={event => updateFaq(row.id, { href: event.target.value })} /></label></div>)}</section>;
  return <div className="home-network-editor"><AdminViewTabs value={mode} onChange={setMode} label="Jenis isi section" options={[{ value: "all", label: "Semua" }, { value: "text", label: "Tulisan" }, { value: "image", label: "Gambar" }, { value: "faq", label: "FAQ" }]} />{message && <p className={`editor-notice ${failed ? "error" : "success"}`}>{message}</p>}{mode === "all" ? <>{text}{image}{faq}</> : mode === "text" ? text : mode === "image" ? image : faq}</div>;
}
