"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "./CmsImage";
import { livePopupPosters, posterDetails, posterPeriod } from "../data/popupPosters";
import type { Promotion } from "../data/promotions";
import type { Division } from "../data/divisionCms";
import type { TeamContact } from "../data/siteContent";
import { jakartaDate } from "../lib/jakartaDate";
import PublicText from "./PublicText";

export default function WelcomePosters({ promotions, divisions = [], contacts = [], preview, onPreviewClose }: { promotions: Promotion[]; divisions?: Division[]; contacts?: TeamContact[]; preview?: Promotion | null; onPreviewClose?: () => void }) {
  const path = usePathname(); const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0); const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reading, setReading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const seen = useRef(new Set<string>());
  const slug = /^\/unit\/([^/]+)/.exec(path)?.[1];
  const today = jakartaDate();
  const live = preview ? [preview] : livePopupPosters(promotions, today, slug);
  const signature = live.map(item => item.id).join(":");
  const paused = focused || reading;
  useEffect(() => {
    if (!open || preview || paused || expanded || live.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!document.hidden && !reduced.matches) setIndex(current => (current + 1) % live.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [open, preview, paused, expanded, signature, live.length, index]);
  const sessionKey = `mahameru.poster.v1:${slug || "main"}:${signature}`;
  useEffect(() => {
    if (preview || path.startsWith("/admin") || !signature) return;
    if (seen.current.has(sessionKey)) return;
    const timer = window.setTimeout(() => { setIndex(0); setOpen(true); }, 700);
    return () => clearTimeout(timer);
  }, [sessionKey, signature, path, preview]);
  useEffect(() => { if (preview) { setIndex(0); setOpen(true); } }, [preview]);
  useEffect(() => {
    if (!open || !preview && path.startsWith("/admin")) return;
    const node = dialog.current; const focused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = "hidden";
    if (!preview) seen.current.add(sessionKey);
    return () => { node?.close(); document.body.style.overflow = overflow; focused?.focus(); };
  }, [open, sessionKey, path, Boolean(preview)]);
  const item = live[index % live.length];
  if (!item || !preview && path.startsWith("/admin")) return null;
  const close = () => { setOpen(false); onPreviewClose?.(); };
  const step = (by: number) => { setReading(false); setIndex(current => (current + by + live.length) % live.length); };
  const details = posterDetails(item, divisions, contacts);
  return <PublicText><dialog className="poster-welcome" ref={dialog} aria-labelledby="welcome-poster-heading" onCancel={close} onClose={close} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); step(1); } if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); } }}>
    <div className="poster-welcome-toolbar"><span>{preview ? "Pratinjau poster" : "Promo & informasi"}</span><button className="poster-welcome-close" type="button" autoFocus aria-label="Tutup poster" onClick={close}>×</button></div>
    <div className={`poster-welcome-layout${expanded ? " is-expanded" : ""}`}>
      <button type="button" className="poster-welcome-image" onClick={() => setExpanded(value => !value)} aria-label={expanded ? "Kembali ke detail poster" : "Perbesar poster"} aria-pressed={expanded}><Image src={item.image} alt={item.imageAlt} fill sizes={expanded ? "90vw" : "(max-width:760px) 90vw, 500px"} /><span className="poster-zoom-label">{expanded ? "Kembali ke detail" : "Perbesar poster"}</span></button>
      <section className="poster-welcome-details" hidden={expanded} onFocusCapture={() => setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
        {preview&&<p className="poster-preview-label">Pratinjau admin, belum diterbitkan</p>}
        <p className="poster-welcome-category">{item.label}</p>
        <h2 id="welcome-poster-heading">{item.title}</h2><p className="poster-welcome-description">{item.summary}</p>
        <div className="poster-welcome-provider">{details.division?.logo&&<Image src={details.division.logo} alt="" width={56} height={56} transparentLogo/>}<div><span>Penawaran dari</span><strong>{details.division?.name || "Mahameru Baja Indonesia"}</strong>{details.division?.label&&<small>{details.division.label}{details.division.area?` · ${details.division.area}`:""}</small>}</div></div>
        <div className="poster-welcome-contact"><span>Hubungi tim kami</span><strong>{details.contact?.name || (details.division ? `Tim ${details.division.name}` : "Tim Mahameru Baja")}</strong>{details.contact?.role&&<small>{details.contact.role}</small>}{details.contact&&(details.contact.whatsapp || details.contact.phone || details.contact.mobile)&&<small>{details.contact.whatsapp || details.contact.phone || details.contact.mobile}</small>}
          {details.whatsappHref?<a className="poster-contact-button" href={details.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={close}>Chat {details.contact?.name} di WhatsApp</a>:<Link className="poster-contact-button" href={details.contactHref} onClick={close}>Lihat kontak {details.division?.name || "kami"}</Link>}
          {item.ctaHref!==details.contactHref&&<Link className="poster-offer-link" href={item.ctaHref} onClick={close}>{item.ctaLabel}</Link>}
        </div>
        <details className="poster-welcome-more" key={item.id} onToggle={event=>setReading(event.currentTarget.open)}><summary>Detail penawaran & ketentuan</summary><dl className="poster-welcome-facts">{item.benefit&&<div><dt>Informasi penawaran</dt><dd>{item.benefit}</dd></div>}{item.appliesTo&&<div><dt>Untuk kebutuhan</dt><dd>{item.appliesTo}</dd></div>}<div><dt>Periode</dt><dd>{posterPeriod(item)}</dd></div></dl>{item.terms&&<p className="poster-welcome-terms">{item.terms}</p>}</details>
      </section>
    </div>
    {live.length > 1 && <nav className="poster-welcome-navigation" aria-label="Pilihan poster"><button type="button" onClick={() => step(-1)} aria-label="Poster sebelumnya">Sebelumnya</button><p aria-live={paused ? "polite" : "off"}>{index % live.length + 1} / {live.length}</p><button type="button" onClick={() => step(1)} aria-label="Poster berikutnya">Berikutnya</button></nav>}
  </dialog></PublicText>;
}
