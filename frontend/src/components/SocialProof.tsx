"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import { googleMapsUrl, googleRating, googleRatingObservedAt, googleReviewCount, googleReviews } from "../data/googleReviews";

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
  const drag = useRef<{ x: number; left: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !itemCount) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;

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
      if (element.scrollLeft > cycle * 2.5) {
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
      if (previous && !paused.current && !drag.current && !document.hidden && !reducedMotion.matches) {
        element.scrollLeft -= Math.min(now - previous, 64) * pixelsPerSecond / 1000;
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
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onFocusCapture: () => { paused.current = true; },
    onBlurCapture: () => { paused.current = false; },
    onTouchStart: () => { paused.current = true; },
    onTouchEnd: () => { paused.current = false; },
  };
}

function Reviews() {
  const reviews = googleReviews;
  const reviewCopies = reviews.length < 3 ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2];
  const marquee = useMarquee(reviews.length, 62);
  const mapsUrl = googleMapsUrl;
  return <section className="home-section home-reviews" id="ulasan" aria-labelledby="reviews-heading">
    <div className="home-shell">
      <div className="home-section-heading proof-heading" data-reveal>
        <div><p className="home-eyebrow text-brand"><span />Rating & ulasan</p><h2 id="reviews-heading">{reviews.length ? <>Cerita pelanggan,<br />langsung dari Google.</> : <>Penilaian pelanggan<br />di Google Maps.</>}</h2></div>
        <p>Lihat penilaian dan pengalaman pelanggan pada profil resmi Toko Besi Mahameru Baja di Google Maps.</p>
      </div>
      <div className="home-review-layout" data-reveal>
        <div className="home-rating-card">
          <span>Google Maps · Toko Besi Mahameru Baja</span>
          {typeof googleRating === "number" ? <>
            <strong>{googleRating.toFixed(1)}<small>/ 5</small></strong>
            <div className="rating-stars" aria-label={`${googleRating.toFixed(1)} dari 5 bintang`}><span>★★★★★</span><span style={{ width: `${googleRating / 5 * 100}%` }} aria-hidden="true">★★★★★</span></div>
            <p>{typeof googleReviewCount === "number" ? `${new Intl.NumberFormat("id-ID").format(googleReviewCount)} ulasan di Google` : `Rating dilihat ${googleRatingObservedAt}`}</p>
          </> : <>
            <strong className="home-rating-prompt">Lihat rating terbaru</strong>
            <p>Penilaian terbaru tersedia langsung di Google Maps.</p>
          </>}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Buka profil Google Maps <span aria-hidden="true">↗</span></a>
        </div>
        {reviews.length > 0 ? <div className="home-review-cards proof-marquee" {...marquee} tabIndex={0} aria-label="Ulasan Google, geser untuk melihat ulasan lain">
          {reviewCopies.flatMap((copy) => reviews.map((review, index) => <article key={`${copy}-${index}`} aria-hidden={copy !== 1}>
            <div aria-label={`${review.rating} dari 5 bintang`}>{"★".repeat(Math.max(0, Math.min(5, review.rating)))}</div>
            <p>“{review.text}”</p>
            <div className="review-author">{review.authorPhoto && <img src={review.authorPhoto} alt="" loading="lazy" />}<div><strong>{review.authorUrl ? <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? 0 : -1}>{review.author}</a> : review.author}</strong><small>{review.when || "Ulasan Google"}</small></div></div>
            <a className="review-source" href={review.url || mapsUrl} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? 0 : -1}>Lihat di Google Maps ↗</a>
          </article>))}
        </div> : <div className="home-reviews-map"><iframe title="Profil Toko Besi Mahameru Baja di Google Maps" src="https://www.google.com/maps?q=Toko%20Besi%20Mahameru%20Baja%20Tambun%20Selatan&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={mapsUrl} target="_blank" rel="noopener noreferrer">Baca ulasan pelanggan di Google Maps ↗</a></div>}
      </div>
      {reviews.length > 0 && <p className="proof-footnote">Kutipan ulasan dari profil Google Maps Mahameru Baja. Geser dengan mouse atau jari untuk menjelajahinya.</p>}
    </div>
  </section>;
}

function Clients() {
  const marquee = useMarquee(clients.length, 76);
  return <section className="home-clients" id="klien" aria-labelledby="clients-heading">
    <div className="home-shell" data-reveal>
      <div className="proof-client-heading"><div><p className="home-eyebrow text-brand"><span />Jaringan & kolaborasi</p><h2 id="clients-heading">Perusahaan yang pernah bekerja sama.</h2></div></div>
      <div className="home-client-logo-grid proof-marquee" {...marquee} tabIndex={0} aria-label="Logo perusahaan, geser dengan mouse atau jari">
        {[0, 1, 2].flatMap((copy) => clients.map((client) => <div className="home-client-logo" key={`${copy}-${client.name}`} aria-hidden={copy !== 1}>
          <Image src={client.logo} alt={copy === 1 ? `Logo ${client.name}` : ""} width={80} height={80} sizes="80px" draggable={false} />
          <span>{client.name}</span>
        </div>))}
      </div>
    </div>
  </section>;
}

export default function SocialProof() {
  return <><Reviews /><Clients /></>;
}
