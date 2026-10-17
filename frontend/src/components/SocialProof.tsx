"use client";
import PublicText from "./PublicText";

import Image from "./CmsImage";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { ReviewContent } from "../data/siteContent";

import { clientPartners } from "../data/clientPartners";
import { supplierPartners } from "../data/supplierPartners";

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
    // Keep the marquee idle while it is outside the viewport.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reducedMotion.matches) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
      }
    }, { rootMargin: "200px" });
    visibilityObserver.observe(element);
    element.addEventListener("scroll", keepInMiddle, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
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

function ReviewArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>;
}

function Stars({ rating }: { rating: number }) {
  return <span className="review-stars-svg" role="img" aria-label={`${rating} dari 5 bintang`}>{[0, 1, 2, 3, 4].map(index => <span key={index}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z" /></svg><svg viewBox="0 0 24 24" aria-hidden="true" style={{ clipPath: `inset(0 ${(1 - Math.max(0, Math.min(1, rating - index))) * 100}% 0 0)` }}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z" /></svg></span>)}</span>;
}

function Reviews({ content, companyName, includeImported }: { content: ReviewContent; companyName: string; includeImported: boolean }) {
  const published = content.reviews.filter(review => review.published && review.rating > 4).slice(0, 8);
  const slides: Array<{ kind: "review"; review: typeof published[number] } | { kind: "summary" } | { kind: "invite" }> = published.map(review => ({ kind: "review", review }));
  if (published.length < 3) slides.push({ kind: "summary" }, { kind: "invite" });
  const copies = [0, 1, 2];
  const marquee = useMarquee(slides.length, 30);
  return <PublicText><section className="home-section home-reviews reviews-editorial" id="ulasan" aria-labelledby="reviews-heading">
    <div className="home-shell">
      <div className="home-section-heading proof-heading" data-reveal>
        <div><p className="home-eyebrow text-brand"><span />{includeImported ? "Cerita & kepercayaan" : `Ulasan pelanggan ${companyName}`}</p><h2 id="reviews-heading">{includeImported ? <>Setiap kebutuhan,<br /><em>punya ceritanya.</em></> : <>Pengalaman pelanggan.<br /><em>Langsung dari Google Maps.</em></>}</h2></div>
        <a className="review-rating-seal" href={content.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Rating Google Maps ${content.rating} dari 5. Buka sumber`}><span className="review-seal-label">GOOGLE MAPS</span><strong>{content.rating.toFixed(1)}<small>/5</small></strong><Stars rating={content.rating} /><span>{content.reviewCount !== null ? `${content.reviewCount} ulasan` : "Lihat penilaian"}<ReviewArrow /></span></a>
      </div>
      <div className="review-caption-row"><p>{published.length ? "Ulasan pelanggan dari Google Maps. Baca cerita lengkapnya di profil toko kami." : "Lihat penilaian dan cerita pelanggan langsung pada profil Google Maps."}</p><button className="carousel-keyboard-control" type="button" onClick={marquee.togglePause} aria-pressed={marquee.userPaused}>{marquee.userPaused ? "Lanjutkan pergeseran ulasan" : "Hentikan pergeseran ulasan"}</button></div>
    </div>
    <div className="reviews-bleed"><div className="home-review-cards proof-marquee quote-ribbon" {...marquee.handlers} tabIndex={0} aria-label="Kartu cerita bergerak ke kanan. Geser atau gunakan tombol panah untuk menjelajah.">
      {copies.flatMap(copy => slides.map((slide, index) => slide.kind === "review" ? <article className={`quote-card quote-tone-${index % 3}`} key={`${copy}-${slide.review.id}`} aria-hidden={copy !== 1}>
        {(() => { const review = slide.review; return <>
        <div className="quote-card-top"><span className="quote-symbol" aria-hidden="true">{String.fromCharCode(8220)}</span><small>ULASAN GOOGLE</small></div>
        <Stars rating={review.rating} />
        <blockquote>{review.text}</blockquote>
        <footer><span className="quote-avatar" aria-hidden="true">{review.authorPhoto ? <Image src={review.authorPhoto} alt="" width={38} height={38} /> : review.author.slice(0, 1)}</span><div><strong>{review.author}</strong><small>{review.when || `Pelanggan ${companyName}`}</small></div><a className="quote-source" href={review.authorUrl || review.url} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? 0 : -1} aria-label={`Baca ulasan asli ${review.author}`}><ReviewArrow /></a></footer>
        </>; })()}
      </article> : <article className={`quote-card quote-tone-${index % 3} quote-info-card`} key={`${copy}-${slide.kind}`} aria-hidden={copy !== 1}>
        <div className="quote-card-top"><span className="quote-symbol" aria-hidden="true">{slide.kind === "summary" ? "★" : "+"}</span><small>{slide.kind === "summary" ? "PROFIL GOOGLE MAPS" : "CERITA BERIKUTNYA"}</small></div>
        <h3>{slide.kind === "summary" ? `${content.rating.toFixed(1)} dari 5 bintang.` : "Pernah belanja atau bekerja sama?"}</h3>
        <p>{slide.kind === "summary" ? `${content.reviewCount ?? "Lebih banyak"} ulasan tersedia pada profil Google Maps ${companyName}. Lihat cerita pelanggan langsung di sumbernya.` : "Pengalaman Anda membantu pelanggan berikutnya mengenal toko, material, dan layanan kami."}</p>
        <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? 0 : -1}>{slide.kind === "summary" ? "Baca seluruh ulasan" : "Tulis ulasan di Google Maps"} <ReviewArrow /></a>
      </article>))}
    </div></div>
    <div className="home-shell review-bottomline"><small>Profil {companyName} · dicatat {content.ratingDate}</small><a href={content.mapsUrl} target="_blank" rel="noopener noreferrer">Baca ulasan di Google Maps <ReviewArrow /></a></div>
  </section></PublicText>;
}

function Clients() {
  const marquee = useMarquee(clientPartners.length, 46);
  return <PublicText><section className="home-clients" id="klien" aria-labelledby="clients-heading">
    <div className="home-shell" data-reveal>
      <div className="proof-client-heading"><div><h2 id="clients-heading">Kepercayaan yang tumbuh<br /><em>melalui kerja sama.</em></h2><p className="partnership-intro">Perusahaan yang telah bekerja sama dengan Mahameru Baja Indonesia dalam memenuhi kebutuhan material dan pekerjaan proyek.</p></div></div>
      <div className="home-client-logo-grid proof-marquee" {...marquee.handlers} tabIndex={0} aria-label="Logo perusahaan, geser dengan mouse atau jari">
        {[0, 1, 2].flatMap((copy) => clientPartners.map((client) => <div className="home-client-logo" key={`${copy}-${client.name}`} aria-hidden={copy !== 1}>
          <Image src={client.logo} alt={copy === 1 ? `Logo ${client.name}` : ""} width={80} height={80} sizes="80px" draggable={false} />
          <span>{client.name}</span>
        </div>))}
      </div>
    </div>
  </section></PublicText>;
}

function Suppliers() {
  const marquee = useMarquee(supplierPartners.length, 38);
  return <PublicText><section className="home-suppliers" id="supplier" aria-labelledby="suppliers-heading"><div className="home-shell">
    <div className="home-section-heading"><div><p className="home-eyebrow text-brand"><span />Jaringan pemasok material</p><h2 id="suppliers-heading">Supplier kami.<br /><em>Bagian dari setiap kebutuhan.</em></h2></div><p>Mahameru Baja bekerja dengan jaringan pemasok material baja dan produk turunannya untuk mendukung kebutuhan toko, fabrikasi, serta pengadaan proyek.</p></div>
    <div className="supplier-ribbon-controls"><p>Geser untuk melihat pemasok material kami.</p><button type="button" className="carousel-keyboard-control" onClick={marquee.togglePause} aria-pressed={marquee.userPaused}>{marquee.userPaused ? "Lanjutkan pergeseran logo" : "Hentikan pergeseran logo"}</button></div>
    <div className="supplier-logo-grid supplier-logo-ribbon proof-marquee" {...marquee.handlers} tabIndex={0} aria-label="Logo supplier. Geser ke samping atau gunakan tombol panah.">{[0, 1, 2].flatMap(copy => supplierPartners.map(supplier => <figure key={`${copy}-${supplier.id}`} aria-hidden={copy !== 1}><Image src={supplier.logo} alt={copy !== 1 ? "" : supplier.name ? `Logo ${supplier.name}` : "Logo supplier sesuai company profile Mahameru Baja Indonesia"} width={260} height={150} sizes="240px" draggable={false} /><figcaption>{supplier.name || "\u00a0"}</figcaption></figure>))}</div>
  </div></section></PublicText>;
}

export default function SocialProof({ content, companyName = "Mahameru Baja", includeImported = true, reviewsOnly = false }: { content: ReviewContent; companyName?: string; includeImported?: boolean; reviewsOnly?: boolean }) {
  return <><Reviews content={content} companyName={companyName} includeImported={includeImported} />{!reviewsOnly && <><Clients /><Suppliers /></>}</>;
}
