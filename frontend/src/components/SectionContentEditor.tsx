"use client";
import SectionListsEditor, { readSectionLists, type ListSnapshot } from "./SectionListsEditor";
import { sectionListFields, sectionListSchema } from "../data/sectionLists";
import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "../data/siteContent";
import { sectionEditSchema, type SectionEdit } from "../data/sectionEdits";
import { serviceWording } from "../data/serviceWording";
import { normalizeWebsiteText, type TextPage } from "../data/websiteTexts";
import { useAdminWorkspace } from "./AdminWorkspace";
import { useAdminIdentity } from "./AdminIdentity";
import { imageAddressHelp, imageAddressLabel, uploadCmsFile } from "../lib/cmsUpload";
import { defaultAppearance } from "../data/websiteAppearance";

type Field = Pick<SectionEdit, "kind" | "source" | "label"> & {binding?:"companyVision"|"companyMission"|"companyMotto"; mergedSources?: string[]};
const PUBLIC_SECTION_CACHE_TTL = 120_000;
const publicSectionCache = new Map<string, { html: string; expiresAt: number }>();

function invalidatePublicSectionCache(url: string) {
  const target = new URL(url, window.location.origin);
  publicSectionCache.delete(target.toString());
}

function originalImage(value: string) {
  try { const url = new URL(value, window.location.origin); return url.pathname === "/_next/image" ? url.searchParams.get("url") || value : url.origin === window.location.origin ? url.pathname + url.search : value; }
  catch { return value; }
}
function mapEditorValue(value: string) {
  try {
    const url = new URL(value);
    const query = url.searchParams.get("q");
    if (query) return query;
  } catch {}
  return value;
}
function mapEmbedValue(value: string) {
  const trimmed = value.trim();
  if (/^https:\/\/(?:www\.)?google\.[^/]+\/maps(?:[/?]|$)/i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}
export function readSectionFields(document: Document, section: string): Field[] {
  const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-cms-section]")).filter(root => root.dataset.cmsSection === section);
  if (!roots.length) throw new Error("Bagian ini belum tersedia pada halaman publik. Muat ulang atau periksa pengaturan terbit kontennya.");
  const fields = new Map<string, Field>();
  const add = (kind: Field["kind"], source: string | null, label: string) => { if (!source?.trim()) return; const listValues=roots.flatMap(root=>Array.from(root.querySelectorAll<HTMLElement>("[data-cms-list-rows]")).concat(root.matches("[data-cms-list-rows]")?[root]:[])).flatMap(node=>{try{return JSON.parse(node.dataset.cmsListRows||"[]").flatMap((row:Record<string,unknown>)=>Object.values(row).filter(value=>typeof value==="string"));}catch{return [];}});
    if(listValues.some(value=>normalizeWebsiteText(serviceWording(String(value)))===normalizeWebsiteText(source)))return;
    const value = kind === "text" ? normalizeWebsiteText(source) : source; const key = `${kind}:${value}`; if (!fields.has(key)) fields.set(key, { kind, source: value, label: label.slice(0, 200) }); };
  for (const root of roots) {
    const owns = (element: Element) => element.closest("[data-cms-section]") === root;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (!parent || parent.closest("[data-cms-field],[data-cms-owned],[data-cms-static]") || !owns(parent) || parent.closest("script,style,svg,noscript,code,pre,textarea,option") || !/[\p{L}\p{N}]/u.test(node.textContent || "")) continue;
      if(/^\d+[.,%\s]*$/.test((node.textContent||"").trim()))continue;
      const previous=parent.previousElementSibling;
      const article=parent.closest("article"), articleIndex=article ? Array.from(root.querySelectorAll("article")).indexOf(article) : -1;
      const visionLabel = section === "vision" && articleIndex >= 0 ? articleIndex === 0 ? (parent.closest("h1,h2") ? "Judul visi Mahameru Group" : "Teks visi Mahameru Group") : (parent.closest("h1,h2") ? "Judul misi divisi" : "Teks misi divisi") : null;
      const label = visionLabel || (parent.closest("h1,h2") ? (parent.closest("em,strong,i,b") ? "Subjudul heading" : "Heading section") : parent.closest("h3,h4,h5,h6") ? "Subjudul" : parent.closest("a,button") ? "Teks tombol / tautan" : parent.closest(".home-eyebrow,.industrial-eyebrow") ? "Teks pengantar" : previous?.matches("h1,h2,h3,h4,h5,h6") ? "Paragraf" : "Tulisan");
      add("text", node.textContent, label);
    }
    root.querySelectorAll<HTMLElement>("img,svg[data-logo-source],a[href],iframe[src],input[placeholder],textarea[placeholder]").forEach(element => {
      if (!owns(element) || element.closest("[data-cms-owned],[data-cms-static]")) return;
      if (element.matches("img") && !element.closest("[data-cms-list-rows]")) add("image", originalImage(element.getAttribute("src") || ""), element.getAttribute("alt") || "Gambar section");
      else if (element.matches("svg")) add("image", element.getAttribute("data-logo-source"), "Logo section");
      else if (element.matches("a")) add("link", element.getAttribute("href"), normalizeWebsiteText(element.textContent || "Tujuan tautan"));
      else if (element.matches("iframe")) add("embed", element.getAttribute("src"), element.getAttribute("title") || "Peta");
      else add("text", element.getAttribute("placeholder"), "Petunjuk kolom formulir");
    });
  }
  for(const root of roots)root.querySelectorAll<HTMLElement>("[data-cms-field]").forEach(element=>{
    const binding=element.dataset.cmsField;
    if(binding==="companyVision"||binding==="companyMission"||binding==="companyMotto")fields.set(binding,{kind:"text",source:element.textContent||"",label:binding==="companyVision"?"Visi Mahameru Group (digunakan bersama)":binding==="companyMission"?"Misi & arah layanan Mahameru Group (digunakan bersama)":"Motto Mahameru Group (digunakan bersama)",binding});
  });
  return [...fields.values()];
}

