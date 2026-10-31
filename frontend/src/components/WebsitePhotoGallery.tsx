"use client";
import { useEffect, useRef, useState } from "react";
import Image from "./CmsImage";
import type { WebsitePhoto } from "../data/websitePhotos";

export default function WebsitePhotoGallery({ photos }: { photos: WebsitePhoto[] }) {
  const [category, setCategory] = useState("Semua"); const [query, setQuery] = useState(""); const [limit, setLimit] = useState(36);
  const [selected, setSelected] = useState<WebsitePhoto | null>(null); const dialog = useRef<HTMLDialogElement>(null); const opener = useRef<HTMLButtonElement | null>(null);
  const categories = ["Semua", ...new Set(photos.flatMap(photo => photo.categories))];
  const filtered = photos.filter(photo => (category === "Semua" || photo.categories.includes(category)) && `${photo.title} ${photo.alt}`.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id")));
  useEffect(() => {
    if (!selected) return; const element = dialog.current; const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; opener.current?.focus(); };
  }, [Boolean(selected)]);
  function step(by: number) { if (selected && filtered.length) setSelected(filtered[(filtered.findIndex(photo => photo.id === selected.id) + by + filtered.length) % filtered.length]); }
  return <section className="website-photo-gallery home-shell" aria-label="Seluruh foto di website">
    <div className="website-gallery-tools"><div><strong>{photos.length} foto</strong><p>Produk, desain, proyek, dan cerita Mahameru dalam satu galeri.</p></div><label>Cari foto<input type="search" value={query} placeholder="Cari material, proyek, atau desain…" onChange={event => { setQuery(event.target.value); setLimit(36); }} /></label></div>
    <div className="website-gallery-filters" aria-label="Kategori foto">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setLimit(36); }}>{item}<small>{item === "Semua" ? photos.length : photos.filter(photo => photo.categories.includes(item)).length}</small></button>)}</div>
    <div className="website-photo-grid">{filtered.slice(0, limit).map(photo => <figure key={photo.id}><button type="button" aria-label={`Perbesar foto: ${photo.title}`} onClick={event => { opener.current = event.currentTarget; setSelected(photo); }}><div className={`website-photo-frame${photo.categories.includes("Logo & identitas") ? " is-logo" : ""}`}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width:650px) 50vw, (max-width:1000px) 33vw, 25vw" /><span aria-hidden="true">↗</span></div><figcaption><small>{photo.categories.join(" / ")}</small><strong>{photo.title}</strong></figcaption></button>{photo.sourceUrl && <a className="website-photo-source" href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Referensi: {photo.sourceName || "Lihat sumber"} ↗</a>}</figure>)}</div>
    {!filtered.length && <p className="website-gallery-empty" role="status">Belum ada foto yang cocok. Coba kategori atau kata lain.</p>}
    {filtered.length > limit && <button className="home-button home-button-dark website-gallery-more" type="button" onClick={() => setLimit(value => value + 36)}>Tampilkan foto berikutnya ({filtered.length - limit})</button>}
    {selected && <dialog ref={dialog} className="website-photo-dialog" aria-labelledby="website-photo-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => { if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); } if (event.key === "ArrowRight") { event.preventDefault(); step(1); } }}><header><div><small>{selected.categories.join(" / ")}</small><h2 id="website-photo-title">{selected.title}</h2></div><button type="button" autoFocus aria-label="Tutup foto" onClick={() => setSelected(null)}>×</button></header><div className="website-photo-viewer"><Image src={selected.src} alt={selected.alt} fill sizes="(max-width:760px) 95vw, 1100px" /><button type="button" aria-label="Foto sebelumnya" onClick={() => step(-1)}>←</button><button type="button" aria-label="Foto berikutnya" onClick={() => step(1)}>→</button></div><footer><p>{selected.alt}</p>{selected.sourceUrl ? <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber referensi: {selected.sourceName || "Lihat sumber"} ↗</a> : selected.href && <a href={selected.href} {...(selected.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Lihat di website ↗</a>}</footer></dialog>}
  </section>;
}
