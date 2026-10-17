"use client";
import { uploadCmsFile } from "../lib/cmsUpload";

import { useDivisionDirectory } from "./DivisionDirectory";
import Link from "next/link";
import Image from "./CmsImage";
import { mainLogo } from "../data/companyIdentity";
import ContentOwnership from "./ContentOwnership";
import { useAdminIdentity } from "./AdminIdentity";
import { useRef, useState } from "react";
import { contentId } from "../data/socialMedia";
import { promotionDestinations, countdownInputWib, type Promotion } from "../data/promotions";
import type { SiteContent } from "../data/siteContent";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import AdminViewTabs from "./AdminViewTabs";
import { bannerIsLive } from "../data/adminDashboard";
import { contentOwner } from "../data/divisionCms";
import { promotionProviderSlug, posterContactMatches } from "../data/popupPosters";
import WelcomePosters from "./WelcomePosters";

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="editor-field">{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} />{hint && <small>{hint}</small>}</label>;
}

export default function PromotionEditor({ initialContent }: { initialContent: SiteContent }) {
  const [view, setView] = useAdminView("view", ["all", "live", "draft", "popup"] as const, "all");
  const actor = useAdminIdentity(); const {divisions}=useDivisionDirectory();
  const destinations = [...promotionDestinations,...divisions.map(d=>[`/unit/${d.slug}`,d.name] as const)].filter(([href],index,all)=>all.findIndex(item=>item[0]===href)===index);
  const [content, setContent] = useState(initialContent);
  const baseContent = useRef(initialContent);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Promotion | null>(null);
  const [site, setSite] = useState(actor.division || "all");
  function addPoster() {
    const owner = actor.division || (site === "all" || site === "main" ? null : site);
    change(current => ({ ...current, promotions:[...current.promotions, { id:contentId(), ownerDivision:owner, ...(owner?{audience:[owner]}:{}), providerDivision:owner || "", contactId:"", label:"Informasi & promo", title:"Poster baru", summary:"Tuliskan informasi penawaran untuk pelanggan.", benefit:"", appliesTo:"", terms:"", image:"", imageAlt:"", startDate:"", endDate:"", ctaLabel:"Hubungi tim kami", ctaHref:owner?`/unit/${owner}/kontak`:"/kontak", published:false, showInPopup:true, showInBanner:true, countdownAt:"", countdownLabel:"", countdownEstimated:false }] }));
    setView("popup");
  }
  function change(update: (current: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function promotion(id: string, update: Partial<Promotion>) { change(current => ({ ...current, promotions: current.promotions.map(item => item.id === id ? { ...item, ...update } : item) })); }
  function move(id: string, direction: number) { change(current => {
    const visible = current.promotions.filter(item => (site === "all" || (site === "main" ? !contentOwner(item) : contentOwner(item) === site)) && (view === "all" || (view === "popup" ? item.showInPopup : view === "live" ? bannerIsLive(item) : !item.published)));
    const neighbor = visible[visible.findIndex(item => item.id === id) + direction];
    if (!neighbor) return current;
    const promotions = [...current.promotions];
    const from = promotions.findIndex(item => item.id === id), to = promotions.findIndex(item => item.id === neighbor.id);
    [promotions[from], promotions[to]] = [promotions[to], promotions[from]];
    return { ...current, promotions };
  }); }
  async function upload(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 4_000_000) { setError(true); setMessage("Gambar maksimal 4 MB."); return; }
    setUploading(id); setMessage(""); setError(false);
    try {
      const url = await uploadCmsFile(file, "image", content.promotions.find(p=>p.id===id)?.ownerDivision || null);
      promotion(id, { image: url });
      setMessage("Gambar terunggah. Simpan perubahan agar banner menggunakannya.");
    } catch (caught) { setError(true); setMessage((caught as Error).message); }
    finally { setUploading(null); }
  }
  async function save() {
    setSaving(true); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: baseContent.current }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menyimpan.");
      setContent(result); baseContent.current = result; setDirty(false); workspace.refreshDashboard(); setMessage("Tersimpan. Poster dan banner yang diterbitkan akan tampil pada website tujuan selama periode tayang.");
    } catch (caught) { setError(true); setMessage((caught as Error).message); }
    finally { setSaving(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy: saving || Boolean(uploading), label: "Simpan perubahan", disabled: !dirty, onSave: save });
  const visiblePromotions = content.promotions.filter(item => (site === "all" || (site === "main" ? !contentOwner(item) : contentOwner(item) === site)) && (view === "all" || (view === "popup" ? item.showInPopup : view === "live" ? bannerIsLive(item) : !item.published)));
  return <div className="content-editor promotion-editor">
    <aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><Image src={mainLogo} alt="MBI Laser Cutting" width={64} height={58} sizes="64px" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">01 · Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/sosial">02 · Sosial media</Link><span className="editor-sidebar-link active">03 · Banner & promo</span><Link className="editor-sidebar-link" href="/admin/artikel">Artikel &amp; panduan &#8599;</Link><Link className="editor-sidebar-link" href="/admin/permintaan">04 · Permintaan pelanggan ↗</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/#home-promos-heading" target="_blank" rel="noopener noreferrer">Lihat banner di Beranda ↗</a><form action="/api/admin/logout" method="post"><button type="submit">Keluar</button></form></div></aside>
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / Banner & promo</span><div><span className={`editor-save-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={saving || Boolean(uploading) || !dirty} onClick={save}>{saving ? "Menyimpan…" : "Simpan perubahan ↗"}</button></div></header>
      <div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">POSTER & PROMO</p><h1>Penawaran yang jelas.<br /><em>Mudah dihubungi.</em></h1><p>Atur poster untuk website utama atau divisi Anda. Lengkapi deskripsi, divisi penyedia, dan kontak yang bisa dihubungi. Cek pratinjau sebelum menerbitkan.</p></div>
        <section className="promotion-popup-toolbar" aria-label="Kelola poster per divisi"><div><h2>{actor.division ? `Poster ${divisions.find(d=>d.slug===actor.division)?.name || "divisi Anda"}` : "Poster website & divisi"}</h2><p>Poster muncul saat pengunjung masuk. Setiap divisi dapat mengelola posternya sendiri.</p></div>{!actor.division&&<label className="editor-field">Pemilik poster<select name="poster-site" disabled={saving || Boolean(uploading)} value={site} onChange={event=>setSite(event.target.value)}><option value="all">Semua divisi & website utama</option><option value="main">Website utama / pusat</option>{divisions.map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label>}<button className="admin-primary" type="button" disabled={saving || Boolean(uploading) || content.promotions.length>=20} onClick={addPoster}>+ Tambah poster popup</button></section>
        <AdminViewTabs disabled={saving || Boolean(uploading)} label="Filter banner" value={view} onChange={setView} options={[{value:"all",label:"Semua"},{value:"popup",label:"Poster masuk"},{value:"live",label:"Sedang tayang"},{value:"draft",label:"Draf"}]} />
        {message && <div className={`editor-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{message}</div>}
        <div className="editor-list-heading"><h2>Poster & banner <span>{visiblePromotions.length}</span></h2><button type="button" disabled={saving || Boolean(uploading) || content.promotions.length >= 20} onClick={() => { const owner=actor.division || (site!=="all"&&site!=="main"?site:null); change(current => ({ ...current, promotions: [...current.promotions, { id: contentId(), ownerDivision:owner, label: "Informasi & promo", title: "Banner baru", summary: "Jelaskan penawaran untuk pelanggan.", benefit: "", appliesTo: "", terms: "", image: "", imageAlt: "", startDate: "", endDate: "", ctaLabel: "Tanya kebutuhan", ctaHref:owner?`/unit/${owner}/kontak`:"/minta-penawaran", published: false, countdownAt: "", countdownLabel: "Menuju acara", countdownEstimated: false }] })); setView("all"); }}>+ Tambah banner beranda</button></div>
        {!visiblePromotions.length&&<p className="editor-notice">Belum ada poster atau banner pada pilihan ini. Tambahkan poster atau ubah filter di atas.</p>}
        <p className="promotion-editor-note">Banner draf tidak tayang. Contoh diskon jangan diterbitkan sebelum nilai, periode, dan ketentuan disetujui klien. Jika tidak ada banner aktif, section tidak ditampilkan.</p>
        <fieldset className="editor-fields" disabled={saving || Boolean(uploading)}>
          {visiblePromotions.map((item, index) => {
            const ready = Boolean(item.image && item.imageAlt && (item.showInPopup && item.showInBanner === false || item.benefit && item.appliesTo && item.terms));
            const provider = promotionProviderSlug(item);
            const contacts = content.contacts.filter(c=>posterContactMatches(c,provider));
            return <details className="editor-panel promotion-editor-panel" key={item.id} open={visiblePromotions.length === 1}><summary className="promotion-editor-summary">{item.image && <img src={item.image} alt="" />}<span><strong>{item.title}</strong><small>{item.published ? "Terbit" : "Draf"}{item.showInPopup ? " · Poster masuk" : ""}{item.showInBanner !== false ? " · Banner beranda" : ""}</small></span></summary><div className="editor-panel-title"><h3>{item.title}</h3><label className="editor-publish"><input type="checkbox" checked={item.published} disabled={!ready} onChange={event => promotion(item.id, { published: event.target.checked })} />Terbit</label></div>
              <ContentOwnership value={item} onChange={patch=>promotion(item.id,patch)}/>{!ready && <p className="promotion-editor-hint">Isi manfaat, spesifikasi/cakupan, ketentuan, gambar, dan teks gambar sebelum mengaktifkan Terbit.</p>}
              <div className="promotion-contact-settings"><h3>Divisi penyedia & kontak</h3><p>Divisi yang menyediakan penawaran ini, bukan sekadar website tempat poster tampil.</p><div className="editor-grid"><label className="editor-field">Divisi penyedia<select name={`provider-${item.id}`} value={provider} disabled={Boolean(actor.division)} onChange={event=>{const slug=event.target.value; promotion(item.id,{providerDivision:slug,contactId:"",ctaHref:slug?`/unit/${slug}/kontak`:"/kontak"});}}><option value="">Informasi perusahaan / pusat</option>{divisions.map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label><label className="editor-field">Kontak yang dihubungi<select name={`contact-${item.id}`} value={item.contactId || ""} onChange={event=>promotion(item.id,{contactId:event.target.value})}><option value="">Otomatis: kontak aktif divisi penyedia</option>{contacts.map(c=><option value={c.id} key={c.id}>{c.name} · {c.role}</option>)}</select></label></div>{!contacts.length&&<p className="admin-field-help">Belum ada kontak aktif pada divisi ini. Pengunjung akan diarahkan ke halaman kontak. <Link href="/admin/konten?tab=contacts">Kelola kontak</Link></p>}<button type="button" className="admin-secondary" disabled={!item.image} onClick={()=>setPreview(item)}>Lihat pratinjau popup</button></div>
              <div className="editor-grid"><label className="admin-checkbox"><input type="checkbox" checked={item.showInPopup === true} onChange={event => promotion(item.id, { showInPopup: event.target.checked })} />Tampilkan sebagai poster saat pengunjung masuk</label><label className="admin-checkbox"><input type="checkbox" checked={item.showInBanner !== false} onChange={event => promotion(item.id, { showInBanner: event.target.checked })} />Tampilkan di deretan banner beranda</label></div><p className="admin-field-help">Popup muncul saat website dibuka atau di-refresh, tidak berulang saat pindah halaman tanpa refresh. Pengunjung dapat menutup dan memilih poster lainnya. Periode tayang dan status Terbit tetap berlaku.</p>
              <div className="editor-grid"><Field label="Label acara" value={item.label} onChange={label => promotion(item.id, { label })} /><Field label="Judul banner" value={item.title} onChange={title => promotion(item.id, { title })} /></div>
              <label className="editor-field">Penjelasan singkat<textarea rows={3} value={item.summary} onChange={event => promotion(item.id, { summary: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Yang didapat pelanggan" value={item.benefit} onChange={benefit => promotion(item.id, { benefit })} hint="Isi nilai, potongan, atau layanan yang benar-benar berlaku; jangan gunakan angka contoh." /><Field label="Berlaku untuk material / spesifikasi" value={item.appliesTo} onChange={appliesTo => promotion(item.id, { appliesTo })} hint="Contoh: ukuran, ketebalan, jenis material, atau jumlah minimum yang resmi." /></div>
              <label className="editor-field">Syarat dan batasan<textarea rows={3} value={item.terms} onChange={event => promotion(item.id, { terms: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Mulai tayang (opsional)" type="date" value={item.startDate} onChange={startDate => promotion(item.id, { startDate })} /><Field label="Selesai tayang (opsional)" type="date" value={item.endDate} onChange={endDate => promotion(item.id, { endDate })} /></div>
              <div className="editor-grid"><label className="editor-field">Countdown ke tanggal dan jam (WIB)<input type="datetime-local" value={countdownInputWib(item.countdownAt)} onChange={event => promotion(item.id, { countdownAt: event.target.value ? event.target.value + ":00+07:00" : "" })} /><small>Kosongkan untuk banner tanpa countdown. Tidak mengubah periode tayang.</small></label><Field label="Label countdown" value={item.countdownLabel} onChange={countdownLabel => promotion(item.id, { countdownLabel })} /><label className="editor-field"><span><input type="checkbox" checked={item.countdownEstimated} onChange={event => promotion(item.id, { countdownEstimated: event.target.checked })} /> Tanggal masih perkiraan / menunggu penetapan</span></label></div><div className="promotion-editor-media"><div>{item.image ? <img src={item.image} alt={item.imageAlt || "Pratinjau gambar banner"} /> : <span>Belum ada gambar</span>}</div><div><label className="editor-field">Unggah gambar JPG, PNG, atau WebP · maksimal 4 MB<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(item.id, event.target.files?.[0]); event.target.value = ""; }} /></label><Field label="Alamat gambar (opsional jika sudah unggah)" value={item.image} onChange={image => promotion(item.id, { image })} /><Field label="Deskripsi gambar untuk pembaca layar" value={item.imageAlt} onChange={imageAlt => promotion(item.id, { imageAlt })} /></div></div>
              <div className="editor-grid"><Field label="Teks tombol" value={item.ctaLabel} onChange={ctaLabel => promotion(item.id, { ctaLabel })} /><label className="editor-field">Tujuan tombol<select value={item.ctaHref} onChange={event => promotion(item.id, { ctaHref: event.target.value })}>{destinations.map(([href, label]) => <option value={href} key={href}>{label}</option>)}</select></label></div>
              <div className="editor-item-actions"><button type="button" disabled={index === 0} onClick={() => move(item.id, -1)}>↑ Naik</button><button type="button" disabled={index === visiblePromotions.length - 1} onClick={() => move(item.id, 1)}>↓ Turun</button>{deleteId === item.id ? <><span>Hapus banner ini?</span><button type="button" className="danger" onClick={() => { change(current => ({ ...current, promotions: current.promotions.filter(p => p.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button type="button" onClick={() => setDeleteId(null)}>Batal</button></> : <button type="button" className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button>}</div>
            </details>;
          })}
        </fieldset><p className="editor-footer-note">Tanggal mengikuti waktu Indonesia Barat. Banner akan otomatis berhenti tampil setelah tanggal selesai.</p>
      </div>
    </main>
    <WelcomePosters promotions={[]} divisions={divisions} contacts={content.contacts} preview={preview} onPreviewClose={()=>setPreview(null)}/>
  </div>;
}
