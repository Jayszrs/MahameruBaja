"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projectCover, type GalleryProject } from "../data/projectGallery";

export default function ProjectAlbums({ projects, layout = "grid", galleryHref = "/proyek" }: { projects: GalleryProject[]; layout?: "grid" | "ribbon"; galleryHref?: string }) {
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState<GalleryProject | null>(null);
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const categories = ["Semua", ...new Set(projects.map(p => p.category))];
  const visible = projects.filter(p => p.published && p.photos.length && (filter === "Semua" || p.category === filter));
  const photo = selected?.photos[index];
  function open(project: GalleryProject, button: HTMLButtonElement) {
    opener.current = button; setIndex(0); setSelected(project);
  }
  useEffect(() => {
    if (!selected) return;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; opener.current?.focus(); };
  }, [selected]);
  function step(direction: number) { if (selected) setIndex(i => (i + direction + selected.photos.length) % selected.photos.length); }
  return <section className={`project-albums ${layout === "ribbon" ? "home-project-experience" : ""}`} id="pengalaman-proyek" aria-labelledby="albums-heading"><div className="home-shell">
    <div className="home-section-heading"><div><p className="home-eyebrow text-brand"><span />Project experience</p><h2 id="albums-heading">{layout === "ribbon" ? <>Proyek yang<br /><em>telah kami kerjakan.</em></> : <>Pengalaman proyek kami.<br /><em>Dari proses hingga detail.</em></>}</h2></div><div><p>Satu proyek, beragam perspektif. Buka album untuk melihat rangkaian dokumentasi pekerjaan Mahameru Baja Indonesia.</p>{layout === "ribbon" && <Link className="project-gallery-link" href={galleryHref}>Semua proyek ↗</Link>}</div></div>
    {layout === "grid" && <div className="projects-filters" aria-label="Kategori pengalaman proyek">{categories.map(category => <button type="button" key={category} aria-pressed={filter === category} className={filter === category ? "is-active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div>}
    <div className={`project-album-grid ${layout === "ribbon" ? "project-album-ribbon" : ""}`} {...(layout === "ribbon" ? { tabIndex: 0, role: "region", "aria-label": "Album proyek, geser ke samping untuk melihat lainnya" } : {})}>{visible.map(project => { const cover = projectCover(project); return <article key={project.id}><button type="button" onClick={e => open(project, e.currentTarget)} aria-label={`Buka album ${project.title}, ${project.photos.length} foto`}>
      <div className="project-album-cover"><Image src={cover.src} alt={cover.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span>{project.photos.length} foto</span></div><div className="project-album-copy"><small>{project.category}{project.location ? ` / ${project.location}` : ""}</small><h3>{project.title}</h3><p>{project.description}</p><span>Lihat dokumentasi <b aria-hidden="true">↗</b></span></div>
    </button></article>; })}</div>
    {!visible.length && <p className="project-album-empty">Dokumentasi proyek untuk kategori ini belum tersedia.</p>}
  </div>
  {selected && photo && <dialog ref={dialog} className="project-album-dialog" aria-labelledby="album-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => { if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return; if (event.key === "ArrowRight") {event.preventDefault(); step(1);} if (event.key === "ArrowLeft") {event.preventDefault(); step(-1);} }}>
    <header><div><small>{selected.category}</small><h3 id="album-dialog-title">{selected.title}</h3></div><button type="button" autoFocus onClick={() => setSelected(null)} aria-label="Tutup album">×</button></header>
    <div className="album-viewer"><Image key={photo.id} src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 94vw, 1000px" />{selected.photos.length > 1 && <><button type="button" className="album-prev" onClick={() => step(-1)} aria-label="Foto sebelumnya">←</button><button type="button" className="album-next" onClick={() => step(1)} aria-label="Foto berikutnya">→</button></>}</div>
    <div className="album-caption" aria-live="polite"><strong>{index + 1} / {selected.photos.length}</strong><p>{photo.caption || photo.alt}</p></div>
    <div className="album-thumbnails" aria-label="Pilih foto proyek">{selected.photos.map((item, number) => <button type="button" key={item.id} aria-label={`Foto ${number + 1}: ${item.alt}`} aria-pressed={number === index} onClick={() => setIndex(number)}><Image src={item.src} alt="" width={88} height={68} sizes="88px" /></button>)}</div>
    <footer><p>{selected.description}</p>{(selected.location || selected.year) && <small>{[selected.location, selected.year].filter(Boolean).join(" · ")}</small>}<Link href={`/unit/${selected.division}/kontak`}>Konsultasikan proyek serupa ↗</Link></footer>
  </dialog>}
  </section>;
}
