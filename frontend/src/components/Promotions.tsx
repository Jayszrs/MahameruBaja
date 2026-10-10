"use client";
import Link from "next/link";
import { useRef } from "react";
import type { Promotion } from "../data/promotions";
import PromotionImage from "./PromotionImage";
import { jakartaDate } from "../lib/jakartaDate";

function PromoCard({ item }: { item: Promotion }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <article className="promo-editorial-card">
    <button type="button" className="promo-editorial-image" onClick={() => dialog.current?.showModal()} aria-label={`Preview ${item.title}`}><PromotionImage src={item.image} alt={item.imageAlt} /><span>Lihat banner ↗</span></button>
    <div className="promo-editorial-copy"><span>{item.label}</span><h3>{item.title}</h3><p>{item.summary}</p><div><Link href={item.ctaHref}>{item.ctaLabel} ↗</Link><button type="button" onClick={() => dialog.current?.showModal()}>Detail penawaran ↗</button></div></div>
    <dialog ref={dialog} className="promo-preview-dialog" aria-labelledby={`promo-title-${item.id}`} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="promo-preview-layout"><button className="promo-preview-close" onClick={() => dialog.current?.close()} aria-label="Tutup preview promo">✕</button><div className="promo-preview-image"><PromotionImage src={item.image} alt={item.imageAlt} featured /></div><div className="promo-preview-copy"><span>{item.label}</span><h2 id={`promo-title-${item.id}`}>{item.title}</h2><p>{item.summary}</p>{item.benefit && <p><strong>Penawaran</strong>{item.benefit}</p>}{item.appliesTo && <p><strong>Berlaku untuk</strong>{item.appliesTo}</p>}{(item.startDate || item.endDate) && <p><strong>Periode</strong>{item.startDate || "Mulai sekarang"} — {item.endDate || "Sampai pemberitahuan berikutnya"}</p>}{item.terms && <p><strong>Ketentuan</strong>{item.terms}</p>}<Link href={item.ctaHref} onClick={() => dialog.current?.close()}>{item.ctaLabel} ↗</Link></div></div></dialog>
  </article>;
}
export default function Promotions({ promotions }: { promotions: Promotion[] }) {
  const today = jakartaDate();
  const live = promotions.filter(p => p.published && (!p.startDate || p.startDate <= today) && (!p.endDate || p.endDate >= today));
  if (!live.length) return null;
  return <section className="home-promos promos-editorial" aria-labelledby="home-promos-heading"><div className="home-shell"><div className="promo-editorial-heading"><div><p className="industrial-eyebrow">PROMO & KEGIATAN</p><h2 id="home-promos-heading">Kabar terbaru.<br />Penawaran untuk Anda.</h2></div><p>Informasi layanan, kegiatan, dan penawaran Mahameru. Klik banner untuk membaca detail dan ketentuannya.</p></div><div className="promo-editorial-grid">{live.map(item => <PromoCard item={item} key={item.id} />)}</div></div></section>;
}
