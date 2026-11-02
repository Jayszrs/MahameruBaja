"use client";

import { useRef, useState } from "react";
import type { Division } from "../data/divisionCms";
import type { SiteContent } from "../data/siteContent";
import type { SectionListRow } from "../data/sectionLists";
import { useAdminWorkspace } from "./AdminWorkspace";
import AdminOrderList, { moveBefore } from "./AdminOrderList";

type Row = Record<string, string | number | boolean> & { id: string | number };
type DraftText = { eyebrow: string; heading: string; headingTail: string; description: string };
const mainDefaults: DraftText = { eyebrow: "GAMBAR / PERHITUNGAN / PENGERJAAN", heading: "Mulai dari gambar,", headingTail: "sampai rencana pengerjaan.", description: "Diskusikan gambar kerja, kebutuhan material, dan RAB bersama tim. Kami membantu meninjau kebutuhan sebelum menyepakati ruang lingkup, biaya, serta jadwal." };
const mainSteps = [
  ["Review gambar kerja", "Bahas ukuran, sambungan, dan detail yang diperlukan."],
  ["Kebutuhan & RAB", "Siapkan daftar kebutuhan dan bahas perhitungan biayanya."],
  ["Fabrikasi & erection", "Koordinasikan produksi, finishing, dan pemasangan di lokasi."],
];

export default function AboutEngineeringWorkspace({ initialContent, initialDivisions, initialSite = "" }: { initialContent: SiteContent; initialDivisions: Division[]; initialSite?: string }) {
  const mainSite = !initialSite;
  const division = initialDivisions.find(row => row.slug === initialSite);
  const page: "about" | "home" = mainSite ? "about" : "home";
  const section = mainSite ? "engineering" : "intro";
  const ownerDivision = mainSite ? null : division?.slug || null;
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const defaultText: DraftText = mainSite ? mainDefaults : { eyebrow: "CARA KAMI MEMBANTU", heading: "", headingTail: "", description: "" };
  const textRows = content.sectionEdits.filter(row => row.page === page && row.section === section && (row.ownerDivision || null) === ownerDivision);
  const textValue = (source: string) => textRows.find(row => row.source === source)?.replacement || source;
  const listKey = "aboutEngineeringSteps";
  const savedList = content.sectionLists.find(row => row.page === page && row.section === section && (row.ownerDivision || null) === ownerDivision && row.key === listKey);
  const fallbackRows: Row[] = mainSite ? mainSteps.map(([title, description], index) => ({ id: `engineering-${index + 1}`, title, description })) : (division?.values || []).map((title, index) => ({ id: `unit-${division?.slug}-${index + 1}`, title, description: division?.process[index] || "" }));
  const rows: Row[] = (savedList?.rows.length ? savedList.rows : fallbackRows).map((row, index) => ({ ...row, id: typeof row.id === "string" || typeof row.id === "number" ? row.id : `step-${index + 1}` }));
  function changeText(source: string, label: string, replacement: string) { setContent(current => { const existing = current.sectionEdits.find(row => row.page === page && row.section === section && (row.ownerDivision || null) === ownerDivision && row.source === source); const next = { id: existing?.id || crypto.randomUUID(), page, section, ownerDivision, kind: "text" as const, source, label, replacement, published: true }; return { ...current, sectionEdits: [...current.sectionEdits.filter(row => row.id !== existing?.id), next] }; }); setDirty(true); }
  function saveRows(nextRows: Row[]) { const next = { id: savedList?.id || crypto.randomUUID(), page, section, ownerDivision, key: listKey, rows: nextRows, published: true }; setContent(current => ({ ...current, sectionLists: [...current.sectionLists.filter(row => !(row.page === page && row.section === section && (row.ownerDivision || null) === ownerDivision && row.key === listKey)), next] })); setDirty(true); }
  function updateRow(id: string | number, patch: Record<string, string>) { saveRows(rows.map(row => row.id === id ? { ...row, ...patch } : row)); }
  function addRow() { saveRows([...rows, { id: crypto.randomUUID(), title: "Tahapan baru", description: "" }]); }
  async function save() { if (busy) return; setBusy(true); setFailed(false); setMessage(""); try { const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base.current }) }); const saved = await response.json(); if (!response.ok) throw new Error(saved.message || "Section belum tersimpan."); setContent(saved); base.current = saved; setDirty(false); setMessage("Perubahan tersimpan dan tampil di website."); } catch (error) { setFailed(true); setMessage((error as Error).message); } finally { setBusy(false); } }
  useAdminWorkspace({ dirty, busy, label: "Simpan section", disabled: !dirty, onSave: () => void save() });
  return <div className="about-engineering-workspace">{message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}<section className="editor-panel"><h2>{mainSite ? "Cara Membantu" : "Cara Kami Membantu"}</h2><p className="admin-field-help">Kolom berikut dibaca dari bagian yang tampil pada website. Perubahan mengikuti Website yang dipilih.</p><div className="editor-grid"><label className="editor-field">Judul bagian<input value={textValue(defaultText.eyebrow)} onChange={event => changeText(defaultText.eyebrow, "Judul bagian", event.target.value)} /></label>{mainSite && <><label className="editor-field">Heading utama<input value={textValue(mainDefaults.heading)} onChange={event => changeText(mainDefaults.heading, "Heading utama", event.target.value)} /></label><label className="editor-field">Lanjutan heading<input value={textValue(mainDefaults.headingTail)} onChange={event => changeText(mainDefaults.headingTail, "Lanjutan heading", event.target.value)} /></label></>}</div>{mainSite && <label className="editor-field">Paragraf pengantar<textarea rows={4} value={textValue(mainDefaults.description)} onChange={event => changeText(mainDefaults.description, "Paragraf pengantar", event.target.value)} /></label>}</section><section className="editor-panel"><div className="editor-panel-title"><h3>Urutan tahapan</h3><button type="button" className="admin-primary" disabled={rows.length >= 12} onClick={addRow}>+ Tambah tahapan</button></div><AdminOrderList label="Urutan tahapan" items={rows.map((row, index) => ({ id: String(row.id), title: String(row.title || `Tahapan ${index + 1}`), detail: String(row.description || "") }))} onMove={(from, to) => saveRows(moveBefore(rows.map(row => ({ ...row, id: String(row.id) })), from, to))} />{rows.map((row, index) => <article className="editor-panel about-engineering-step" key={String(row.id)}><div className="editor-panel-title"><h4>{String(index + 1).padStart(2, "0")} · {String(row.title || "Tahapan")}</h4><button type="button" className="admin-danger" onClick={() => saveRows(rows.filter(item => item.id !== row.id))}>Hapus</button></div><label className="editor-field">Judul tahapan<input value={String(row.title || "")} onChange={event => updateRow(row.id, { title: event.target.value })} /></label><label className="editor-field">Penjelasan tahapan<textarea rows={3} value={String(row.description || "")} onChange={event => updateRow(row.id, { description: event.target.value })} /></label></article>)}</section></div>;
}
