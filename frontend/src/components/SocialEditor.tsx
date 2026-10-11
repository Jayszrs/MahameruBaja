"use client";
import { useEffect, useState } from "react";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import AdminViewTabs from "./AdminViewTabs";
import type { SiteContent } from "../data/siteContent";
import { contentId, socialPlatforms, platformLabels, type SocialPost } from "../data/socialMedia";

export default function SocialEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [socialTab, setSocialTab] = useAdminView("tab", ["accounts", "posts"] as const, "accounts");
  function change(update: (c: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function post(id: string, update: Partial<SocialPost>) { change(c => ({ ...c, socialPosts: c.socialPosts.map(p => p.id === id ? { ...p, ...update } : p) })); }
  async function save() {
    setSaving(true); setError(false);
    try { const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) }); const body = await r.json(); if (!r.ok) throw new Error(body.message); setContent(body); setDirty(false); workspace.refreshDashboard(); setMessage("Tersimpan. Refresh halaman publik untuk melihat perubahan."); }
    catch (e) { setError(true); setMessage((e as Error).message); } finally { setSaving(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy: saving, label: "Simpan perubahan", disabled: !dirty, onSave: save });
  return <div className="content-editor"><div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">KANAL & CERITA</p><h1>Satu tempat.<br /><em>Semua kanal sosial.</em></h1><p>Masukkan akun resmi dan tautan unggahan asli. Konten terbit muncul di beranda serta halaman Sosial Media. Video dimuat setelah pengunjung menekan Putar agar halaman tetap ringan.</p></div>{message && <div className={`editor-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{message}</div>}<fieldset className="editor-fields" disabled={saving}>
    <AdminViewTabs disabled={saving} label="Pilihan kanal sosial" value={socialTab} onChange={setSocialTab} options={[{value:"accounts",label:"Akun sosial"},{value:"posts",label:"Unggahan sosial"}]} />
    {(socialTab === "accounts" ? socialPlatforms : []).map(platform => {
      const account = content.socialAccounts.find(a => a.platform === platform) || { platform, handle: "", url: "", published: false };
      const update = (fields: Partial<typeof account>) => change(c => ({ ...c, socialAccounts: [...c.socialAccounts.filter(a => a.platform !== platform), { ...account, ...fields }] }));
      return <section key={platform} className="editor-panel"><div className="editor-panel-title"><h2>{platformLabels[platform]}</h2><label className="editor-publish"><input type="checkbox" checked={account.published} onChange={e => update({ published: e.target.checked })} />Terbit</label></div><div className="editor-grid"><label className="editor-field">Username / nama kanal<input value={account.handle} onChange={e => update({ handle: e.target.value })} placeholder="@akunresmi" /></label><label className="editor-field">URL profil resmi<input type="url" value={account.url} onChange={e => update({ url: e.target.value })} placeholder="https://..." /></label></div></section>;
    })}
    {socialTab === "posts" && <><div className="editor-list-heading"><h2>Unggahan pilihan <span>{content.socialPosts.length}</span></h2><button onClick={() => change(c => ({ ...c, socialPosts: [...c.socialPosts, { id: contentId(), platform: "instagram", title: "Unggahan baru", caption: "", url: "", image: "", published: false }] }))}>+ Tambah unggahan</button></div>
    {content.socialPosts.map((item, i) => <section className="editor-panel" key={item.id}><div className="editor-panel-title"><h3>{String(i + 1).padStart(2, "0")} · {item.title}</h3><label className="editor-publish"><input type="checkbox" checked={item.published} onChange={e => post(item.id, { published: e.target.checked })} />Terbit</label></div><div className="editor-grid"><label className="editor-field">Platform<select value={item.platform} onChange={e => post(item.id, { platform: e.target.value as SocialPost["platform"] })}>{socialPlatforms.map(p => <option key={p} value={p}>{platformLabels[p]}</option>)}</select></label><label className="editor-field">Judul<input value={item.title} onChange={e => post(item.id, { title: e.target.value })} /></label><label className="editor-field">Tautan unggahan asli<input value={item.url} type="url" onChange={e => post(item.id, { url: e.target.value })} /></label><label className="editor-field">Gambar sampul: /images/... atau HTTPS<input value={item.image} onChange={e => post(item.id, { image: e.target.value })} /></label></div><label className="editor-field">Keterangan<textarea rows={3} value={item.caption} onChange={e => post(item.id, { caption: e.target.value })} /></label><div className="editor-item-actions"><button disabled={i === 0} onClick={() => change(c => { const socialPosts = [...c.socialPosts]; [socialPosts[i - 1], socialPosts[i]] = [socialPosts[i], socialPosts[i - 1]]; return { ...c, socialPosts }; })}>↑ Naik</button><button disabled={i === content.socialPosts.length - 1} onClick={() => change(c => { const socialPosts = [...c.socialPosts]; [socialPosts[i + 1], socialPosts[i]] = [socialPosts[i], socialPosts[i + 1]]; return { ...c, socialPosts }; })}>↓ Turun</button>{deleteId === item.id ? <><span>Hapus unggahan ini?</span><button className="danger" onClick={() => { change(c => ({ ...c, socialPosts: c.socialPosts.filter(p => p.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button onClick={() => setDeleteId(null)}>Batal</button></> : <button className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button>}</div></section>)}
    {!content.socialPosts.length && <div className="editor-empty"><h3>Siapkan cerita pertama.</h3><p>Tambahkan tautan unggahan dari akun perusahaan yang sudah diverifikasi.</p></div>}
    </>}</fieldset></div></div>;
}
