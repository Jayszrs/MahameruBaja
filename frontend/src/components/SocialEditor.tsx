"use client";
import { imageUploadHelp, uploadCmsFile, videoUploadHelp } from "../lib/cmsUpload";
import { useDivisionDirectory } from "./DivisionDirectory";
import ContentOwnership from "./ContentOwnership";
import {originalInstagramMedia} from "../data/instagramArchive";
import SocialPhotoGallery from "./SocialPhotoGallery";
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import AdminDialog from "./AdminDialog";
import { useAdminIdentity } from "./AdminIdentity";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "./CmsImage";
import { mainLogo } from "../data/companyIdentity";

import { accountDivisionSlugs, socialEmbedUrl } from "../data/socialMedia";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import AdminViewTabs from "./AdminViewTabs";
import type { SiteContent } from "../data/siteContent";
import { contentId, socialAccountSchema, socialPostSchema, socialPlatforms, platformLabels, type SocialPost } from "../data/socialMedia";

export default function SocialEditor({ initialContent }: { initialContent: SiteContent }) {
  const actor = useAdminIdentity();
  const { divisions } = useDivisionDirectory();
  const [content, setContent] = useState(initialContent);
  const baseContent = useRef(initialContent);
  const [dirty, setDirty] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [socialTab, setSocialTab] = useAdminView("tab", ["accounts", "posts"] as const, "accounts");
  function change(update: (c: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function post(id: string, update: Partial<SocialPost>) { change(c => ({ ...c, socialPosts: c.socialPosts.map(p => p.id === id ? { ...p, ...update, published: true } : p) })); }
  function addAccount() {
    const id=contentId();
    change(c=>({...c,socialAccounts:[{id,ownerDivision:actor.division,divisions:actor.division?[actor.division]:[],platform:"instagram",handle:"",url:"",published:true},...c.socialAccounts]}));
    focusEditorRecord(`account-${id}`);
  }
  function addPost() {
    const id=contentId();
    change(c=>({...c,socialPosts:[{id,platform:"instagram",title:"Unggahan baru",caption:"",url:"",image:"",published:true,ownerDivision:actor.division,division:actor.division||divisions[0]?.slug||"laser-cutting",handle:""},...c.socialPosts]}));
    focusEditorRecord(`social-${id}`);
  }
  async function uploadCover(id: string, file: File) {
    setSaving(true); setError(false); setMessage("");
    try {
      const url = await uploadCmsFile(file, "image", content.socialPosts.find(p=>p.id===id)?.ownerDivision || null);
      post(id, { image: url }); setMessage("Sampul diunggah. Simpan perubahan untuk menampilkannya di website.");
    } catch(error) { setError(true); setMessage((error as Error).message); }
    finally { setSaving(false); }
  }
  async function uploadVideo(id: string, file: File) {
    setSaving(true); setError(false); setMessage("");
    try {
      const url = await uploadCmsFile(file, "video", content.socialPosts.find(p=>p.id===id)?.ownerDivision || null);
      post(id, { videoUrl: url }); setMessage("Video diunggah. Simpan perubahan untuk menampilkan video di website.");
    } catch (error) { setError(true); setMessage((error as Error).message); }
    finally { setSaving(false); }
  }
  async function save() {
    if (saving) return;
    for (const account of content.socialAccounts) {
      const parsed = socialAccountSchema.safeParse(account);
      if (!parsed.success) { setError(true); setMessage(`${account.handle || "Akun baru"}: ${parsed.error.issues[0]?.message}`); setSocialTab("accounts"); return; }
    }
    for (const item of content.socialPosts) {
      const parsed = socialPostSchema.safeParse(item);
      if (!parsed.success) { setError(true); setMessage(`${item.title || "Unggahan baru"}: ${parsed.error.issues[0]?.message}`); setSocialTab("posts"); return; }
    }
    setSaving(true); setError(false);
    try { const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: baseContent.current }) }); const body = await r.json(); if (!r.ok) throw new Error(body.message); setContent(body); baseContent.current = body; setDirty(false); workspace.refreshDashboard(); setMessage("Tersimpan. Refresh halaman publik untuk melihat perubahan."); }
    catch (e) { setError(true); setMessage((e as Error).message); } finally { setSaving(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy: saving, label: "Simpan perubahan", disabled: !dirty, onSave: save });
  return <div className="content-editor"><aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><Image src={mainLogo} alt="MBI Laser Cutting" width={64} height={58} sizes="64px" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">01 · Kontak & ulasan</Link><span className="editor-sidebar-link active">02 · Sosial media</span><Link className="editor-sidebar-link" href="/admin/promosi">03 · Banner & promo ↗</Link><Link className="editor-sidebar-link" href="/admin/artikel">Artikel &amp; panduan &#8599;</Link><Link className="editor-sidebar-link" href="/admin/permintaan">04 · Permintaan pelanggan ↗</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/sosial-media" target="_blank" rel="noopener noreferrer">Lihat halaman sosial ↗</a><form action="/api/admin/logout" method="post"><button type="submit">Keluar</button></form></div></aside><main className="editor-main"><header className="editor-topbar"><span>Workspace / Sosial media</span><div><span className="editor-save-state">{dirty ? "Belum disimpan" : "Tersimpan"}</span><button className="editor-save" onClick={save} disabled={!dirty || saving}>{saving ? "Menyimpan…" : "Simpan perubahan ↗"}</button></div></header><div className="editor-content"><div className="editor-title"><h1>Sosial media</h1><p>Masukkan akun resmi dan tautan unggahan asli. Perubahan yang disimpan langsung muncul di beranda serta halaman Sosial Media. Kartu dapat menampilkan foto atau video asli langsung tanpa bingkai platform. Gunakan URL post/reel, bukan URL profil.</p></div>{message && <div className={`editor-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{message}</div>}{saving && <p className="editor-notice" role="status">Sedang mengunggah media atau menyimpan perubahan. Tunggu hingga selesai.</p>}<fieldset className="editor-fields" disabled={saving}>
    <AdminViewTabs disabled={saving} label="Pilihan kanal sosial" value={socialTab} onChange={setSocialTab} options={[{value:"accounts",label:"Akun sosial"},{value:"posts",label:"Unggahan sosial"}]} />
    {socialTab === "accounts" && <><div className="editor-list-heading"><h2>Akun resmi tiap divisi</h2><button onClick={addAccount}>+ Tambah akun</button></div>
    <AdminOrderList label="Urutan akun" disabled={saving} items={content.socialAccounts.map(account=>({id:account.id!,title:account.handle || "Akun baru",detail:platformLabels[account.platform]}))} onSelect={id=>focusEditorRecord(`account-${id}`)} onMove={(from,to)=>change(c=>({...c,socialAccounts:moveBefore(c.socialAccounts.map(account=>({...account,id:account.id!})),from,to)}))}/>
    {content.socialAccounts.map((account, index) => {
      const update = (fields: Partial<typeof account>) => change(c => ({ ...c, socialAccounts: c.socialAccounts.map((a,i) => i === index ? { ...a, ...fields, published: true } : a) }));
      return <section key={account.id} id={`account-${account.id}`} className="editor-panel"><div className="editor-panel-title"><h2>{platformLabels[account.platform]} · {account.handle || "Akun baru"}</h2></div><ContentOwnership value={account} onChange={update}/><div className="editor-grid"><label className="editor-field">Platform<select value={account.platform} onChange={e=>update({platform:e.target.value as typeof account.platform})}>{socialPlatforms.map(p=><option value={p} key={p}>{platformLabels[p]}</option>)}</select></label><label className="editor-field">Username / nama kanal<input value={account.handle} onChange={e => update({ handle: e.target.value })} /></label><label className="editor-field">URL profil resmi<input type="url" value={account.url} onChange={e => update({ url: e.target.value })} placeholder="https://..." /></label></div><fieldset className="social-division-choice"><legend>Tampil pada beranda divisi (kosong = semua)</legend>{divisions.map(division => <label key={division.slug}><input type="checkbox" checked={accountDivisionSlugs(account).includes(division.slug)} onChange={e => update({ divisions: e.target.checked ? [...accountDivisionSlugs(account), division.slug] as typeof account.divisions : accountDivisionSlugs(account).filter(slug => slug !== division.slug) as typeof account.divisions })} />{division.name}</label>)}</fieldset><button onClick={()=>setDeleteAccountId(account.id!)}>Hapus akun</button></section>;
    })}</>}
    {socialTab === "posts" && <>
    <div className="editor-list-heading"><h2>Unggahan pilihan <span>{content.socialPosts.length}</span></h2><button onClick={addPost}>+ Tambah unggahan</button></div>
    <AdminOrderList label="Urutan unggahan" disabled={saving} items={content.socialPosts.map(item=>({id:item.id,title:item.title,image:item.image}))} onSelect={id=>focusEditorRecord(`social-${id}`)} onMove={(from,to)=>change(c=>({...c,socialPosts:moveBefore(c.socialPosts,from,to)}))}/>
    {content.socialPosts.map((item, i) => <section className="editor-panel" id={`social-${item.id}`} key={item.id}><div className="editor-panel-title"><h3>{String(i + 1).padStart(2, "0")} · {item.title}</h3></div><ContentOwnership value={item} onChange={patch=>post(item.id,patch)}/><div className="editor-grid"><label className="editor-field">Platform<select value={item.platform} onChange={e => post(item.id, { platform: e.target.value as SocialPost["platform"] })}>{socialPlatforms.map(p => <option key={p} value={p}>{platformLabels[p]}</option>)}</select></label><label className="editor-field">Judul<input value={item.title} onChange={e => post(item.id, { title: e.target.value })} /></label><label className="editor-field">Divisi<select value={item.division} onChange={e => post(item.id, { division: e.target.value as SocialPost["division"] })}>{divisions.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label><label className="editor-field">Username pemilik unggahan<input value={item.handle} onChange={e => post(item.id, { handle: e.target.value })} placeholder="@mbilasercutting" /></label><label className="editor-field">Tautan unggahan asli<input value={item.url} type="url" onChange={e => post(item.id, { url: e.target.value })} /></label><label className="editor-field">Tampilan unggahan<select value={item.displayMode||"preview"} onChange={e=>post(item.id,{displayMode:e.target.value as "preview"|"embed"})}><option value="preview">Foto / video langsung (tanpa bingkai platform)</option><option value="embed">Embed resmi platform</option></select><small>Arsip foto asli tersedia untuk unggahan Instagram bawaan. Unggahan baru: isi sampul atau video asli; jika kosong, memakai embed resmi.</small></label><label className="editor-field">Unggah sampul (maks. 4 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void uploadCover(item.id,file);}} /></label><label className="editor-field">Video asli MP4 (opsional)<input type="file" accept="video/mp4" onChange={e => { const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void uploadVideo(item.id,file); }} /></label><label className="editor-field">URL video MP4 dari media<input value={item.videoUrl || ""} onChange={e => post(item.id, { videoUrl: e.target.value })} placeholder="/media/nama-video.mp4" /></label><label className="editor-field">Gambar sampul: media lokal atau HTTPS<input value={item.image} onChange={e => post(item.id, { image: e.target.value })} /></label></div><p>{imageUploadHelp} {videoUploadHelp} Unggah video asli milik perusahaan. Tautan unggahan tetap menjadi sumber. Sampul tampil langsung tanpa iframe dalam mode foto. Kosongkan media untuk memakai arsip asli yang tersedia atau embed resmi.</p>{item.videoUrl&&item.displayMode!=="embed" ? <video className="editor-social-preview" src={item.videoUrl} poster={item.image || undefined} controls playsInline preload="metadata" /> : originalInstagramMedia(item)?.photos.length ? <details><summary>Preview foto asli</summary><SocialPhotoGallery photos={originalInstagramMedia(item)!.photos} first={originalInstagramMedia(item)?.first} title={item.title} url={item.url}/></details> : item.displayMode!=="embed"&&item.image ? <img className="editor-social-preview" src={item.image} alt={item.title} loading="lazy"/> : originalInstagramMedia(item)?.video ? <video className="editor-social-preview" src={originalInstagramMedia(item)!.video} controls playsInline preload="none"/> : socialEmbedUrl(item.platform, item.url) && <details><summary>Preview unggahan</summary><iframe className="editor-social-preview" src={socialEmbedUrl(item.platform, item.url)!} title={`Preview ${item.title}`} loading="lazy" allow="autoplay; encrypted-media; fullscreen" /></details>}<label className="editor-field">Keterangan<textarea rows={3} value={item.caption} onChange={e => post(item.id, { caption: e.target.value })} /></label><div className="editor-item-actions">{deleteId === item.id ? <><span>Hapus unggahan ini?</span><button className="danger" onClick={() => { change(c => ({ ...c, socialPosts: c.socialPosts.filter(p => p.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button onClick={() => setDeleteId(null)}>Batal</button></> : <button className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button>}</div></section>)}
    {!content.socialPosts.length && <div className="editor-empty"><h3>Siapkan cerita pertama.</h3><p>Tambahkan tautan unggahan dari akun perusahaan yang sudah diverifikasi.</p></div>}</>}
    </fieldset></div></main>{deleteAccountId && <AdminDialog title="Hapus akun sosial?" onClose={() => setDeleteAccountId(null)}><p>Tautan akun akan dihapus dari website setelah perubahan disimpan. Akun pada platform sosial tetap tersedia.</p><div className="admin-dialog-actions"><button type="button" onClick={() => setDeleteAccountId(null)}>Batal</button><button type="button" className="admin-danger" onClick={() => { change(c => ({ ...c, socialAccounts: c.socialAccounts.filter(a => a.id !== deleteAccountId) })); setDeleteAccountId(null); }}>Hapus akun</button></div></AdminDialog>}</div>;
}
