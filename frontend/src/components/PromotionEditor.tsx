"use client";
import { imageAddressHelp, imageAddressLabel, uploadCmsFile } from "../lib/cmsUpload";

import { useDivisionDirectory } from "./DivisionDirectory";
import Link from "next/link";
import Image from "./CmsImage";
import { mainLogo } from "../data/companyIdentity";
import ContentOwnership from "./ContentOwnership";
import { useAdminIdentity } from "./AdminIdentity";
import { useRef, useState } from "react";
import { contentId } from "../data/socialMedia";
import { promotionDestinations, countdownInputWib, promotionVisibleInDivision, type Promotion } from "../data/promotions";
import type { SiteContent } from "../data/siteContent";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import AdminViewTabs from "./AdminViewTabs";
import { bannerIsLive } from "../data/adminDashboard";
import { contentOwner } from "../data/divisionCms";
import { promotionProviderSlug, posterContactMatches } from "../data/popupPosters";
import AdminOrderList, { moveBefore, focusEditorRecord } from "./AdminOrderList";
import { promotionSchema } from "../data/promotions";
import WelcomePosters from "./WelcomePosters";
import WebsiteScopePicker from "./WebsiteScopePicker";

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="editor-field">{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} />{hint && <small>{hint}</small>}</label>;
}

