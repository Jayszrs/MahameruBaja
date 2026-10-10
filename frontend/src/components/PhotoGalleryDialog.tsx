"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

export type GalleryImage = { src: string; alt: string; caption?: string; kind?: "logo" };

export default function PhotoGalleryDialog({ photos, title, index, onSelect, onClose }: {
  photos: GalleryImage[]; title: string; index: number | null;
  onSelect: (index: number) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const photo = index === null ? null : photos[index];
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open]);
  function step(direction: number) {
    if (index !== null && photos.length) onSelect((index + direction + photos.length) % photos.length);
  }
  if (!photo || index === null) return null;
  return <dialog ref={dialog} className="project-album-dialog collage-photo-dialog" aria-labelledby={titleId}
    onCancel={onClose} onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    }}>
    <header><div><small>GALERI DIVISI</small><h3 id={titleId}>{title}</h3></div><button type="button" autoFocus onClick={onClose} aria-label="Tutup galeri gambar">×</button></header>
    <div className={`album-viewer ${photo.kind === "logo" ? "is-logo" : ""}`}
      onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={event => {
        const start = touch.current; touch.current = null;
        const end = event.changedTouches[0];
        if (start && end && Math.abs(end.clientX - start.x) > 50 && Math.abs(end.clientX - start.x) > Math.abs(end.clientY - start.y)) step(end.clientX < start.x ? 1 : -1);
      }}>
      <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 94vw, 1000px" />
      {photos.length > 1 && <><button type="button" className="album-prev" onClick={() => step(-1)} aria-label="Gambar sebelumnya">←</button><button type="button" className="album-next" onClick={() => step(1)} aria-label="Gambar berikutnya">→</button></>}
    </div>
    <div className="album-caption" aria-live="polite"><strong>{index + 1} / {photos.length}</strong><p>{photo.caption || photo.alt}</p></div>
    <div className="album-thumbnails" aria-label="Pilih gambar divisi">{photos.map((item, number) => <button type="button" key={item.src} aria-label={`Gambar ${number + 1}: ${item.alt}`} aria-pressed={number === index} onClick={() => onSelect(number)}><Image src={item.src} alt="" width={88} height={68} /></button>)}</div>
  </dialog>;
}
