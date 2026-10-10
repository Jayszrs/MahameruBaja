"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { contentId } from "../data/socialMedia";
import { divisions } from "../data/divisionContent";
import { type SiteContent, type TeamContact } from "../data/siteContent";

function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="editor-field">{label}<input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

export default function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"contacts" | "reviews">("contacts");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change(update: (value: SiteContent) => SiteContent) { setContent(update); setDirty(true); setStatus(""); }
  function contact(id: string, update: Partial<TeamContact>) { change(c => ({ ...c, contacts: c.contacts.map(item => item.id === id ? { ...item, ...update } : item) })); }
  function review(id: string, update: Partial<SiteContent["reviews"][number]>) { change(c => ({ ...c, reviews: c.reviews.map(item => item.id === id ? { ...item, ...update } : item) })); }
  async function save() {
    setSaving(true); setStatus(""); setFailed(false);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menyimpan.");
      setContent(result); setDirty(false); setStatus("Tersimpan. Konten terbit sudah diperbarui di situs.");
    } catch (error) { setFailed(true); setStatus((error as Error).message); }
    finally { setSaving(false); }
  }
  function move(index: number, direction: number) {
    change(c => {
      const list = [...c[tab]];
      [list[index], list[index + direction]] = [list[index + direction], list[index]];
      return { ...c, [tab]: list };
    });
  }
  return <div className="content-editor">
    <aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><img src="/mbi-mark.svg" alt="" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><p>WEBSITE</p><button className={tab === "contacts" ? "active" : ""} onClick={() => { setTab("contacts"); setDeleteId(null); }}><span>01</span> Kontak & divisi <b>{content.contacts.length}</b></button><button className={tab === "reviews" ? "active" : ""} onClick={() => { setTab("reviews"); setDeleteId(null); }}><span>02</span> Ulasan Google <b>{content.reviews.length}</b></button><Link className="editor-sidebar-link" href="/admin/sosial">03 &middot; Sosial media &#8599;</Link><Link className="editor-sidebar-link" href="/admin/promosi">04 &middot; Banner & promo &#8599;</Link><Link className="editor-sidebar-link" href="/admin/artikel">05 &middot; Artikel &amp; panduan &#8599;</Link><Link className="editor-sidebar-link" href="/admin/permintaan">06 &middot; Permintaan pelanggan &#8599;</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/" target="_blank" rel="noopener noreferrer">Buka website ↗</a><form action="/api/admin/logout" method="post"><button type="submit">Keluar</button></form></div></aside>
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / {tab === "contacts" ? "Kontak & divisi" : "Ulasan Google"}</span><div><span className={`editor-save-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={saving || !dirty} onClick={save}>{saving ? "Menyimpan…" : "Simpan perubahan ↗"}</button></div></header>
    <div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">KONTEN / {tab === "contacts" ? "01" : "02"}</p><h1>{tab === "contacts" ? <>Lebih dekat.<br /><em>Lebih mudah dihubungi.</em></> : <>Suara pelanggan.<br /><em>Tampilkan cerita asli.</em></>}</h1><p>{tab === "contacts" ? "Kelola nama, nomor, foto, dan divisi yang dilayani. Kontak terbit tampil di halaman Kontak dan profil divisi terkait." : "Salin ulasan sesuai sumber Google: nama, bintang, komentar, dan tautan. Ulasan terbit bergerak ke kanan di beranda."}</p></div>
    {status && <div className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{status}</div>}
    <fieldset disabled={saving} className="editor-fields">
    {tab === "reviews" && <section className="editor-panel"><div className="editor-panel-title"><h2>Ringkasan Google Maps</h2><span>Catatan manual</span></div><div className="editor-grid"><label className="editor-field">Rating rata-rata<input type="number" min="0" max="5" step="0.1" value={content.rating} onChange={e => change(c => ({ ...c, rating: Number(e.target.value) }))} /></label><label className="editor-field">Jumlah ulasan<input type="number" min="0" value={content.reviewCount ?? ""} onChange={e => change(c => ({ ...c, reviewCount: e.target.value === "" ? null : Number(e.target.value) }))} /></label><Field label="Tanggal pencatatan" value={content.ratingDate} onChange={ratingDate => change(c => ({ ...c, ratingDate }))} /><Field label="Tautan Google Maps" type="url" value={content.mapsUrl} onChange={mapsUrl => change(c => ({ ...c, mapsUrl }))} /></div></section>}
    <div className="editor-list-heading"><h2>{tab === "contacts" ? "Daftar kontak" : "Daftar ulasan"} <span>{content[tab].length}</span></h2><button type="button" onClick={() => change(c => tab === "contacts" ? { ...c, contacts: [...c.contacts, { id: contentId(), name: "Kontak baru", role: "Tim", phone: "", mobile: "", whatsapp: "", email: "", photo: "", divisions: [], published: false }] } : { ...c, reviews: [...c.reviews, { id: contentId(), author: "", rating: 5, text: "", when: "", url: c.mapsUrl, published: false }] })}>+ Tambah {tab === "contacts" ? "kontak" : "ulasan"}</button></div>
    {!content[tab].length && <div className="editor-empty"><span>“</span><h3>Mulai dengan satu cerita pelanggan.</h3><p>Tambahkan ulasan asli, periksa teksnya, lalu aktifkan Terbit dan simpan.</p></div>}
    {content[tab].map((item, index) => <section className="editor-panel" key={item.id}><div className="editor-panel-title"><h3><span>{String(index + 1).padStart(2, "0")}</span> {"name" in item ? item.name : item.author || "Ulasan baru"}</h3><label className="editor-publish"><input type="checkbox" checked={item.published} onChange={e => tab === "contacts" ? contact(item.id, { published: e.target.checked }) : review(item.id, { published: e.target.checked })} />Terbit</label></div>
      {"name" in item ? <><div className="editor-grid"><Field label="Nama" value={item.name} onChange={name => contact(item.id, { name })} /><Field label="Jabatan" value={item.role} onChange={role => contact(item.id, { role })} /><Field label="Telepon" type="tel" value={item.phone} onChange={phone => contact(item.id, { phone })} /><Field label="Seluler" type="tel" value={item.mobile} onChange={mobile => contact(item.id, { mobile })} /><Field label="WhatsApp" type="tel" value={item.whatsapp} onChange={whatsapp => contact(item.id, { whatsapp })} /><Field label="Email" type="email" value={item.email} onChange={email => contact(item.id, { email })} /><Field label="Foto: URL HTTPS atau /images/..." value={item.photo} onChange={photo => contact(item.id, { photo })} /></div><div className="editor-divisions"><strong>Divisi yang dilayani</strong><p>Kosongkan semua pilihan untuk menampilkan sebagai kontak bersama.</p>{divisions.map(d => <label key={d.slug}><input type="checkbox" checked={item.divisions.includes(d.slug)} onChange={e => contact(item.id, { divisions: e.target.checked ? [...item.divisions, d.slug] : item.divisions.filter(s => s !== d.slug) })} />{d.label}</label>)}</div></> : <><div className="editor-grid"><Field label="Nama penulis (sesuai Google)" value={item.author} onChange={author => review(item.id, { author })} /><label className="editor-field">Bintang<select value={item.rating} onChange={e => review(item.id, { rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"★".repeat(n)} — {n}/5</option>)}</select></label><Field label="Tanggal / waktu ulasan" value={item.when} onChange={when => review(item.id, { when })} /><Field label="Tautan sumber Google" type="url" value={item.url} onChange={url => review(item.id, { url })} /></div><label className="editor-field">Komentar asli<textarea rows={4} value={item.text} onChange={e => review(item.id, { text: e.target.value })} /></label><div className="editor-review-preview"><span>{"★".repeat(item.rating)}</span><p>{item.text || "Pratinjau komentar akan muncul di sini."}</p><strong>{item.author || "Nama pelanggan"}</strong></div></>}
      <div className="editor-item-actions"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑ Naik</button><button type="button" disabled={index === content[tab].length - 1} onClick={() => move(index, 1)}>↓ Turun</button>{deleteId === item.id ? <><span>Hapus item ini?</span><button type="button" className="danger" onClick={() => { change(c => ({ ...c, [tab]: c[tab].filter(v => v.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button type="button" onClick={() => setDeleteId(null)}>Batal</button></> : <button type="button" className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button>}</div>
    </section>)}
    </fieldset><p className="editor-footer-note">Konten tersimpan di server situs. Aktifkan Terbit hanya setelah nomor atau kutipan selesai diperiksa.</p></div></main>
  </div>;
}
