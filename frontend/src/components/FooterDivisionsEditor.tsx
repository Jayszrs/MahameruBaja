"use client";
import { useRef, useState } from "react";
import type { Division } from "../data/divisionCms";
import type { SiteContent, TeamContact } from "../data/siteContent";
import { contactVisibleInDivision } from "../data/siteContent";
import { useAdminIdentity } from "./AdminIdentity";
import { useAdminWorkspace } from "./AdminWorkspace";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import { imageAddressHelp, imageAddressLabel } from "../lib/cmsUpload";
import { uploadCmsFile } from "../lib/cmsUpload";

export default function FooterDivisionsEditor({ initialDivisions, initialContent }: { initialDivisions: Division[]; initialContent: SiteContent }) {
  const actor = useAdminIdentity();
  const [divisions, setDivisions] = useState(initialDivisions);
  const baseDivisions = useRef(initialDivisions);
  const [content, setContent] = useState(initialContent);
  const baseContent = useRef(initialContent);
  const [selected, setSelected] = useState(initialDivisions[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const divisionDirty = JSON.stringify(divisions) !== JSON.stringify(baseDivisions.current);
  const contactsDirty = JSON.stringify(content.contacts) !== JSON.stringify(baseContent.current.contacts);
  const dirty = divisionDirty || contactsDirty || orderDirty;
  const division = divisions.find(row => row.id === selected) || divisions[0];
  const contacts = division ? content.contacts.filter(row => row.published && contactVisibleInDivision(row, division.slug)) : [];

  function updateDivision(id: string, patch: Partial<Division>) {
    setDivisions(rows => rows.map(row => row.id === id ? { ...row, ...patch } : row));
    setMessage("");
  }
  function updateContact(id: string, patch: Partial<TeamContact>) {
    setContent(current => ({ ...current, contacts: current.contacts.map(row => row.id === id ? { ...row, ...patch } : row) }));
    setMessage("");
  }
  async function uploadLogo(file: File) {
    if (!division) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const logo = await uploadCmsFile(file, "image", division.slug);
      updateDivision(division.id, { logo });
      setMessage("Logo selesai diunggah. Simpan section untuk menerapkannya.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  function addContact() {
    if (!division || contacts.length >= 20) return;
    const row: TeamContact = { id: crypto.randomUUID(), name: "Admin baru", role: "Admin divisi", phone: "", mobile: "", whatsapp: "", email: "", photo: "", ownerDivision: actor.division || null, divisions: [division.slug], published: true };
    setContent(current => ({ ...current, contacts: [row, ...current.contacts] }));
  }
  async function save() {
    if (busy) return;
    setBusy(true); setFailed(false); setMessage("");
    try {
      let savedDivisions = [...divisions];
      for (const row of savedDivisions) {
        const original = baseDivisions.current.find(base => base.id === row.id);
        if (!original || JSON.stringify(row) === JSON.stringify(original)) continue;
        const response = await fetch(`/api/admin/divisions/${row.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) });
        const saved = await response.json();
        if (!response.ok) throw new Error(saved.message || `Perubahan ${row.name} belum tersimpan.`);
        savedDivisions = savedDivisions.map(item => item.id === saved.id ? saved : item);
        baseDivisions.current = baseDivisions.current.map(item => item.id === saved.id ? saved : item);
      }
      setDivisions(savedDivisions);
      if (JSON.stringify(content.contacts) !== JSON.stringify(baseContent.current.contacts)) {
        const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: baseContent.current }) });
        const saved = await response.json();
        if (!response.ok) throw new Error(saved.message || "Perubahan kontak admin belum tersimpan.");
        setContent(saved); baseContent.current = saved;
      }
      if (orderDirty) {
        const response = await fetch("/api/admin/divisions/reorder", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: savedDivisions.map(({ id, revision }) => ({ id, revision })) }) });
        const saved = await response.json();
        if (!response.ok) throw new Error(saved.message || "Urutan divisi belum tersimpan.");
        savedDivisions = saved; setDivisions(saved); baseDivisions.current = saved; setOrderDirty(false);
      }
      baseDivisions.current = savedDivisions;
      setMessage("");
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: "Simpan section", disabled: !dirty, onSave: save });

  return <div className="footer-divisions-editor">
    <AdminOrderList label="Urutan divisi di Footer" disabled={busy} selected={selected} items={divisions.map(row => ({ id: row.id, title: row.name, detail: row.address, image: row.logo }))} onSelect={setSelected} onMove={(from, to) => { setDivisions(rows => moveBefore(rows, from, to)); setOrderDirty(true); setMessage(""); }} />
    {message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}
    {division && <section className="editor-panel footer-division-edit-card"><h3>{division.name}</h3><fieldset disabled={busy}>
      <div className="footer-division-edit-grid">
        <label className="editor-field">Nama divisi<input maxLength={160} value={division.name} onChange={event => updateDivision(division.id, { name: event.target.value })} /></label>
        <label className="editor-field">Alamat yang tampil di Footer<textarea rows={3} maxLength={1000} value={division.address} onChange={event => updateDivision(division.id, { address: event.target.value })} /></label>
        <label className="editor-field">Tautan tombol Buka website divisi<input maxLength={250} placeholder={`/unit/${division.slug}`} value={division.footerHref || `/unit/${division.slug}`} onChange={event => updateDivision(division.id, { footerHref: event.target.value })} /><small>Gunakan tautan internal, misalnya /unit/{division.slug}.</small></label>
        <div className="footer-division-logo-edit">{division.logo && <img src={division.logo} alt={`Pratinjau logo ${division.name}`} />}<label className="editor-field">Unggah logo dari perangkat<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadLogo(file); }} /></label><label className="editor-field">{imageAddressLabel}<input value={division.logo} placeholder="https://.../logo.webp" onChange={event => updateDivision(division.id, { logo: event.target.value })} /><small>{imageAddressHelp}</small></label></div>
      </div>
      <div className="footer-admin-contacts"><div className="editor-list-heading"><h3>Admin divisi</h3><button type="button" className="admin-secondary" disabled={contacts.length >= 20} onClick={addContact}>+ Tambah admin</button></div>
        {contacts.length ? contacts.map(contact => <div className="footer-admin-contact-row" key={contact.id}><label className="editor-field">Nama admin<input maxLength={100} value={contact.name} onChange={event => updateContact(contact.id, { name: event.target.value })} /></label><label className="editor-field">Nomor telepon / WhatsApp<input maxLength={30} value={contact.whatsapp || contact.mobile || contact.phone} onChange={event => updateContact(contact.id, { phone: event.target.value, whatsapp: event.target.value })} /></label></div>) : <p>Belum ada admin yang ditampilkan di Footer divisi ini.</p>}
        <p className="admin-field-help">Kontak ini digunakan bersama oleh Footer dan halaman Kontak divisi.</p>
      </div>
    </fieldset></section>}
  </div>;
}
