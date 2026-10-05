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

function ReviewArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>;
}

function Stars({ rating }: { rating: number }) {
  return <span className="review-stars-svg" role="img" aria-label={`${rating} dari 5 bintang`}>{[0, 1, 2, 3, 4].map(index => <span key={index}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z" /></svg><svg viewBox="0 0 24 24" aria-hidden="true" style={{ clipPath: `inset(0 ${(1 - Math.max(0, Math.min(1, rating - index))) * 100}% 0 0)` }}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z" /></svg></span>)}</span>;
}

// Illustrative copy only. It is never saved or described as a Google review.
const reviewPreviews = [
  { id: "retail", author: "Kebutuhan renovasi", when: "Retail material", text: "Dari ukuran besi sampai jumlah kebutuhan, percakapan kecil bisa menjadi awal bangunan yang direncanakan dengan baik." },
  { id: "laser", author: "Dari gambar ke bentuk", when: "Laser cutting", text: "Sebuah pola di atas kertas punya banyak kemungkinan. Mulai dengan gambar kerja, lalu bicarakan material dan detailnya." },
  { id: "supply", author: "Untuk pekerjaan besar", when: "Supply proyek", text: "Rencana yang jelas membantu setiap tahap. Daftar material, lokasi, dan waktu kebutuhan menjadi awal koordinasi bersama." },
  { id: "bending", author: "Detail yang berarti", when: "CNC bending", text: "Sudut, ukuran, dan ketebalan membentuk hasil akhir. Setiap detail layak dibicarakan sebelum masuk ke proses produksi." },
  { id: "workshop", author: "Bertemu di workshop", when: "Konsultasi kebutuhan", text: "Ada ide yang lebih mudah dijelaskan lewat percakapan. Bawa gambar atau daftar kebutuhan, lalu mulai dari sana." },
  { id: "material", author: "Material untuk ide Anda", when: "Besi & baja", text: "Setiap pekerjaan punya kebutuhan berbeda. Memilih profil dan ukuran yang sesuai adalah bagian dari merencanakan hasilnya." },
];

function Reviews({ content }: { content: SiteContent }) {
  const published = content.reviews.filter(review => review.published);
  const preview = published.length === 0;
  const reviews = preview ? reviewPreviews.map(review => ({ ...review, rating: 5, url: "" })) : published;
  const copies = reviews.length < 3 ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2];
  const marquee = useMarquee(reviews.length, 30);
  return <section className="home-section home-reviews reviews-editorial" id="ulasan" aria-labelledby="reviews-heading">
    <div className="home-shell">
      <div className="home-section-heading proof-heading" data-reveal>
        <div><p className="home-eyebrow text-brand"><span />Cerita & kepercayaan</p><h2 id="reviews-heading">Setiap kebutuhan,<br /><em>punya ceritanya.</em></h2></div>
        <a className="review-rating-seal" href={content.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Rating Google Maps ${content.rating} dari 5. Buka sumber`}><span className="review-seal-label">GOOGLE MAPS</span><strong>{content.rating.toFixed(1)}<small>/5</small></strong><Stars rating={content.rating} /><span>{content.reviewCount !== null ? `${content.reviewCount} ulasan` : "Lihat penilaian"}<ReviewArrow /></span></a>
      </div>
      <div className="review-caption-row"><p>{preview ? "Pratinjau desain: cerita ilustratif, bukan kutipan ulasan Google." : "Cerita pelanggan, dikutip dari ulasan Google Maps."}</p><button className="review-motion-toggle" type="button" onClick={marquee.togglePause} aria-pressed={marquee.userPaused}><span aria-hidden="true">{marquee.userPaused ? "\u25b6" : "\u2161"}</span>{marquee.userPaused ? "Lanjutkan" : "Jeda"}</button></div>
    </div>
    <div className="reviews-bleed"><div className="home-review-cards proof-marquee quote-ribbon" {...marquee.handlers} tabIndex={0} aria-label="Kartu cerita bergerak ke kanan. Geser atau gunakan tombol panah untuk menjelajah.">
      {copies.flatMap(copy => reviews.map((review, index) => <article className={`quote-card quote-tone-${index % 3}`} key={`${copy}-${review.id}`} aria-hidden={copy !== 1}>
        <div className="quote-card-top"><span className="quote-symbol" aria-hidden="true">{String.fromCharCode(8220)}</span><small>{preview ? `CONTOH CERITA ${String(index + 1).padStart(2, "0")}` : "ULASAN GOOGLE"}</small></div>
        <Stars rating={review.rating} />
        <blockquote>{review.text}</blockquote>
        <footer><span className="quote-avatar" aria-hidden="true">{preview ? <svg viewBox="0 0 40 40" fill="none"><path d={index % 2 ? "M8 29 20 8l12 21H8ZM20 8v21M8 29l18-11" : "M9 10h22v22H9zM9 10l22 22M31 10 9 32M20 10v22"} stroke="currentColor" strokeWidth="1.5" /></svg> : review.author.slice(0, 1)}</span><div><strong>{review.author}</strong><small>{review.when || "Pelanggan Mahameru Baja"}</small></div>{!preview ? <a className="quote-source" href={review.url} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? 0 : -1} aria-label={`Baca ulasan asli ${review.author}`}><ReviewArrow /></a> : <span className="quote-spark" aria-hidden="true">{String.fromCharCode(10023)}</span>}</footer>
      </article>))}
    </div></div>
    <div className="home-shell review-bottomline"><span>Rating dicatat {content.ratingDate}</span><a href={content.mapsUrl} target="_blank" rel="noopener noreferrer">Baca ulasan di Google Maps <ReviewArrow /></a></div>
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
