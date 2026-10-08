"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Promotion } from "../data/promotions";
import PromotionImage from "./PromotionImage";

const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function jakartaDate() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (type: string) => parts.find(part => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function period(item: Promotion) {
  if (!item.startDate && !item.endDate) return "";
  const format = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${value}T00:00:00+07:00`));
  if (item.startDate && item.endDate) return `${format(item.startDate)} – ${format(item.endDate)}`;
  return item.startDate ? `Mulai ${format(item.startDate)}` : `Hingga ${format(item.endDate)}`;
}

function PromoCard({ item }: { item: Promotion }) {
  const [open, setOpen] = useState(false);
  const [sizing, setSizing] = useState(false);
  const timer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  useEffect(() => { if (open) scrollRef.current?.scrollTo({ top: 0 }); }, [open ]);
  const maskReflow = () => {
    if (reduceMotion()) return;
    setSizing(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setSizing(false); timer.current = null; }, 400);
  };
  const hoverOn = () => { if (!canHover()) return; setOpen(true); maskReflow(); };
  const hoverOff = () => { if (!canHover()) return; setOpen(false); maskReflow(); };
  return <article
    className={`home-promo-card${open ? " is-open" : ""}${sizing ? " is-sizing" : ""}`}
    onMouseEnter={hoverOn}
    onMouseLeave={hoverOff}
  >
    <div className="home-promo-media"><PromotionImage src={item.image} alt={item.imageAlt} /></div>
    <div className="home-promo-overlay" aria-hidden="true" />
    <div className="home-promo-content">
      <span className="home-promo-kicker">{item.label}</span>
      <h3>{item.title}</h3>
      {item.benefit && <p>{item.benefit}</p>}
      {period(item) && <small className="home-promo-period">{period(item)}</small>}
      <div className="home-promo-actions">
        <Link href={item.ctaHref}>{item.ctaLabel}</Link>
        <button
          type="button"
          className="home-promo-detail-toggle"
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
        >
          {open ? "Tutup detail" : "Lihat detail"}
        </button>
      </div>
    </div>
    <div className="home-promo-detail" aria-hidden={!open} inert={!open}>
      <div className="home-promo-detail-head">
        <span className="home-promo-kicker">{item.label}</span>
        <button type="button" className="home-promo-detail-close" onClick={() => setOpen(false)} aria-label="Tutup detail promo">✕</button>
      </div>
      <div className="home-promo-detail-scroll" ref={scrollRef}>
        <h3>{item.title}</h3>
        {item.benefit && <p><strong>Promo:</strong> {item.benefit}</p>}
        {item.appliesTo && <p><strong>Berlaku untuk:</strong> {item.appliesTo}</p>}
        {period(item) && <p><strong>Periode:</strong> {period(item)}</p>}
        {item.terms && <p><strong>Ketentuan:</strong> {item.terms}</p>}
        <Link href={item.ctaHref}>{item.ctaLabel}</Link>
      </div>
    </div>
  </article>;
}

export default function Promotions({ promotions }: { promotions: Promotion[] }) {
  const today = jakartaDate();
  const live = promotions.filter(item => item.published && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today));
  if (!live.length) return null;
  return <section className="home-promos" aria-labelledby="home-promos-heading">
    <div className="home-shell">
      <div className="home-promos-header" data-reveal>
        <div><p className="home-promos-eyebrow">Promo & penawaran</p><h2 id="home-promos-heading">Lihat promo dan penawaran yang sedang tersedia.</h2></div>
      </div>
      <div className="home-promos-track" data-reveal tabIndex={0} aria-label="Daftar promo, geser ke samping untuk melihat semuanya">
        {live.map(item => <PromoCard key={item.id} item={item} />)}
      </div>
    </div>
  </section>;
}