export default function SectionContentEditor({ initialContent, page, section, url, ownerDivision = null, hideImages = false, preserveOrder = false, hideActions = false, hiddenSources = [], hiddenLabels = [], hideGuidance = false, hideTabs = false, hideEmbedInput = false, collapseParagraphs = false, collapseHeadings = false, mergeHeadingFields = false, hideTextFields = false, listOnly = false, productOpening = false, numberingOffset = 0, hideGenericText = false, hideActionFields = false }: { initialContent: SiteContent; page: TextPage; section: string; url: string; ownerDivision?: string | null; hideImages?: boolean; preserveOrder?: boolean; hideActions?: boolean; hiddenSources?: string[]; hiddenLabels?: string[]; hideGuidance?: boolean; hideTabs?: boolean; hideEmbedInput?: boolean; collapseParagraphs?: boolean; collapseHeadings?: boolean; mergeHeadingFields?: boolean; hideTextFields?: boolean; listOnly?: boolean; productOpening?: boolean; numberingOffset?: number; hideGenericText?:boolean; hideActionFields?:boolean }) {
  const actor = useAdminIdentity();
  const [content, setContent] = useState(initialContent), [base, setBase] = useState(initialContent);
  const [snapshots,setSnapshots]=useState<ListSnapshot[]>([]);
  const [fields, setFields] = useState<Field[]>([]), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""), [failed, setFailed] = useState(false), [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "text" | "image" | "link">(hideImages || listOnly ? "text" : "all");
  // Guide headings are edited in place inside their list cards. Do not surface
  // legacy standalone replacements as duplicate cards outside those groups.
  const guideStaticSources = ["Potong, tekuk, atau rakit?", "Sebelum mengirim desain", "Gambar DWG atau DXF membantu peninjauan bentuk. PDF dan foto dapat dikirim untuk konsultasi awal. Tim memastikan kelayakan file, toleransi, harga, dan jadwal sebelum produksi.", "Kirim gambar untuk penawaran cutting laser"];
  const records = content.sectionEdits.filter(row => (row.ownerDivision || null) === ownerDivision && row.page === page && row.section === section && !hiddenSources.some(source => normalizeWebsiteText(source) === normalizeWebsiteText(row.source)) && !(hideImages && section === "guide" && guideStaticSources.some(source => normalizeWebsiteText(source) === normalizeWebsiteText(row.source))));
  const dirty = JSON.stringify(content.sectionEdits) !== JSON.stringify(base.sectionEdits) || JSON.stringify(content.sectionLists) !== JSON.stringify(base.sectionLists) || JSON.stringify(content.websiteAppearance)!==JSON.stringify(base.websiteAppearance) || content.companyVision!==base.companyVision || content.companyMission!==base.companyMission || content.companyMotto!==base.companyMotto;
  const productAppearance = content.websiteAppearance.find(row=>(row.ownerDivision || null) === (ownerDivision || null)) || defaultAppearance(ownerDivision || null);
  function changeProductHeroImage(value:string) { setContent(current=>{const index=current.websiteAppearance.findIndex(row=>(row.ownerDivision || null)===(ownerDivision || null));const row=index<0?{...defaultAppearance(ownerDivision || null),productHeroImage:value}:{...current.websiteAppearance[index],productHeroImage:value,published:true};return {...current,websiteAppearance:index<0?[...current.websiteAppearance,row]:current.websiteAppearance.map((item,i)=>i===index?row:item)};});setMessage(""); }
  const load = useCallback(async () => {
    setLoading(true); setFailed(false); setMessage("");
    const target = new URL(url, window.location.origin);
    const cacheKey = target.toString();
    const cached = publicSectionCache.get(cacheKey);
    try {
      const html = cached && cached.expiresAt > Date.now()
        ? cached.html
        : await (async () => {
            const response = await fetch(target, { cache: "no-store" });
            if (!response.ok) throw new Error(`Halaman publik belum dapat dibaca (${response.status}).`);
            const fresh = await response.text();
            publicSectionCache.set(cacheKey, {
              html: fresh,
              expiresAt: Date.now() + PUBLIC_SECTION_CACHE_TTL,
            });
            return fresh;
          })();
      const document = new DOMParser().parseFromString(html, "text/html");
      setSnapshots(readSectionLists(document,section));
      setFields(readSectionFields(document, section));
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Tidak dapat membaca section."); }
    finally { setLoading(false); }
  }, [section, url]);
  useEffect(() => { void load(); }, [load]);
  // A saved replacement is displayed by the public page. Keep its original source
  // so editing it again updates the same record rather than adding a second pass.
  const displayed = fields.filter(field => !hiddenSources.some(source => normalizeWebsiteText(source) === normalizeWebsiteText(field.source)) && !(hideImages && section === "guide" && guideStaticSources.some(source => normalizeWebsiteText(source) === normalizeWebsiteText(field.source)))).map(field => { const row = records.find(row => row.kind === field.kind && (row.source === field.source || row.replacement === field.source)); return row ? { ...field, source: row.source, label: row.label || field.label } : field; });
  for (const row of records) if (!displayed.some(field => field.kind === row.kind && field.source === row.source)) displayed.push({ kind: row.kind, source: row.source, label: row.label });
  const deduped = displayed.filter((field, index, all) => all.findIndex(other => other.kind === field.kind && other.source === field.source) === index);
  const headingFields = mergeHeadingFields ? deduped.filter(field => field.kind === "text" && (field.label === "Heading section" || field.label === "Subjudul heading")) : [];
  const mergedDisplayed = mergeHeadingFields && headingFields.length > 1 ? [...deduped.filter(field => !headingFields.includes(field)), { kind: "text" as const, source: headingFields.map(field => records.find(row => row.kind === "text" && row.source === field.source)?.replacement ?? field.source).join("\n"), label: "Judul pembuka", mergedSources: headingFields.map(field => field.source) }] : deduped;
  const unique = mergedDisplayed.filter((field, index, all) => (!collapseParagraphs || field.label !== "Paragraf" || index === all.findIndex(other => other.kind === "text" && other.label === "Paragraf")) && (!collapseHeadings || field.label !== "Heading section" || index === all.findIndex(other => other.kind === "text" && other.label === "Heading section")));
  function change(field: Field, replacement: string) {
    if(field.binding){setContent(current=>({...current,[field.binding!]:replacement}));return;}
    if (field.mergedSources?.length) {
      const mergedSources = field.mergedSources;
      const values = replacement.split(/\r?\n/);
      setContent(current => {
        const keys = new Set(mergedSources);
        const kept = current.sectionEdits.filter(item => !(item.page === page && item.section === section && (item.ownerDivision || null) === ownerDivision && item.kind === "text" && keys.has(item.source)));
        const merged = mergedSources.map((source, index) => ({ kind: "text" as const, source, label: index === 0 ? "Heading section" : "Subjudul heading", id: crypto.randomUUID(), page, section, ownerDivision, replacement: values[index] ?? "", published: true }));
        return { ...current, sectionEdits: [...kept, ...merged] };
      });
      setMessage("");
      return;
    }
    const existing = records.find(row => row.kind === field.kind && row.source === field.source);
    const row: SectionEdit = { ...field, id: existing?.id || crypto.randomUUID(), page, section, ownerDivision, replacement, published: true };
    setContent(current => { const deduped = current.sectionEdits.filter(item => !(item.page === page && item.section === section && (item.ownerDivision || null) === ownerDivision && item.kind === field.kind && item.source === field.source)); return { ...current, sectionEdits: [...deduped, row] }; });
    setErrors(current => ({ ...current, [`${field.kind}:${field.source}`]: "" })); setMessage("");
  }
  async function save() {
    const nextErrors: Record<string, string> = {};
    for (const row of records) { const parsed = sectionEditSchema.safeParse(row); if (!parsed.success) nextErrors[`${row.kind}:${row.source}`] = parsed.error.issues[0].message; }
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); setFailed(true); setMessage("Periksa kolom yang ditandai merah."); requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()); return; }
    for(const list of content.sectionLists.filter(row=>row.page===page&&row.section===section&&(row.ownerDivision||null)===ownerDivision)) {
      const parsed=sectionListSchema.safeParse(list);
      if(!parsed.success) {for(const issue of parsed.error.issues){const index=issue.path[1],field=issue.path[2];nextErrors[`${list.key}:${index}:${field}`]=issue.message;}setErrors(nextErrors);setFailed(true);setMessage("Periksa kolom item yang ditandai merah.");requestAnimationFrame(()=>document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());return;}
    }
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base }) });
      const next = await response.json(); if (!response.ok) throw new Error(next.message || "Perubahan belum tersimpan.");
      invalidatePublicSectionCache(url);
      setContent(next); setBase(next); setMessage("Perubahan section tersimpan. Buka pratinjau untuk melihat hasilnya.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan."); }
    finally { setBusy(false); }
  }
  useAdminWorkspace({ dirty, busy, label: "Simpan section", disabled: !dirty || loading || Boolean(actor.division), onSave: save });
  return <section className={`cms-section-content${loading ? " is-loading" : ""}`} aria-busy={loading}>
    {!hideGuidance && <p>Kolom berikut dibaca dari bagian yang tampil pada website. Perubahan hanya berlaku pada section ini.</p>}
    {actor.division && <p role="status">Konten website utama dikelola Super Admin. Gunakan editor konten divisi untuk mengelola website divisi Anda.</p>}
    {productOpening && !hideTabs && !hideImages && !listOnly && <div className="admin-view-tabs" aria-label="Jenis isi section">{(["all", "image", "text"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} disabled={busy} onClick={() => setFilter(value)}>{({ all: "Semua", image: "Gambar", text: "Tulisan" })[value]}</button>)}</div>}
    {productOpening && (filter === "all" || filter === "image") && <section className="editor-panel product-opening-image"><h3>Foto latar pembuka Produk</h3><p>Opsional. Jika dikosongkan, pembuka Produk tetap memakai latar bawaan.</p><div className="admin-media-row"><div className="admin-image-placeholder">{productAppearance.productHeroImage ? <img src={productAppearance.productHeroImage} alt="Pratinjau foto latar pembuka Produk" /> : "Belum ada foto latar"}</div><div><label className="editor-field">Unggah gambar dari perangkat<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event=>{const file=event.target.files?.[0];event.target.value="";if(!file)return;setBusy(true);setFailed(false);setMessage("Mengunggah foto latar…");try{changeProductHeroImage(await uploadCmsFile(file,"image",ownerDivision));setMessage("Foto selesai diunggah. Simpan section untuk menerapkan.");}catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Unggahan gagal.");}finally{setBusy(false);}}}/><small>JPG, PNG, atau WebP · maksimal 4 MB.</small></label><label className="editor-field">{imageAddressLabel}<input value={productAppearance.productHeroImage} placeholder="https://.../gambar.webp" onChange={event=>changeProductHeroImage(event.target.value)}/><small>{imageAddressHelp}</small></label>{productAppearance.productHeroImage&&<button type="button" className="admin-secondary" onClick={()=>changeProductHeroImage("")}>Hapus foto latar</button>}</div></div></section>}
    {!productOpening && !hideTabs && !hideImages && !listOnly && <div className="admin-view-tabs" aria-label="Jenis isi section">{(["all", "image", "text"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} disabled={busy} onClick={() => setFilter(value)}>{({ all: "Semua", image: "Gambar", text: "Tulisan" })[value]}</button>)}</div>}
    {!loading&&!failed&&!unique.length&&!snapshots.length&&!content.sectionLists.some(row=>row.page===page&&row.section===section)&&<p>Isi bagian ini dikelola melalui tab Kelola konten.</p>}
    {loading && <div className="cms-section-loading" role="status"><strong>Memuat konten dari website…</strong><span className="cms-loading-skeleton" aria-hidden="true"><i/><i/><i/></span></div>}
    {message && (!hideActions || failed) && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}{failed && !dirty && <button type="button" onClick={() => void load()}>Muat ulang section</button>}</p>}
    <fieldset disabled={busy || Boolean(actor.division)} className="website-copy-fieldset">
    {!hideImages && (filter==="all"||filter==="image")&&<SectionListsEditor content={content} page={page} section={section} ownerDivision={ownerDivision} snapshots={snapshots} errors={errors} update={setContent} uploadState={setBusy} report={(message,failed=false)=>{setMessage(message);setFailed(failed);}}/>}
    {!listOnly && !hideTextFields && <div className="cms-section-fields">{unique.filter(field=>(filter==="all"||field.kind===filter)&&!hiddenLabels.includes(field.label)&&!(hideGenericText&&field.kind==="text"&&field.label==="Tulisan")&&!(hideActionFields&&(field.kind==="link"||field.label==="Teks tombol / tautan"))).sort((a,b)=>filter==="all"&&!preserveOrder?({image:0,text:1,link:2,embed:3}[a.kind]??4)-({image:0,text:1,link:2,embed:3}[b.kind]??4):0).map((field,index) => {
      const row = records.find(row => row.kind === field.kind && row.source === field.source), value = field.binding ? content[field.binding] : row?.replacement ?? field.source, key = `${field.kind}:${field.source}`;
      return <div className="editor-panel cms-section-field" key={key}><div className="cms-field-heading"><strong>{field.label} {index + 1 + numberingOffset}</strong>{row && <button type="button" className="admin-secondary" onClick={() => setContent(current => ({ ...current, sectionEdits: current.sectionEdits.filter(item => item.id !== row.id) }))}>Kembalikan bawaan</button>}</div>
        {field.kind === "image" && <>{value && <img className="cms-section-image" src={value} alt={field.label} />}<label className="editor-field">Unggah pengganti<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
          setBusy(true); setFailed(false); setMessage("Mengunggah gambar...");
          try { change(field, await uploadCmsFile(file, "image", ownerDivision)); setMessage("Gambar selesai diunggah. Simpan section untuk menerapkannya."); }
          catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Unggahan gagal."); }
          finally { setBusy(false); }
        }} /><small>JPG, PNG, WebP · maksimal 4 MB.</small></label></>}
        {field.kind === "embed" && hideEmbedInput ? <div className="cms-map-preview"><strong>Preview Lokasi Maps</strong><label className="editor-field">Nama atau alamat lokasi<input value={mapEditorValue(value)} placeholder="Contoh: Toko Besi Mahameru Baja, Tambun Selatan" maxLength={5000} onChange={event => change(field, mapEmbedValue(event.target.value))} /><small>Ketik nama/alamat lokasi, atau tempel tautan Google Maps. Preview akan mengikuti isi ini.</small></label><iframe title={field.label} src={value} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div> : <label className="editor-field">{field.kind === "text" ? "Tulisan yang ditampilkan" : field.kind === "image" ? "Tautan gambar" : "Tujuan tautan"}{field.kind === "text" ? <textarea rows={value.length > 160 ? 4 : 2} value={value} maxLength={field.binding?2000:5000} aria-invalid={Boolean(errors[key])} onChange={event => change(field, event.target.value)} /> : <input value={value} maxLength={5000} aria-invalid={Boolean(errors[key])} onChange={event => change(field, event.target.value)} />}{errors[key] && <span className="cms-field-error">{errors[key]}</span>}</label>}
        {field.kind === "link" && <a href={value} target="_blank" rel="noopener noreferrer">Buka tujuan tautan</a>}
      </div>;
    })}</div>}{(hideImages||listOnly)&&<SectionListsEditor content={content} page={page} section={section} ownerDivision={ownerDivision} snapshots={snapshots} errors={errors} update={setContent} uploadState={setBusy} report={(message,failed=false)=>{setMessage(message);setFailed(failed);}}/>}</fieldset>
  </section>;
}