export default function PromotionEditor({ initialContent, embedded = false }: { initialContent: SiteContent; embedded?: boolean }) {
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
  const [openPromotionIds, setOpenPromotionIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<Promotion | null>(null);
  const [site, setSite] = useState(actor.division || "all");
  function addPromotion() {
    const id = contentId();
    const owner = actor.division || (site === "all" || site === "main" ? null : site);
    change(current => ({ ...current, promotions:[{ id, ownerDivision:owner, ...(owner?{audience:[owner]}:{}), providerDivision:owner || "", contactId:"", label:"Informasi & promo", title:"Konten baru", summary:"Tuliskan informasi penawaran untuk pelanggan.", benefit:"", appliesTo:"", terms:"", image:"", imageAlt:"", startDate:"", endDate:"", ctaLabel:"Hubungi tim kami", ctaHref:owner?`/unit/${owner}/kontak`:"/kontak", published:false, showInPopup:true, showInBanner:true, countdownAt:"", countdownLabel:"", countdownEstimated:false }, ...current.promotions] }));
    setView("all"); focusEditorRecord(`promotion-${id}`);
  }
  function change(update: (current: SiteContent) => SiteContent) { setContent(update); setDirty(true); setMessage(""); }
  function promotion(id: string, update: Partial<Promotion>) { change(current => ({ ...current, promotions: current.promotions.map(item => item.id === id ? { ...item, ...update } : item) })); }
  async function upload(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 4_000_000) { setError(true); setMessage("Gambar maksimal 4 MB."); return; }
    setUploading(id); setMessage(""); setError(false);
    try {
      const url = await uploadCmsFile(file, "image", content.promotions.find(p=>p.id===id)?.ownerDivision || null);
      promotion(id, { image: url, imageDesktop: "", imageMobile: "" });
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
  const scopedPromotions=content.promotions.filter(item=>site==="all"||(site==="main"?(item.audience ? item.audience.includes("main") : !contentOwner(item)):promotionVisibleInDivision(item,site)));
  const livePromotions=scopedPromotions.filter(item=>bannerIsLive(item)&&(item.showInPopup===true||item.showInBanner!==false));
  const popupPromotions=scopedPromotions.filter(item=>item.showInPopup===true);
  const visiblePromotions=view==="all"?scopedPromotions:view==="live"?livePromotions:popupPromotions;
  return <div className={`content-editor promotion-editor${embedded ? " promotion-editor-embedded" : ""}`}>
    {!embedded && <aside className="editor-sidebar"><Link className="editor-brand" href="/admin"><Image src={mainLogo} alt="MBI Laser Cutting" width={64} height={58} sizes="64px" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">01 · Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/sosial">02 · Sosial media</Link><span className="editor-sidebar-link active">03 · Banner & promo</span><Link className="editor-sidebar-link" href="/admin/artikel">Artikel &amp; panduan &#8599;</Link><Link className="editor-sidebar-link" href="/admin/permintaan">04 · Permintaan pelanggan ↗</Link><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><a href="/#home-promos-heading" target="_blank" rel="noopener noreferrer">Lihat banner di Beranda ↗</a><form action="/api/admin/logout" method="post"><button type="submit">Keluar</button></form></div></aside>}
    <main className={`editor-main${embedded ? " promotion-editor-main-embedded" : ""}`}>
      {!embedded && <header className="editor-topbar"><span>Workspace / Banner & promo</span><div><span className={`editor-save-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span><button type="button" className="editor-save" disabled={saving || Boolean(uploading) || !dirty} onClick={save}>{saving ? "Menyimpan…" : "Simpan perubahan ↗"}</button></div></header>}
      <div className={`editor-content${embedded ? " promotion-editor-content-embedded" : ""}`}>{!embedded && <div className="editor-title"><h1>Banner & poster</h1><p>Atur poster untuk website utama atau divisi Anda. Lengkapi deskripsi, divisi penyedia, dan kontak yang bisa dihubungi. Simpan perubahan untuk langsung menampilkannya di website.</p></div>}
        <section className="promotion-popup-toolbar" aria-label="Kelola poster per divisi"><div className="promotion-toolbar-controls has-owner">{!actor.division&&<WebsiteScopePicker className="promotion-site-picker" label="Website" mainLabel="Website utama · Mahameru Baja" allOption={{value:"all",label:"Semua website"}} value={site==="main"?"":site} divisions={divisions} disabled={saving || Boolean(uploading)} onChange={value=>setSite(value||"main")}/>}<span className="promotion-toolbar-spacer" />{visiblePromotions.length>0&&<button className="admin-primary" type="button" disabled={saving || Boolean(uploading) || content.promotions.length>=20} onClick={addPromotion}>+ Tambah konten</button>}</div></section>
        <AdminViewTabs disabled={saving || Boolean(uploading)} label="Filter konten promo" value={view} onChange={setView} options={[{value:"all",label:`Semua konten (${scopedPromotions.length})`},{value:"live",label:`Tayang saat ini (${livePromotions.length})`},{value:"popup",label:`Poster popup (${popupPromotions.length})`}]} />
        {message && <div className={`editor-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{message}</div>}
        {visiblePromotions.length ? <>
        {!embedded && (saving || uploading) && <p className="editor-notice" role="status">{uploading ? "Mengunggah gambar…" : "Menyimpan poster dan banner…"}</p>}
        <AdminOrderList label="Urutan poster & banner" disabled={saving || Boolean(uploading)} items={visiblePromotions.map(item => ({ id: item.id, title: item.title, image: item.image }))} onSelect={id=>focusEditorRecord(`promotion-${id}`)} onMove={(from,to)=>change(current=>({...current,promotions:moveBefore(current.promotions,from,to).map(item=>({...item,priority:0}))}))}/>
        <fieldset className="editor-fields" disabled={saving || Boolean(uploading)}>
          {visiblePromotions.map(item => {
            const missing = [!item.image && "gambar", !item.imageAlt && "deskripsi gambar", ...(item.showInPopup && item.showInBanner === false ? [] : [!item.benefit && "manfaat", !item.appliesTo && "cakupan", !item.terms && "ketentuan"])].filter(Boolean);
            const provider = promotionProviderSlug(item);
            const contacts = content.contacts.filter(c=>posterContactMatches(c,provider));
            return <details className="editor-panel promotion-editor-panel" key={item.id} id={`promotion-${item.id}`} open={openPromotionIds.includes(item.id)} onToggle={event => { const isOpen = event.currentTarget.open; setOpenPromotionIds(current => isOpen ? [...new Set([...current,item.id])] : current.filter(id=>id!==item.id)); }}><summary className="promotion-editor-summary">{item.image && <img src={item.image} alt="" />}<span><strong>{item.title}</strong><small><span className={`admin-status-pill${item.published?"":" draft"}`}>{item.published?"Terbit":"Draf"}</span> · Prioritas {item.priority || 0}{item.showInPopup ? " · Daftar poster" : ""}{item.showInBanner !== false ? " · Banner beranda" : ""}</small></span></summary><div className="editor-panel-title"><h3>{item.title}</h3></div>
              <ContentOwnership value={item} onChange={patch=>promotion(item.id,patch)}/>{missing.length > 0 && <p className="promotion-editor-hint" role="status">Belum lengkap: {missing.join(", ")}. Lengkapi sebelum menyimpan.</p>}
              <div className="promotion-contact-settings"><h3>Divisi penyedia & kontak</h3><p>Kontak yang akan menerima pertanyaan pelanggan tentang penawaran ini.</p><div className="editor-grid"><label className="editor-field">Divisi penyedia<select name={`provider-${item.id}`} value={provider} disabled={Boolean(actor.division)} onChange={event=>{const slug=event.target.value; promotion(item.id,{providerDivision:slug,contactId:"",ctaHref:slug?`/unit/${slug}/kontak`:"/kontak"});}}><option value="">Informasi perusahaan / pusat</option>{divisions.map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label><label className="editor-field">Kontak yang dihubungi<select name={`contact-${item.id}`} value={item.contactId || ""} onChange={event=>promotion(item.id,{contactId:event.target.value})}><option value="">Otomatis: kontak aktif divisi penyedia</option>{contacts.map(c=><option value={c.id} key={c.id}>{c.name} · {c.role}</option>)}</select></label></div>{!contacts.length&&<p className="admin-field-help">Belum ada kontak aktif pada divisi ini. Pengunjung akan diarahkan ke halaman kontak. <Link href="/admin/konten?tab=contacts">Kelola kontak</Link></p>}</div>
              <section className="promotion-placement"><h3>Terbit & lokasi tayang</h3><p>Terbitkan konten agar bisa dilihat pengunjung. Aktifkan satu atau kedua lokasi tayang. Periode tayang tetap berlaku.</p><div className="promotion-placement-actions"><button type="button" className={item.published?"admin-secondary":"admin-primary"} onClick={()=>promotion(item.id,{published:!item.published})}>{item.published?"Jadikan draf":"Terbitkan"}<small>Status saat ini: {item.published?"Terbit":"Draf"}</small></button><button type="button" className="admin-secondary" aria-pressed={item.showInPopup===true} onClick={()=>promotion(item.id,{showInPopup:item.showInPopup!==true})}><span>Poster saat website dibuka</span><small>Status saat ini: {item.showInPopup?"Aktif":"Tidak aktif"}</small></button><button type="button" className="admin-secondary" aria-pressed={item.showInBanner!==false} onClick={()=>promotion(item.id,{showInBanner:item.showInBanner===false})}><span>Banner di beranda</span><small>Status saat ini: {item.showInBanner!==false?"Aktif":"Tidak aktif"}</small></button></div></section>
              <div className="editor-grid"><Field label="Label acara" value={item.label} onChange={label => promotion(item.id, { label })} /><Field label="Judul banner" value={item.title} onChange={title => promotion(item.id, { title })} /></div>
              <label className="editor-field">Penjelasan singkat<textarea rows={3} value={item.summary} onChange={event => promotion(item.id, { summary: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Yang didapat pelanggan" value={item.benefit} onChange={benefit => promotion(item.id, { benefit })} hint="Isi nilai, potongan, atau layanan yang benar-benar berlaku; jangan gunakan angka contoh." /><Field label="Berlaku untuk material / spesifikasi" value={item.appliesTo} onChange={appliesTo => promotion(item.id, { appliesTo })} hint="Contoh: ukuran, ketebalan, jenis material, atau jumlah minimum yang resmi." /></div>
              <label className="editor-field">Syarat dan batasan<textarea rows={3} value={item.terms} onChange={event => promotion(item.id, { terms: event.target.value })} /></label>
              <div className="editor-grid"><Field label="Mulai tayang (opsional)" type="date" value={item.startDate} onChange={startDate => promotion(item.id, { startDate })} /><Field label="Selesai tayang (opsional)" type="date" value={item.endDate} onChange={endDate => promotion(item.id, { endDate })} /></div>
              <div className="promotion-editor-media"><div>{item.image ? <img src={item.image} alt={item.imageAlt || "Pratinjau gambar promo"} /> : <span>Belum ada gambar</span>}</div><div><label className="editor-field">Unggah gambar promo dari perangkat<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(item.id, event.target.files?.[0]); event.target.value = ""; }} /><small>Unggah satu gambar. Website menyesuaikan tampilannya untuk layar komputer dan ponsel.</small></label><Field label={imageAddressLabel} value={item.image} hint={imageAddressHelp} onChange={image => promotion(item.id, { image, imageDesktop: "", imageMobile: "" })} /><Field label="Deskripsi gambar untuk pembaca layar" value={item.imageAlt} onChange={imageAlt => promotion(item.id, { imageAlt })} /></div></div>
              <div className="editor-grid"><Field label="Teks tombol" value={item.ctaLabel} onChange={ctaLabel => promotion(item.id, { ctaLabel })} /><label className="editor-field">Tujuan tombol<select value={item.ctaHref} onChange={event => promotion(item.id, { ctaHref: event.target.value })}>{destinations.map(([href, label]) => <option value={href} key={href}>{label}</option>)}</select></label></div>
              <div className="editor-item-actions">{deleteId === item.id ? <><span>Hapus banner ini?</span><button type="button" className="danger" onClick={() => { change(current => ({ ...current, promotions: current.promotions.filter(p => p.id !== item.id) })); setDeleteId(null); }}>Ya, hapus</button><button type="button" onClick={() => setDeleteId(null)}>Batal</button></> : <><button type="button" className="admin-preview-action" disabled={!item.image} onClick={()=>setPreview(item)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>{item.image ? "Pratinjau" : "Pratinjau (unggah gambar dulu)"}</button><button type="button" className="danger" onClick={() => setDeleteId(item.id)}>Hapus</button></>}</div>
            </details>;
          })}
        </fieldset><p className="editor-footer-note">Banner berhenti otomatis setelah tanggal akhir.</p></> : <section className="editor-panel promotion-empty-state"><span className="promotion-empty-icon" aria-hidden="true">＋</span><div><h2>{scopedPromotions.length ? "Tidak ada konten di filter ini" : "Belum ada poster atau banner"}</h2><p>{scopedPromotions.length ? "Pilih filter lain atau tambahkan konten." : "Tambahkan konten pertama untuk website ini."}</p></div><button className="admin-primary" type="button" disabled={saving || Boolean(uploading) || content.promotions.length>=20} onClick={addPromotion}>+ Tambah konten</button></section>}
      </div>
    </main>
    <WelcomePosters promotions={[]} divisions={divisions} contacts={content.contacts} preview={preview} onPreviewClose={()=>setPreview(null)}/>
  </div>;
}
