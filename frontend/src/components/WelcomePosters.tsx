"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "./CmsImage";
import { livePopupPosters } from "../data/popupPosters";
import type { Promotion } from "../data/promotions";
import { jakartaDate } from "../lib/jakartaDate";

export default function WelcomePosters({ promotions }: { promotions: Promotion[] }) {
  const path = usePathname(); const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0); const [open, setOpen] = useState(false);
  const slug = /^\/unit\/([^/]+)/.exec(path)?.[1];
  const today = jakartaDate();
  const live = livePopupPosters(promotions, today, slug);
  const signature = live.map(item => item.id).join(":");
  const sessionKey = `mahameru.poster.v1:${slug || "main"}:${signature}`;
  useEffect(() => {
    if (path.startsWith("/admin") || !signature) return;
    try { if (sessionStorage.getItem(sessionKey)) return; } catch { /* Session preferences are optional. */ }
    const timer = window.setTimeout(() => { setIndex(0); setOpen(true); }, 700);
    return () => clearTimeout(timer);
  }, [sessionKey, signature, path]);
  useEffect(() => {
    if (!open || path.startsWith("/admin")) return;
    const node = dialog.current; const focused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = "hidden";
    try { sessionStorage.setItem(sessionKey, "seen"); } catch { /* Storage may be blocked. */ }
    return () => { node?.close(); document.body.style.overflow = overflow; focused?.focus(); };
  }, [open, sessionKey, path]);
  const item = live[index % live.length];
  if (!item || path.startsWith("/admin")) return null;
  const close = () => setOpen(false);
  const step = (by: number) => setIndex(current => (current + by + live.length) % live.length);
  return <dialog className="poster-welcome" ref={dialog} aria-labelledby="welcome-poster-heading" onCancel={close} onClose={close} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); step(1); } if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); } }}>
    <header className="poster-welcome-header"><h2 id="welcome-poster-heading">{item.title}</h2><button type="button" autoFocus aria-label="Tutup poster" onClick={close}>×</button></header>
    <div className="poster-welcome-image"><Image src={item.image} alt={item.imageAlt} fill sizes="(max-width:600px) 94vw, 560px" /></div>
    <footer className="poster-welcome-footer"><div className="poster-welcome-navigation">{live.length > 1 && <button type="button" onClick={() => step(-1)} aria-label="Poster sebelumnya">←</button>}<p aria-live="polite">{index + 1} / {live.length}</p>{live.length > 1 && <button type="button" onClick={() => step(1)} aria-label="Poster berikutnya">→</button>}</div><Link href={item.ctaHref} onClick={close}>{item.ctaLabel}</Link></footer>
    <p className="poster-welcome-note">{item.terms}</p>
  </dialog>;
}
