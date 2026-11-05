"use client";
import { useEffect, useRef, useState } from "react";
import Image from "./CmsImage";
import type { WebsitePhoto } from "../data/websitePhotos";
import { sectionListAttributes, useSectionList } from "./PublicText";

export default function WebsitePhotoGallery({ photos,...sectionProps }: { photos: WebsitePhoto[]; [key:string]: unknown }) {
  const fallbackCategories=[...new Set(photos.flatMap(photo=>photo.categories))].map((label,index)=>({id:`gallery-filter-${index+1}`,label}));
  const categoryRows=useSectionList("galleryCategories",fallbackCategories,"photos","gallery");
  const fallbackPhotos=photos.map((photo,index)=>({...photo,id:photo.id||`website-photo-${index}`,category:photo.categories[0]||categoryRows[0]?.label||"",categories:photo.categories}));
  const photoRows=useSectionList("mainGalleryPhotos",fallbackPhotos,"photos","gallery");
  const sourceUrls=new Set(fallbackPhotos.map(row=>row.src));
  const savedByUrl=new Map(photoRows.map(row=>[String((row as typeof row & {sourceSrc?:string}).sourceSrc||row.src||""),row]));
  const deletedSourceUrls=new Set(photoRows.filter(row=>(row as typeof row & {deleted?:boolean}).deleted).map(row=>String((row as typeof row & {sourceSrc?:string}).sourceSrc||row.src||"")));
  const liveRows=[
    ...fallbackPhotos.filter(source=>!deletedSourceUrls.has(source.src)).map(source=>{
      const saved=savedByUrl.get(source.src);
      if(!saved)return source;
      const savedPhoto=saved as typeof saved & {categories?:string[];categoryOverride?:boolean};
      return {...source,...saved, categories:savedPhoto.categoryOverride?(savedPhoto.categories?.length?savedPhoto.categories:[String(saved.category||"")].filter(Boolean)):source.categories};
    }),
    ...photoRows.filter(row=>!(row as typeof row & {deleted?:boolean}).deleted&&!sourceUrls.has(String((row as typeof row & {sourceSrc?:string}).sourceSrc||row.src||""))&&(row as typeof row & {sourceManaged?:boolean}).sourceManaged!==true),
  ];
  const publicPhotos:WebsitePhoto[]=liveRows.map((row,index)=>{
    const legacy=row as typeof row & {categories?:string[];sourceName?:string;sourceUrl?:string};
    return {id:String(row.id||`website-photo-${index}`),src:String(row.src||""),title:String(row.title||""),alt:String(row.alt||row.title||""),categories:Array.isArray(legacy.categories)?legacy.categories:[String(row.category||"")].filter(Boolean),href:String(row.href||""),sourceName:legacy.sourceName,sourceUrl:legacy.sourceUrl};
  });
  const [category, setCategory] = useState("Semua"); const [query, setQuery] = useState(""); const [limit, setLimit] = useState(36);
  const [selected, setSelected] = useState<WebsitePhoto | null>(null); const dialog = useRef<HTMLDialogElement>(null); const opener = useRef<HTMLButtonElement | null>(null);
  const categories = ["Semua", ...new Set([...categoryRows,...fallbackCategories].map(row=>String(row.label||"")).filter(Boolean))];
  const filtered = publicPhotos.filter(photo => (category === "Semua" || photo.categories.includes(category)) && `${photo.title} ${photo.alt}`.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id")));
  useEffect(() => {
    if (!selected) return; const element = dialog.current; const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; opener.current?.focus(); };
  }, [Boolean(selected)]);
  function step(by: number) { if (selected && filtered.length) setSelected(filtered[(filtered.findIndex(photo => photo.id === selected.id) + by + filtered.length) % filtered.length]); }
  return <section {...sectionProps as Record<string,unknown>} {...sectionListAttributes("mainGalleryPhotos",photoRows)} id="website-gallery" className="website-photo-gallery home-shell" aria-label="Seluruh foto di website">
    <div className="website-gallery-tools"><div><strong>{publicPhotos.length} foto</strong><p>Produk, desain, proyek, dan cerita Mahameru dalam satu galeri.</p></div><label>Cari foto<input type="search" value={query} placeholder="Cari material, proyek, atau desain…" onChange={event => { setQuery(event.target.value); setLimit(36); }} /></label></div>
    <div className="website-gallery-filters" aria-label="Kategori foto">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setLimit(36); }}>{item}<small>{item === "Semua" ? publicPhotos.length : publicPhotos.filter(photo => photo.categories.includes(item)).length}</small></button>)}</div>
    <div className="website-photo-grid">{filtered.slice(0, limit).map(photo => <figure key={photo.id}><button type="button" aria-label={`Perbesar foto: ${photo.title}`} onClick={event => { opener.current = event.currentTarget; setSelected(photo); }}><div className={`website-photo-frame${photo.categories.includes("Logo & identitas") ? " is-logo" : ""}`}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width:650px) 50vw, (max-width:1000px) 33vw, 25vw" /><span aria-hidden="true">↗</span></div><figcaption><small>{photo.categories.join(" / ")}</small><strong>{photo.title}</strong></figcaption></button>{photo.sourceUrl && <a className="website-photo-source" href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Referensi: {photo.sourceName || "Lihat sumber"} ↗</a>}</figure>)}</div>
    {!filtered.length && <p className="website-gallery-empty" role="status">Belum ada foto yang cocok. Coba kategori atau kata lain.</p>}
    {filtered.length > limit && <button className="home-button home-button-dark website-gallery-more" type="button" onClick={() => setLimit(value => value + 36)}>Tampilkan foto berikutnya ({filtered.length - limit})</button>}
    {selected && <dialog ref={dialog} className="website-photo-dialog" aria-labelledby="website-photo-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => { if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); } if (event.key === "ArrowRight") { event.preventDefault(); step(1); } }}><header><div><small>{selected.categories.join(" / ")}</small><h2 id="website-photo-title">{selected.title}</h2></div><button type="button" autoFocus aria-label="Tutup foto" onClick={() => setSelected(null)}>×</button></header><div className="website-photo-viewer"><Image src={selected.src} alt={selected.alt} fill sizes="(max-width:760px) 95vw, 1100px" /><button type="button" aria-label="Foto sebelumnya" onClick={() => step(-1)}>←</button><button type="button" aria-label="Foto berikutnya" onClick={() => step(1)}>→</button></div><footer><p>{selected.alt}</p>{selected.sourceUrl ? <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber referensi: {selected.sourceName || "Lihat sumber"} ↗</a> : selected.href && <a href={selected.href} {...(selected.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Lihat di website ↗</a>}</footer></dialog>}
  </section>;
}
