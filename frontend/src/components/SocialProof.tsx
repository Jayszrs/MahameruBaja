"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { SiteContent } from "../data/siteContent";

const clients = [
  { name: "Astra", logo: "/images/client-logos/astra.png" },
  { name: "Mandiri", logo: "/images/client-logos/mandiri.png" },
  { name: "WIKA", logo: "/images/client-logos/wika.png" },
  { name: "PP", logo: "/images/client-logos/pp.png" },
  { name: "ADHI", logo: "/images/client-logos/adhi.png" },
  { name: "TOTAL", logo: "/images/client-logos/total.png" },
];

function useMarquee(itemCount: number, pixelsPerSecond: number) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [userPaused, setUserPaused] = useState(false);
  const stopped = useRef(false);
  const drag = useRef<{ x: number; left: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !itemCount) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    let fraction = 0;

    const cycleWidth = () => {
      const first = element.children[0] as HTMLElement | undefined;
      const nextCopy = element.children[itemCount] as HTMLElement | undefined;
      return first && nextCopy ? nextCopy.offsetLeft - first.offsetLeft : 0;
    };
    const keepInMiddle = () => {
      const cycle = cycleWidth();
      if (!cycle) return;
      if (element.scrollLeft < cycle * 0.5) {
        element.scrollLeft += cycle;
        if (drag.current) drag.current.left += cycle;
      }
      if (element.scrollLeft > cycle * 1.5) {
        element.scrollLeft -= cycle;
        if (drag.current) drag.current.left -= cycle;
      }
    };
    const align = () => {
      const cycle = cycleWidth();
      if (cycle && element.scrollLeft === 0) element.scrollLeft = cycle;
    };
    align();
    const resizeObserver = new ResizeObserver(align);
    resizeObserver.observe(element);

    const tick = (now: number) => {
      if (previous && !paused.current && !stopped.current && !drag.current && !document.hidden && !reducedMotion.matches) {
        fraction += Math.min(now - previous, 64) * pixelsPerSecond / 1000;
        const distance = Math.trunc(fraction);
        fraction -= distance;
        element.scrollLeft -= distance;
        keepInMiddle();
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    element.addEventListener("scroll", keepInMiddle, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      element.removeEventListener("scroll", keepInMiddle);
    };
  }, [itemCount, pixelsPerSecond]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || (event.target as HTMLElement).closest("a")) return;
    const element = ref.current;
    if (!element) return;
    drag.current = { x: event.clientX, left: element.scrollLeft };
    paused.current = true;
    element.setPointerCapture(event.pointerId);
    element.classList.add("is-dragging");
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return;
    ref.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    ref.current?.classList.remove("is-dragging");
    if (ref.current?.hasPointerCapture(event.pointerId)) ref.current.releasePointerCapture(event.pointerId);
    paused.current = false;
  };

  return {
    userPaused,
    togglePause: () => { stopped.current = !stopped.current; setUserPaused(stopped.current); },
    handlers: {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onMouseEnter: () => { paused.current = true; },
    onMouseLeave: () => { if (!drag.current) paused.current = false; },
    onFocusCapture: () => { paused.current = true; },
    onBlurCapture: () => { paused.current = false; },
    onTouchStart: () => { paused.current = true; },
    onTouchEnd: () => { paused.current = false; },
    onTouchCancel: () => { paused.current = false; },
    },
  };
}

function Reviews({ content }: { content: SiteContent }) {
  const reviews = content.reviews.filter(review => review.published);
  const copies = reviews.length < 3 ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2];
  const marquee = useMarquee(reviews.length, 38);
  return <section className="home-section home-reviews" id="ulasan" aria-labelledby="reviews-heading">
    <div className="home-shell">
      <div className="home-section-heading proof-heading" data-reveal>
        <div><p className="home-eyebrow text-brand"><span />Suara pelanggan</p><h2 id="reviews-heading">Pengalaman mereka.<br />Kepercayaan untuk kami.</h2></div>
        <p>Penilaian pelanggan di Google Maps. Baca cerita mereka, lalu diskusikan kebutuhan Anda bersama tim kami.</p>
      </div>
      <div className="reviews-summary" data-reveal><div className="reviews-google-mark" aria-hidden="true">G</div><strong>{content.rating.toFixed(1)}<small>/ 5</small></strong><div><div className="rating-stars" aria-label={`${content.rating.toFixed(1)} dari 5 bintang`}><span>?????</span><span style={{ width: `${content.rating / 5 * 100}%` }} aria-hidden="true">?????</span></div><p>{content.reviewCount !== null ? `${content.reviewCount} ulasan Google` : "Rating Google Maps"} ? dicatat {content.ratingDate}</p></div><a href={content.mapsUrl} target="_blank" rel="noopener noreferrer">Lihat semua di Google ?</a>{reviews.length > 0 && <button type="button" onClick={marquee.togglePause} aria-pressed={marquee.userPaused}>{marquee.userPaused ? "Lanjutkan gerak" : "Jeda gerak"}</button>}</div>
    </div>
    {reviews.length > 0 ? <div className="reviews-bleed"><div className="home-review-cards proof-marquee" {...marquee.handlers} tabIndex={0} aria-label="Ulasan Google, bergerak ke kanan. Geser untuk menjelajah.">
      {copies.flatMap(copy => reviews.map(review => <article key={`${copy}-${review.id}`} aria-hidden={copy !== 1}>
        <header><span className="review-avatar">{review.author.slice(0, 1)}</span><div><strong>{review.author}</strong><small>{review.when || "Ulasan Google Maps"}</small></div><span className="review-google-g" aria-hidden="true">G</span></header>
        <div className="review-card-stars" aria-label={`${review.rating} dari 5 bintang`}>{"?".repeat(review.rating)}<span>{"?".repeat(5 - review.rating)}</span></div>
        <blockquote>{review.text}</blockquote>
        <a className="review-source" href={review.url} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? 0 : -1}>Baca ulasan asli ?</a>
      </article>))}
    </div></div> : <div className="home-shell"><a className="reviews-source-callout" href={content.mapsUrl} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">?</span><div><strong>Baca cerita pelanggan kami.</strong><p>Ulasan lengkap tersedia di profil Google Maps Mahameru Baja.</p></div><b aria-hidden="true">?</b></a></div>}
  </section>;
}

function Clients() {
  const marquee = useMarquee(clients.length, 46);
  return <section className="home-clients" id="klien" aria-labelledby="clients-heading">
    <div className="home-shell" data-reveal>
      <div className="proof-client-heading"><div><p className="home-eyebrow text-brand"><span />Jaringan & kolaborasi</p><h2 id="clients-heading">Perusahaan yang pernah bekerja sama.</h2></div><button className="marquee-pause" type="button" onClick={marquee.togglePause} aria-pressed={marquee.userPaused}>{marquee.userPaused ? "Lanjutkan gerak" : "Jeda gerak"}</button></div>
      <div className="home-client-logo-grid proof-marquee" {...marquee.handlers} tabIndex={0} aria-label="Logo perusahaan, geser dengan mouse atau jari">
        {[0, 1, 2].flatMap((copy) => clients.map((client) => <div className="home-client-logo" key={`${copy}-${client.name}`} aria-hidden={copy !== 1}>
          <Image src={client.logo} alt={copy === 1 ? `Logo ${client.name}` : ""} width={80} height={80} sizes="80px" draggable={false} />
          <span>{client.name}</span>
        </div>))}
      </div>
    </div>
  </section>;
}

export default function SocialProof({ content }: { content: SiteContent }) {
  return <><Reviews content={content} /><Clients /></>;
}
