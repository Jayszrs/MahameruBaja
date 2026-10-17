"use client";
import PublicText from "./PublicText";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { Promotion } from "../data/promotions";
import { prioritizePromotions } from "../data/promotionOrder";
import EventCountdown from "./EventCountdown";
import PromotionImage from "./PromotionImage";
import { jakartaDate } from "../lib/jakartaDate";

function PromoCard({ item, now }: { item: Promotion; now: number | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [full, setFull] = useState(false);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const node = dialog.current; const overflow = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = "hidden";
    return () => { node?.close(); document.body.style.overflow = overflow; };
  }, [opened]);
  return <PublicText><article className={`home-promo-card${item.showInPopup ? " has-poster" : ""}`}>
    <button type="button" className={`home-promo-media${item.showInPopup ? " is-poster" : ""}`} onClick={() => setOpened(true)} aria-label={`Buka banner ${item.title}`}><PromotionImage src={item.image} alt={item.imageAlt} /><span>Lihat banner ↗</span></button>
    <div className="home-promo-content"><span className="home-promo-kicker">{item.label}</span><h3>{item.title}</h3><p>{item.summary}</p><EventCountdown item={item} now={now} /><div className="home-promo-actions"><Link className="home-promo-cta" href={item.ctaHref}>{item.ctaLabel} ↗</Link><button className="home-promo-preview" type="button" onClick={() => setOpened(true)} aria-label={`Preview ${item.title}`}>Lihat banner ↗</button></div></div>
    <dialog ref={dialog} className={`promo-preview-dialog${full ? " is-full-poster" : ""}`} aria-labelledby={`promo-title-${item.id}`} onClose={() => { setFull(false); setOpened(false); }} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="promo-preview-tools"><button type="button" onClick={() => setFull(value => !value)} aria-pressed={full}>{full ? "Lihat detail penawaran" : "Perbesar poster"}</button><button type="button" onClick={() => dialog.current?.close()} aria-label="Tutup preview promo">Tutup</button></div>
      <div className="promo-preview-layout"><div className="promo-preview-image"><PromotionImage src={item.image} alt={item.imageAlt} featured /></div><div className="promo-preview-copy" hidden={full}><span>{item.label}</span><h2 id={`promo-title-${item.id}`}>{item.title}</h2><p>{item.summary}</p><EventCountdown item={item} now={now} />{item.benefit && <p><strong>Informasi</strong>{item.benefit}</p>}{item.appliesTo && <p><strong>Berlaku untuk</strong>{item.appliesTo}</p>}{(item.startDate || item.endDate) && <p><strong>Periode</strong>{item.startDate || "Mulai sekarang"} — {item.endDate || "Sampai pemberitahuan berikutnya"}</p>}{item.terms && <p><strong>Ketentuan</strong>{item.terms}</p>}<Link href={item.ctaHref} onClick={() => dialog.current?.close()}>{item.ctaLabel}</Link></div></div>
    </dialog>
  </article></PublicText>;
}
export default function Promotions({ promotions }: { promotions: Promotion[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointer: number; x: number; scroll: number } | null>(null);
  const suppressClick = useRef(false);
  const [now, setNow] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const today = jakartaDate();
  const live = prioritizePromotions(promotions.filter(p => p.published && p.showInBanner !== false && (!p.startDate || p.startDate <= today) && (!p.endDate || p.endDate >= today)));
  const hasCountdown = live.some(item => Boolean(item.countdownAt));
  useEffect(() => {
    if (!hasCountdown) return;
    const tick = () => { if (!document.hidden) setNow(Date.now()); };
    tick(); const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [hasCountdown]);
  useEffect(() => {
    if (live.length < 2 || paused || userPaused || dragging) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const node = track.current;
      if (!node || document.hidden || reduced.matches || node.getBoundingClientRect().bottom < 0 || node.getBoundingClientRect().top > window.innerHeight) return;
      const cards = Array.from(node.children) as HTMLElement[];
      const next = cards.find(card => card.offsetLeft - node.offsetLeft > node.scrollLeft + 20);
      node.scrollTo({left: next ? next.offsetLeft - node.offsetLeft : 0, behavior: "smooth"});
    }, 4000);
    return () => window.clearInterval(timer);
  }, [live.length, paused, userPaused, dragging]);
  if (!live.length) return null;
  return <PublicText><section className="home-promos promos-restored" aria-labelledby="home-promos-heading"><div className="home-shell">
    {live.length > 1 && <button type="button" className="carousel-keyboard-control" aria-pressed={userPaused} onClick={() => setUserPaused(p => !p)}>{userPaused ? "Lanjutkan pergantian promo" : "Hentikan pergantian promo"}</button>}
    <div className="home-promos-header"><div><p className="industrial-eyebrow">PROMO & KEGIATAN</p><h2 id="home-promos-heading">Lihat promo dan penawaran<br />yang sedang tersedia.</h2></div><p>Informasi layanan dan kegiatan Mahameru.<br />Buka banner untuk melihat detail.</p></div>
    <div ref={track} className={`home-promos-track ${live.length === 1 ? "is-single" : ""}${dragging ? " is-dragging" : ""}`}
      onTouchStart={() => setPaused(true)} onTouchEnd={event => setPaused(event.currentTarget.contains(document.activeElement))} onTouchCancel={event => setPaused(event.currentTarget.contains(document.activeElement))}
      tabIndex={0} aria-label="Banner promo dan kegiatan, geser atau gunakan tombol panah keyboard untuk melihat lainnya"
      onMouseEnter={() => setPaused(true)} onMouseLeave={event => setPaused(event.currentTarget.contains(document.activeElement))}
      onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(event.currentTarget.matches(":hover")); }}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        drag.current = { pointer: event.pointerId, x: event.clientX, scroll: event.currentTarget.scrollLeft };
        suppressClick.current = false;
      }}
      onPointerMove={event => {
        if (event.buttons !== 1) { drag.current = null; setDragging(false); return; }
        const start = drag.current;
        if (!start || start.pointer !== event.pointerId || Math.abs(event.clientX - start.x) < 8 && !suppressClick.current) return;
        if (!suppressClick.current) { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }
        suppressClick.current = true;
        event.currentTarget.scrollLeft = start.scroll - (event.clientX - start.x);
      }}
      onPointerUp={() => { drag.current = null; setDragging(false); }} onPointerCancel={() => { drag.current = null; suppressClick.current = false; setDragging(false); }}
      onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
      onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const node = event.currentTarget;
        const left = event.key === "Home" ? 0 : event.key === "End" ? node.scrollWidth - node.clientWidth : node.scrollLeft + (event.key === "ArrowLeft" ? -1 : 1) * node.clientWidth * .8;
        node.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }}>
      {live.map(item => <PromoCard item={item} now={now} key={item.id} />)}
    </div>
  </div></section></PublicText>;
}
