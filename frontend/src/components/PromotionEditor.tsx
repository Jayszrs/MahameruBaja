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
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import { promotionSchema } from "../data/promotions";
import WelcomePosters from "./WelcomePosters";

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="editor-field">{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} />{hint && <small>{hint}</small>}</label>;
}

export default function PromotionEditor({ initialContent }: { initialContent: SiteContent }) {
  const [view, setView] = useAdminView("view", ["all", "live", "popup"] as const, "all");
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
  const [newId, setNewId] = useState("");
  function addPromotion() {
    const id = contentId(); setNewId(id);
    const owner = actor.division || (site === "all" || site === "main" ? null : site);
    change(current => ({ ...current, promotions:[{ id, ownerDivision:owner, ...(owner?{audience:[owner]}:{}), providerDivision:owner || "", contactId:"", label:"Informasi & promo", title:"Konten baru", summary:"Tuliskan informasi penawaran untuk pelanggan.", benefit:"", appliesTo:"", terms:"", image:"", imageAlt:"", startDate:"", endDate:"", ctaLabel:"Hubungi tim kami", ctaHref:owner?`/unit/${owner}/kontak`:"/kontak", published:false, showInPopup:true, showInBanner:true, countdownAt:"", countdownLabel:"", countdownEstimated:false }, ...current.promotions] }));
    setView("all"); focusEditorRecord(`promotion-${id}`);
  }
  function change(update: (current: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function promotion(id: string, update: Partial<Promotion>) { change(current => ({ ...current, promotions: current.promotions.map(item => item.id === id ? { ...item, ...update } : item) })); }
  async function upload(id: string, file: File | undefined, field: "image" | "imageDesktop" | "imageMobile" = "image") {
    if (!file) return;
    if (file.size > 4_000_000) { setError(true); setMessage("Gambar maksimal 4 MB."); return; }
    setUploading(id); setMessage(""); setError(false);
    try {
      const url = await uploadCmsFile(file, "image", content.promotions.find(p=>p.id===id)?.ownerDivision || null);
      promotion(id, { [field]: url });
      setMessage("Gambar terunggah. Simpan perubahan agar banner menggunakannya.");
    } catch (caught) { setError(true); setMessage((caught as Error).message); }
    finally { setUploading(null); }
  }
  async function save() {
    if (saving || uploading) return;
    for (const item of content.promotions) {
      const parsed = promotionSchema.safeParse(item);
      if (!parsed.success) { setError(true); setMessage(`${item.title || "Poster baru"}: ${parsed.error.issues[0]?.message || "Lengkapi isian yang wajib."}`); focusEditorRecord(`promotion-${item.id}`); return; }
    }
    setSaving(true); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: baseContent.current }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menyimpan.");
      setContent(result); baseContent.current = result; setDirty(false); workspace.refreshDashboard(); setMessage("Perubahan poster dan banner tersimpan. Konten berstatus Draf belum terlihat oleh pengunjung.");
    } catch (caught) { setError(true); setMessage((caught as Error).message); }
    finally { setSaving(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy: saving || Boolean(uploading), label: "Simpan perubahan", disabled: !dirty, onSave: save });
  const visiblePromotions = content.promotions.filter(item => (site === "all" || (site === "main" ? !contentOwner(item) : contentOwner(item) === site)) && (view === "all" || (view === "popup" ? item.showInPopup : view === "live" ? bannerIsLive(item) : !item.published)));
  return <div className="content-editor promotion-editor">
    <aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><Image src={mainLogo} alt="MBI Laser Cutting" width={64} height={58} sizes="64px" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">01 · Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/sosial">02 · Sosial media</Link><span className="editor-sidebar-link active">03 · Banner & promo</span><Link className="editor-sidebar-link" href="/admin/artikel">Artikel &amp; panduan &#8599;</Link><Link className="editor-sidebar-link" href="/admin/permintaan">04 · Permintaan pelanggan ↗</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/#home-promos-heading" target="_blank" rel="noopener noreferrer">Lihat banner di Beranda ↗</a><form action="/api/admin/logout" method="post"><button type="submit">Keluar</button></form></div></aside>
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / Banner & promo</span><div><span className={`editor-save-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={saving || Boolean(uploading) || !dirty} onClick={save}>{saving ? "Menyimpan…" : "Simpan perubahan ↗"}</button></div></header>
      <div className="editor-content"><div className="editor-title"><h1>Banner & poster</h1><p>Atur poster untuk website utama atau divisi Anda. Lengkapi deskripsi, divisi penyedia, dan kontak yang bisa dihubungi. Simpan perubahan untuk langsung menampilkannya di website.</p></div>
        <section className="promotion-popup-toolbar" aria-label="Kelola poster per divisi"><div className="promotion-toolbar-intro"><h2>{actor.division ? `Poster ${divisions.find(d=>d.slug===actor.division)?.name || "divisi Anda"}` : "Poster website & divisi"}</h2><p>Atur satu konten untuk tampil sebagai poster pembuka otomatis, banner beranda, atau keduanya.</p></div><div className={`promotion-toolbar-controls${actor.division?"":" has-owner"}`}>{!actor.division&&<label className="editor-field">Pemilik konten<select name="poster-site" disabled={saving || Boolean(uploading)} value={site} onChange={event=>setSite(event.target.value)}><option value="all">Semua divisi & website utama</option><option value="main">Website utama / pusat</option>{divisions.map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label>}<button className="admin-primary" type="button" disabled={saving || Boolean(uploading) || content.promotions.length>=20} onClick={addPromotion}>+ Tambah konten</button></div></section>
        <AdminViewTabs disabled={saving || Boolean(uploading)} label="Filter banner" value={view} onChange={setView} options={[{value:"all",label:"Semua"},{value:"popup",label:"Daftar poster"},{value:"live",label:"Sedang tayang"}]} />
        {message && <div className={`editor-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{message}</div>}
        <div className="editor-list-heading"><div><h2>Poster & banner <span>{visiblePromotions.length}</span></h2><p>Urutan dan status tersimpan saat Anda menekan Simpan perubahan.</p></div></div>
        {!visiblePromotions.length&&<p className="editor-notice">Belum ada poster atau banner pada pilihan ini. Tambahkan poster atau ubah filter di atas.</p>}

        {(saving || uploading) && <p className="editor-notice" role="status">{uploading ? "Mengunggah gambar. Tunggu hingga unggahan selesai." : "Menyimpan poster dan banner…"}</p>}
        <AdminOrderList label="Urutan poster & banner" disabled={saving || Boolean(uploading)} items={visiblePromotions.map(item => ({ id: item.id, title: item.title, image: item.image }))} onSelect={id=>focusEditorRecord(`promotion-${id}`)} onMove={(from,to)=>change(current=>({...current,promotions:moveBefore(current.promotions,from,to).map(item=>({...item,priority:0}))}))}/>
        <fieldset className="editor-fields" disabled={saving || Boolean(uploading)}>
          {visiblePromotions.map(item => {
            const missing = [!item.image && "gambar", !item.imageAlt && "deskripsi gambar", ...(item.showInPopup && item.showInBanner === false ? [] : [!item.benefit && "manfaat", !item.appliesTo && "cakupan", !item.terms && "ketentuan"])].filter(Boolean);
            const provider = promotionProviderSlug(item);
            const contacts = content.contacts.filter(c=>posterContactMatches(c,provider));
            return <details className="editor-panel promotion-editor-panel" key={item.id} id={`promotion-${item.id}`} open={visiblePromotions.length === 1 || item.id === newId}><summary className="promotion-editor-summary">{item.image && <img src={item.image} alt="" />}<span><strong>{item.title}</strong><small><span className={`admin-status-pill${item.published?"":" draft"}`}>{item.published?"Terbit":"Draf"}</span> · Prioritas {item.priority || 0}{item.showInPopup ? " · Daftar poster" : ""}{item.showInBanner !== false ? " · Banner beranda" : ""}</small></span></summary><div className="editor-panel-title"><h3>{item.title}</h3></div>
              <ContentOwnership value={item} onChange={patch=>promotion(item.id,patch)}/>{missing.length > 0 && <p className="promotion-editor-hint" role="status">Belum lengkap: {missing.join(", ")}. Lengkapi sebelum menyimpan.</p>}
              <div className="promotion-contact-settings"><h3>Divisi penyedia & kontak</h3><p>Kontak yang akan menerima pertanyaan pelanggan tentang penawaran ini.</p><div className="editor-grid"><label className="editor-field">Divisi penyedia<select name={`provider-${item.id}`} value={provider} disabled={Boolean(actor.division)} onChange={event=>{const slug=event.target.value; promotion(item.id,{providerDivision:slug,contactId:"",ctaHref:slug?`/unit/${slug}/kontak`:"/kontak"});}}><option value="">Informasi perusahaan / pusat</option>{divisions.map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label><label className="editor-field">Kontak yang dihubungi<select name={`contact-${item.id}`} value={item.contactId || ""} onChange={event=>promotion(item.id,{contactId:event.target.value})}><option value="">Otomatis: kontak aktif divisi penyedia</option>{contacts.map(c=><option value={c.id} key={c.id}>{c.name} · {c.role}</option>)}</select></label></div>{!contacts.length&&<p className="admin-field-help">Belum ada kontak aktif pada divisi ini. Pengunjung akan diarahkan ke halaman kontak. <Link href="/admin/konten?tab=contacts">Kelola kontak</Link></p>}<div className="promotion-preview-actions"><button type="button" className="admin-preview-action" disabled={!item.image} onClick={()=>setPreview(item)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>Pratinjau sebelum terbit</button></div></div>
              <section className="promotion-placement"><h3>Terbit & lokasi tayang</h3><p>Terbitkan konten agar bisa dilihat pengunjung. Aktifkan satu atau kedua lokasi tayang. Periode tayang tetap berlaku.</p><div className="promotion-placement-actions"><button type="button" className={item.published?"admin-secondary":"admin-primary"} onClick={()=>promotion(item.id,{published:!item.published})}>{item.published?"Jadikan draf":"Terbitkan"}<small>Status saat ini: {item.published?"Terbit":"Draf"}</small></button><button type="button" className="admin-secondary" aria-pressed={item.showInPopup===true} onClick={()=>promotion(item.id,{showInPopup:item.showInPopup!==true})}><span>Poster saat website dibuka</span><small>{item.showInPopup?"Aktif":"Tidak aktif"}</small></button><button type="button" className="admin-secondary" aria-pressed={item.showInBanner!==false} onClick={()=>promotion(item.id,{showInBanner:item.showInBanner===false})}><span>Banner di beranda</span><small>{item.showInBanner!==false?"Aktif":"Tidak aktif"}</small></button></div></section>
              <div className="editor-grid"><Field label="Label acara" value={item.label} onChange={label => promotion(item.id, { label })} /><Field label="Judul banner" value={item.title} onChange={title => promotion(item.id, { title })} /></div>
              <label className="editor-field">Prioritas tayang<input type="number" min={0} max={999} step={1} value={item.priority || 0} onChange={event => promotion(item.id, { priority: Math.max(0, Math.min(999, Math.trunc(Number(event.target.value) || 0))) })} /><small>Angka lebih besar tampil lebih dahulu di banner dan popup. Jika sama, tarik pegangan di daftar urutan untuk menentukan posisi.</small></label>
              <label className="editor-field">Penjelasan singkat<textarea rows={3} value={item.summary} onChange={event => promotion(item.id, { summary: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Yang didapat pelanggan" value={item.benefit} onChange={benefit => promotion(item.id, { benefit })} hint="Isi nilai, potongan, atau layanan yang benar-benar berlaku; jangan gunakan angka contoh." /><Field label="Berlaku untuk material / spesifikasi" value={item.appliesTo} onChange={appliesTo => promotion(item.id, { appliesTo })} hint="Contoh: ukuran, ketebalan, jenis material, atau jumlah minimum yang resmi." /></div>
              <label className="editor-field">Syarat dan batasan<textarea rows={3} value={item.terms} onChange={event => promotion(item.id, { terms: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Mulai tayang (opsional)" type="date" value={item.startDate} onChange={startDate => promotion(item.id, { startDate })} /><Field label="Selesai tayang (opsional)" type="date" value={item.endDate} onChange={endDate => promotion(item.id, { endDate })} /></div>
              <div className="editor-grid promotion-countdown-grid"><label className="editor-field">Countdown ke tanggal dan jam (WIB)<input type="datetime-local" value={countdownInputWib(item.countdownAt)} onChange={event => promotion(item.id, { countdownAt: event.target.value ? event.target.value + ":00+07:00" : "" })} /><small>Kosongkan untuk banner tanpa countdown.</small></label><Field label="Label countdown" value={item.countdownLabel} onChange={countdownLabel => promotion(item.id, { countdownLabel })} /><div className="editor-field countdown-estimated-field"><span>Perkiraan tanggal</span><label><input type="checkbox" checked={item.countdownEstimated} onChange={event => promotion(item.id, { countdownEstimated: event.target.checked })} />Tanggal masih perkiraan</label></div></div><div className="editor-grid">{(["imageDesktop", "imageMobile"] as const).map(field => <div className="editor-panel" key={field}><label className="editor-field">{field === "imageDesktop" ? "Poster desktop — landscape (16:9)" : "Poster mobile — portrait (2:3)"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(item.id, event.target.files?.[0], field); event.target.value = ""; }} /><small>Opsional. Jika kosong, gunakan gambar utama di bawah. Gambar ditampilkan utuh.</small></label>{item[field] && <><img src={item[field]} alt="Pratinjau poster" style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain" }} /><button type="button" className="admin-secondary" onClick={() => promotion(item.id, { [field]: "" })}>Gunakan gambar utama</button></>}</div>)}</div><div className="promotion-editor-media"><div>{item.image ? <img src={item.image} alt={item.imageAlt || "Pratinjau gambar banner"} /> : <span>Belum ada gambar</span>}</div><div><label className="editor-field">Unggah gambar JPG, PNG, atau WebP · maksimal 4 MB<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(item.id, event.target.files?.[0]); event.target.value = ""; }} /></label><Field label="Alamat gambar (opsional jika sudah unggah)" value={item.image} onChange={image => promotion(item.id, { image })} /><Field label="Deskripsi gambar untuk pembaca layar" value={item.imageAlt} onChange={imageAlt => promotion(item.id, { imageAlt })} /></div></div>
              <div className="editor-grid"><Field label="Teks tombol" value={item.ctaLabel} onChange={ctaLabel => promotion(item.id, { ctaLabel })} /><label className="editor-field">Tujuan tombol<select value={item.ctaHref} onChange={event => promotion(item.id, { ctaHref: event.target.value })}>{destinations.map(([href, label]) => <option value={href} key={href}>{label}</option>)}</select></label></div>
              <div className="editor-item-actions">{deleteId === item.id ? <><span>Hapus banner ini?</span><button type="button" className="danger" onClick={() => { change(current => ({ ...current, promotions: current.promotions.filter(p => p.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button type="button" onClick={() => setDeleteId(null)}>Batal</button></> : <button type="button" className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button>}</div>
            </details>;
          })}
        </fieldset><p className="editor-footer-note">Tanggal mengikuti waktu Indonesia Barat. Banner akan otomatis berhenti tampil setelah tanggal selesai.</p>
      </div>
    </main>
    <WelcomePosters promotions={[]} divisions={divisions} contacts={content.contacts} preview={preview} onPreviewClose={()=>setPreview(null)}/>
  </div>;
}
