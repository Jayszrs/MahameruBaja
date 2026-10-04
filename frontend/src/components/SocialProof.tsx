"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const sampleClients = [
  { name: "Astra", logo: "/images/client-logos/astra.png" },
  { name: "Mandiri", logo: "/images/client-logos/mandiri.png" },
  { name: "WIKA", logo: "/images/client-logos/wika.png" },
  { name: "PP", logo: "/images/client-logos/pp.png" },
  { name: "ADHI", logo: "/images/client-logos/adhi.png" },
  { name: "TOTAL", logo: "/images/client-logos/total.png" },
];

const sampleReviews = [
  { category: "Pembelian material", text: "Pilihan ukuran besi jelas dan proses bertanya stok terasa mudah." },
  { category: "Kebutuhan proyek", text: "Daftar material bisa dikirim sekaligus untuk ditinjau sebelum penawaran." },
  { category: "Laser cutting", text: "Alur pengiriman gambar kerja dan konsultasi teknis mudah dipahami." },
  { category: "Pengiriman", text: "Informasi lokasi dan kebutuhan pengiriman dapat disampaikan sejak awal." },
  { category: "Belanja retail", text: "Kategori produk membantu memilih material untuk renovasi kecil." },
  { category: "CNC bending", text: "Detail ukuran dan gambar kerja bisa dibahas bersama tim terlebih dahulu." },
  { category: "Material baja", text: "Spesifikasi produk tersusun rapi, jadi lebih mudah membuat daftar kebutuhan." },
  { category: "Konsultasi", text: "Pertanyaan awal tentang bahan dan jumlah dapat dikirim lewat WhatsApp." },
  { category: "Pengadaan", text: "Alur permintaan penawaran cocok untuk kebutuhan proyek bertahap." },
];

function Arrow({ direction }: { direction: "left" | "right" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={direction === "left" ? "M19 12H5m6 6-6-6 6-6" : "M5 12h14m-6-6 6 6-6 6"} /></svg>;
}

function ScrollControls({ onPrevious, onNext, label }: { onPrevious: () => void; onNext: () => void; label: string }) {
  return <div className="proof-controls">
    <button type="button" onClick={onPrevious} aria-label={`${label} sebelumnya`}><Arrow direction="left" /></button>
    <button type="button" onClick={onNext} aria-label={`${label} berikutnya`}><Arrow direction="right" /></button>
  </div>;
}

function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    const element = ref.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const distance = (card?.getBoundingClientRect().width ?? 320) + 12;
    const end = element.scrollWidth - element.clientWidth;
    if (direction > 0 && element.scrollLeft >= end - 8) element.scrollTo({ left: 0, behavior: "smooth" });
    else if (direction < 0 && element.scrollLeft <= 8) element.scrollTo({ left: end, behavior: "smooth" });
    else element.scrollBy({ left: direction * distance, behavior: "smooth" });
  };
  return { ref, move };
}

function Reviews() {
  const { ref, move } = useHorizontalScroll();
  return <section className="home-section home-reviews" id="ulasan" aria-labelledby="reviews-heading">
    <div className="home-shell">
      <div className="home-section-heading proof-heading" data-reveal>
        <div><p className="home-eyebrow text-brand"><span />Rating & ulasan</p><h2 id="reviews-heading">Kesan pelanggan,<br />satu demi satu.</h2></div>
        <div className="proof-heading-side"><p>Pratinjau tampilan ulasan. Semua kutipan dan angka di bawah adalah data dummy untuk desain, bukan ulasan pelanggan atau rating Google.</p><ScrollControls onPrevious={() => move(-1)} onNext={() => move(1)} label="Ulasan" /></div>
      </div>
      <div className="home-review-layout" data-reveal>
        <div className="home-rating-card">
          <span>Pratinjau rating</span>
          <strong>5.0<small>/ 5</small></strong>
          <div aria-label="5 bintang contoh">★★★★★</div>
          <p>Angka contoh untuk tampilan halaman</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Toko%20Besi%20Mahameru%20Baja%20Tambun%20Selatan" target="_blank" rel="noopener noreferrer">Lihat profil Google Maps <Arrow direction="right" /></a>
        </div>
        <div className="home-review-cards" ref={ref} tabIndex={0} aria-label="Geser daftar ulasan contoh ke kanan atau kiri">
          {sampleReviews.map((review, index) => <article key={review.category}>
            <div aria-hidden="true">★★★★★</div>
            <span>CONTOH {String(index + 1).padStart(2, "0")}</span>
            <p>“{review.text}”</p>
            <strong>{review.category}</strong>
            <small>Data dummy · belum terverifikasi</small>
          </article>)}
        </div>
      </div>
      <p className="proof-footnote">Geser kartu secara manual atau gunakan tombol panah untuk melihat lebih banyak contoh.</p>
    </div>
  </section>;
}

function Clients() {
  const { ref, move } = useHorizontalScroll();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || reduced.matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !element) return;
      if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 12) {
        element.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const card = element.firstElementChild as HTMLElement | null;
        element.scrollBy({ left: (card?.getBoundingClientRect().width ?? 240) + 12, behavior: "smooth" });
      }
    }, 3200);
    return () => window.clearInterval(timer);
  }, [paused, ref]);

  return <section className="home-clients" id="klien" aria-labelledby="clients-heading">
    <div className="home-shell" data-reveal>
      <div className="proof-client-heading">
        <div><p className="home-eyebrow text-brand"><span />Jaringan & kolaborasi</p><h2 id="clients-heading">Ruang untuk mitra kami.</h2></div>
        <ScrollControls onPrevious={() => move(-1)} onNext={() => move(1)} label="Logo" />
      </div>
      <div className="home-client-logo-grid" ref={ref} tabIndex={0} aria-label="Geser daftar logo contoh ke kanan atau kiri" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
        {[...sampleClients, ...sampleClients].map((client, index) => <div className="home-client-logo" key={`${client.name}-${index}`}>
          <Image src={client.logo} alt="" width={80} height={80} sizes="80px" />
          <span>{client.name}</span>
        </div>)}
      </div>
      <p className="proof-footnote">Logo di atas hanya preview desain dan diulang untuk simulasi carousel. Daftar serta izin publikasi mitra perlu diverifikasi sebelum tayang resmi.</p>
    </div>
  </section>;
}

export default function SocialProof() {
  return <><Reviews /><Clients /></>;
}
