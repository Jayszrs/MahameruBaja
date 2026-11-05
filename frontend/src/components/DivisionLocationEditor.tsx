"use client";

import { useState } from "react";
import type { Division } from "../data/divisionCms";
import { useAdminWorkspace } from "./AdminWorkspace";

export default function DivisionLocationEditor({ initialDivision }: { initialDivision: Division }) {
  const [record, setRecord] = useState(initialDivision);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  function change(patch: Partial<Division>) { setRecord(current => ({ ...current, ...patch })); setDirty(true); setMessage(""); }
  async function save() {
    if (!record.address.trim()) { setFailed(true); setMessage("Alamat toko harus diisi."); return; }
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch(`/api/admin/divisions/${record.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Informasi lokasi belum tersimpan.");
      setRecord(result); setDirty(false); setMessage("Informasi lokasi tersimpan dan tampil di website.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  useAdminWorkspace({ dirty, busy, label: "Simpan section", disabled: !dirty, onSave: () => void save() });
  return <section className="editor-panel division-location-editor"><h2>Alamat, jam, dan peta</h2><p className="admin-field-help">Informasi ini tampil di halaman Kontak dan Beranda divisi.</p>{message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}<label className="editor-field">Alamat toko<textarea rows={3} maxLength={1000} value={record.address} onChange={event => change({ address: event.target.value })} /></label><label className="editor-field">Jam operasional<input maxLength={250} value={record.businessHours} onChange={event => change({ businessHours: event.target.value })} /><small>Contoh: Senin–Sabtu · 07.00–17.00 WIB</small></label><div className="editor-grid"><label className="editor-field">Tautan Google Maps<input value={record.mapsUrl} onChange={event => change({ mapsUrl: event.target.value })} placeholder="https://maps.app.goo.gl/..." /></label><label className="editor-field">URL peta embed<input value={record.mapEmbed} onChange={event => change({ mapEmbed: event.target.value })} placeholder="https://www.google.com/maps?...&output=embed" /></label></div><button type="button" className="admin-secondary" disabled={!dirty || busy} onClick={() => void save()}>{busy ? "Menyimpan…" : "Simpan informasi lokasi"}</button></section>;
}
