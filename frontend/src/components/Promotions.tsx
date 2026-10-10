"use client";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { Promotion } from "../data/promotions";
import PromotionImage from "./PromotionImage";
import { jakartaDate } from "../lib/jakartaDate";

function PromoCard({ item }: { item: Promotion }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <article className="home-promo-card">
    <div className="home-promo-media"><PromotionImage src={item.image} alt={item.imageAlt} /></div><div className="home-promo-shade" aria-hidden="true" />
    <div className="home-promo-content"><span className="home-promo-kicker">{item.label}</span><h3>{item.title}</h3><p>{item.summary}</p><div className="home-promo-actions"><Link className="home-promo-cta" href={item.ctaHref}>{item.ctaLabel} ↗</Link><button className="home-promo-preview" type="button" onClick={() => dialog.current?.showModal()} aria-label={`Preview ${item.title}`}>Lihat banner ↗</button></div></div>
    <dialog ref={dialog} className="promo-preview-dialog" aria-labelledby={`promo-title-${item.id}`} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="promo-preview-layout"><button className="promo-preview-close" onClick={() => dialog.current?.close()} aria-label="Tutup preview promo">✕</button><div className="promo-preview-image"><PromotionImage src={item.image} alt={item.imageAlt} featured /></div><div className="promo-preview-copy"><span>{item.label}</span><h2 id={`promo-title-${item.id}`}>{item.title}</h2><p>{item.summary}</p>{item.benefit && <p><strong>Penawaran</strong>{item.benefit}</p>}{item.appliesTo && <p><strong>Berlaku untuk</strong>{item.appliesTo}</p>}{(item.startDate || item.endDate) && <p><strong>Periode</strong>{item.startDate || "Mulai sekarang"} — {item.endDate || "Sampai pemberitahuan berikutnya"}</p>}{item.terms && <p><strong>Ketentuan</strong>{item.terms}</p>}<Link href={item.ctaHref} onClick={() => dialog.current?.close()}>{item.ctaLabel} ↗</Link></div></div></dialog>
  </article>;
}
export default function Promotions({ promotions }: { promotions: Promotion[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const today = jakartaDate();
  const live = promotions.filter(p => p.published && (!p.startDate || p.startDate <= today) && (!p.endDate || p.endDate >= today));
  useEffect(() => {
    if (live.length < 2 || paused || userPaused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const node = track.current;
      if (!node || document.hidden || reduced.matches || node.getBoundingClientRect().bottom < 0 || node.getBoundingClientRect().top > window.innerHeight) return;
      const cards = Array.from(node.children) as HTMLElement[];
      const next = cards.find(card => card.offsetLeft - node.offsetLeft > node.scrollLeft + 20);
      node.scrollTo({left: next ? next.offsetLeft - node.offsetLeft : 0, behavior: "smooth"});
    }, 4000);
    return () => window.clearInterval(timer);
  }, [live.length, paused, userPaused]);
  if (!live.length) return null;
  return <section className="home-promos promos-restored" aria-labelledby="home-promos-heading"><div className="home-shell"><div className="home-promos-header"><div><p className="industrial-eyebrow">PROMO & KEGIATAN</p><h2 id="home-promos-heading">Lihat promo dan penawaran<br />yang sedang tersedia.</h2></div><p>Informasi layanan dan kegiatan Mahameru.<br />Buka banner untuk melihat detail.</p></div><div ref={track} className={`home-promos-track ${live.length === 1 ? "is-single" : ""}`} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} onTouchCancel={() => setPaused(false)} tabIndex={0} aria-label="Banner promo dan kegiatan, geser untuk melihat lainnya" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>{live.map(item => <PromoCard item={item} key={item.id} />)}</div>{live.length > 1 && <button type="button" className="promo-motion-toggle" aria-pressed={userPaused} onClick={() => setUserPaused(p => !p)}>{userPaused ? "Lanjutkan banner ▶" : "Jeda banner Ⅱ"}</button>}</div></section>;
}
