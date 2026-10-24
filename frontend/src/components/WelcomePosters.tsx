"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
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
    const timer = window.setTimeout(() => { setIndex(0); setFocused(false); setReading(false); setExpanded(false); setOpen(true); }, 700);
    return () => clearTimeout(timer);
  }, [sessionKey, signature, path, preview]);
  useEffect(() => { if (preview) { setIndex(0); setFocused(false); setReading(false); setExpanded(false); setOpen(true); } }, [preview]);
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
  const ratio = imageRatios[item.image] || 2 / 3;
  return <PublicText><dialog className="poster-welcome poster-lightbox" ref={dialog} aria-labelledby="welcome-poster-heading"
    style={{ "--poster-ratio": ratio, "--poster-caption-space": expanded ? "72px" : "170px" } as CSSProperties}
    onCancel={close} onClose={close} onClick={event => { if (event.target === event.currentTarget) close(); }}
    onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); step(1); } if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); } }}>
    <div className="poster-welcome-toolbar"><span className="poster-welcome-accessible">{preview ? "Pratinjau poster" : "Promo & informasi"}</span><button className="poster-welcome-close" type="button" autoFocus aria-label="Tutup poster" onClick={close}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div className={`poster-welcome-layout${expanded ? " is-expanded" : ""}`}>
      <button type="button" className="poster-welcome-image" onClick={() => setExpanded(value => !value)} aria-label={expanded ? "Kembali ke detail poster" : "Perbesar poster"} aria-pressed={expanded}>
        <Image src={item.image} alt={item.imageAlt} fill sizes="(max-width:760px) 96vw, 760px" onLoad={event => {
          const image = event.currentTarget;
          if (image.naturalWidth && image.naturalHeight) {
            const next = image.naturalWidth / image.naturalHeight;
            setImageRatios(current => current[item.image] === next ? current : { ...current, [item.image]: next });
          }
        }}/><span className="poster-welcome-accessible">{expanded ? "Kembali ke detail" : "Perbesar poster"}</span>
      </button>
      <section className="poster-welcome-details" hidden={expanded} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        {preview && <p className="poster-preview-label">Pratinjau poster</p>}
        <h2 id="welcome-poster-heading">{item.title}</h2>
        <div className="poster-lightbox-actions">
          {details.whatsappHref ? <a className="poster-contact-button" href={details.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={close}>Chat {details.contact?.name} di WhatsApp<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a> : <Link className="poster-contact-button" href={details.contactHref} onClick={close}>Hubungi {details.division?.name || "kami"}</Link>}
        </div>
        <details className="poster-welcome-more" key={item.id} onToggle={event => setReading(event.currentTarget.open)}>
          <summary>Detail promo & kontak</summary>
          <div className="poster-lightbox-information">
            {item.summary && <p className="poster-welcome-description">{item.summary}</p>}
            <p className="poster-welcome-provider"><strong>{details.division?.name || "Mahameru Baja Indonesia"}</strong>{details.division?.area && <span>{details.division.area}</span>}</p>
            {details.contact && <p className="poster-lightbox-contact"><strong>{details.contact.name}</strong>{details.contact.role && <span>{details.contact.role}</span>}{(details.contact.whatsapp || details.contact.phone || details.contact.mobile) && <span>{details.contact.whatsapp || details.contact.phone || details.contact.mobile}</span>}</p>}
            <dl className="poster-welcome-facts">{item.benefit && <div><dt>Informasi penawaran</dt><dd>{item.benefit}</dd></div>}{item.appliesTo && <div><dt>Untuk kebutuhan</dt><dd>{item.appliesTo}</dd></div>}<div><dt>Periode</dt><dd>{posterPeriod(item)}</dd></div></dl>
            {item.terms && <p className="poster-welcome-terms">{item.terms}</p>}
            {item.ctaHref !== details.contactHref && <Link className="poster-offer-link" href={item.ctaHref} onClick={close}>{item.ctaLabel}</Link>}
          </div>
        </details>
      </section>
    </div>
    <nav className="poster-welcome-navigation" aria-label="Pilihan poster">
      {live.length > 1 && <button type="button" onClick={() => step(-1)} aria-label="Poster sebelumnya"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>}
      <p aria-live={paused ? "polite" : "off"}>{index % live.length + 1} / {live.length}</p>
      {live.length > 1 && <button type="button" onClick={() => step(1)} aria-label="Poster berikutnya"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>}
    </nav>
  </dialog></PublicText>;
}
