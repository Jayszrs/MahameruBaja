"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contentId } from "../data/socialMedia";
import { promotionDestinations, type Promotion } from "../data/promotions";
import type { SiteContent } from "../data/siteContent";

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="editor-field">{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} />{hint && <small>{hint}</small>}</label>;
}

export default function PromotionEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  function change(update: (current: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function promotion(id: string, update: Partial<Promotion>) { change(current => ({ ...current, promotions: current.promotions.map(item => item.id === id ? { ...item, ...update } : item) })); }
  function move(index: number, direction: number) { change(current => { const promotions = [...current.promotions]; [promotions[index], promotions[index + direction]] = [promotions[index + direction], promotions[index]]; return { ...current, promotions }; }); }
  async function upload(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 4_000_000) { setError(true); setMessage("Gambar maksimal 4 MB."); return; }
    setUploading(id); setMessage(""); setError(false);
    try {
      const form = new FormData(); form.append("image", file);
      const response = await fetch("/api/admin/promotions/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gambar gagal diunggah.");
      promotion(id, { image: result.url });
      setMessage("Gambar terunggah. Simpan perubahan agar banner menggunakannya.");
    } catch (caught) { setError(true); setMessage((caught as Error).message); }
    finally { setUploading(null); }
  }
  async function save() {
    setSaving(true); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menyimpan.");
      setContent(result); setDirty(false); setMessage("Tersimpan. Banner yang terbit dan berada dalam periode tayang kini muncul di Beranda.");
    } catch (caught) { setError(true); setMessage((caught as Error).message); }
    finally { setSaving(false); }
  }
  return <div className="content-editor promotion-editor">
    <aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><img src="/mbi-mark.svg" alt="" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">01 · Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/sosial">02 · Sosial media</Link><span className="editor-sidebar-link active">03 · Banner & promo</span><Link className="editor-sidebar-link" href="/admin/permintaan">04 · Permintaan pelanggan ↗</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/#home-promos-heading" target="_blank" rel="noopener noreferrer">Lihat banner di Beranda ↗</a><form action="/api/admin/logout" method="post"><button type="submit">Keluar</button></form></div></aside>
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / Banner & promo</span><div><span className={`editor-save-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={saving || Boolean(uploading) || !dirty} onClick={save}>{saving ? "Menyimpan…" : "Simpan perubahan ↗"}</button></div></header>
      <div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">BERANDA / BANNER</p><h1>Acara & promo.<br /><em>Jelas sebelum tayang.</em></h1><p>Unggah gambar, jelaskan manfaat dan cakupannya, lalu atur tanggal tayang. Contoh tema bawaan masih berupa draf dan tidak mengklaim diskon atau harga.</p></div>
        {message && <div className={`editor-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{message}</div>}
        <div className="editor-list-heading"><h2>Banner Beranda <span>{content.promotions.length}</span></h2><button type="button" disabled={content.promotions.length >= 20} onClick={() => change(current => ({ ...current, promotions: [...current.promotions, { id: contentId(), label: "Acara Mahameru", title: "Banner baru", summary: "Jelaskan untuk siapa banner ini dan kebutuhan apa yang dilayani.", benefit: "", appliesTo: "", terms: "", image: "", imageAlt: "", startDate: "", endDate: "", ctaLabel: "Tanya kebutuhan", ctaHref: "/minta-penawaran", published: false }] }))}>+ Tambah banner</button></div>
        <p className="promotion-editor-note">Banner draf tidak tayang. Jika belum ada promo resmi yang aktif, Beranda menampilkan contoh tema acara dengan penanda yang jelas.</p>
        <fieldset className="editor-fields" disabled={saving || Boolean(uploading)}>
          {content.promotions.map((item, index) => {
            const ready = Boolean(item.benefit && item.appliesTo && item.terms && item.image && item.imageAlt);
            return <section className="editor-panel promotion-editor-panel" key={item.id}><div className="editor-panel-title"><h3><span>{String(index + 1).padStart(2, "0")}</span> {item.title}</h3><label className="editor-publish"><input type="checkbox" checked={item.published} disabled={!ready} onChange={event => promotion(item.id, { published: event.target.checked })} />Terbit</label></div>
              {!ready && <p className="promotion-editor-hint">Isi manfaat, spesifikasi/cakupan, ketentuan, gambar, dan teks gambar sebelum mengaktifkan Terbit.</p>}
              <div className="editor-grid"><Field label="Label acara" value={item.label} onChange={label => promotion(item.id, { label })} /><Field label="Judul banner" value={item.title} onChange={title => promotion(item.id, { title })} /></div>
              <label className="editor-field">Penjelasan singkat<textarea rows={3} value={item.summary} onChange={event => promotion(item.id, { summary: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Yang didapat pelanggan" value={item.benefit} onChange={benefit => promotion(item.id, { benefit })} hint="Isi nilai, potongan, atau layanan yang benar-benar berlaku; jangan gunakan angka contoh." /><Field label="Berlaku untuk material / spesifikasi" value={item.appliesTo} onChange={appliesTo => promotion(item.id, { appliesTo })} hint="Contoh: ukuran, ketebalan, jenis material, atau jumlah minimum yang resmi." /></div>
              <label className="editor-field">Syarat dan batasan<textarea rows={3} value={item.terms} onChange={event => promotion(item.id, { terms: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Mulai tayang (opsional)" type="date" value={item.startDate} onChange={startDate => promotion(item.id, { startDate })} /><Field label="Selesai tayang (opsional)" type="date" value={item.endDate} onChange={endDate => promotion(item.id, { endDate })} /></div>
              <div className="promotion-editor-media"><div>{item.image ? <img src={item.image} alt={item.imageAlt || "Pratinjau gambar banner"} /> : <span>Belum ada gambar</span>}</div><div><label className="editor-field">Unggah gambar JPG, PNG, atau WebP · maksimal 4 MB<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(item.id, event.target.files?.[0]); event.target.value = ""; }} /></label><Field label="Alamat gambar (opsional jika sudah unggah)" value={item.image} onChange={image => promotion(item.id, { image })} /><Field label="Deskripsi gambar untuk pembaca layar" value={item.imageAlt} onChange={imageAlt => promotion(item.id, { imageAlt })} /></div></div>
              <div className="editor-grid"><Field label="Teks tombol" value={item.ctaLabel} onChange={ctaLabel => promotion(item.id, { ctaLabel })} /><label className="editor-field">Tujuan tombol<select value={item.ctaHref} onChange={event => promotion(item.id, { ctaHref: event.target.value })}>{promotionDestinations.map(([href, label]) => <option value={href} key={href}>{label}</option>)}</select></label></div>
              <div className="editor-item-actions"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑ Naik</button><button type="button" disabled={index === content.promotions.length - 1} onClick={() => move(index, 1)}>↓ Turun</button>{deleteId === item.id ? <><span>Hapus banner ini?</span><button type="button" className="danger" onClick={() => { change(current => ({ ...current, promotions: current.promotions.filter(p => p.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button type="button" onClick={() => setDeleteId(null)}>Batal</button></> : <button type="button" className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button>}</div>
            </section>;
          })}
        </fieldset><p className="editor-footer-note">Tanggal mengikuti waktu Indonesia Barat. Banner akan otomatis berhenti tampil setelah tanggal selesai.</p>
      </div>
    </main>
  </div>;
}
