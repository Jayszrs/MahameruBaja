"use client";

import { Link } from 'react-router';
import { useReveal, useCounter } from '../hooks/useReveal';
import BusinessUnits from '../components/BusinessUnits';
import MotionController from '../components/MotionController';

function ArrowIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}
function WAIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>;
}

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>;
}

// ── Page Hero ─────────────────────────────────────────────────────────
function PageHero() {
  return (
    <section
      className="relative bg-gunmetal overflow-hidden -mt-[7.75rem] lg:-mt-[8.5rem]"
      style={{ minHeight: '65vh' }}
      aria-labelledby="about-hero-heading"
    >
      {/* Parallax bg */}
      <div
        className="about-hero-parallax"
        data-parallax="0.12"
        aria-hidden="true"
      >
        <img
          src="/images/steel-indonesia/toko-mahameru.jpg"
          alt=""
          className="w-full h-full object-cover opacity-22"
        />
      </div>
      <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-gunmetal via-gunmetal/90 to-gunmetal/50" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-gunmetal/80 via-transparent to-gunmetal/50" aria-hidden="true" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 pt-[10.75rem] lg:pt-[12.5rem] pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/35 mb-6">
          <Link to="/" className="hover:text-white/65 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-white/60">Tentang Kami</span>
        </nav>

        <div className="flex items-center gap-2 mb-5">
          <span className="h-px w-8 bg-brand" />
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-brand font-[family-name:var(--font-mono)]">Tentang Kami</span>
        </div>
        <h1 id="about-hero-heading" className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.06] max-w-2xl mb-5 font-[family-name:var(--font-display)]">
          Material yang Tepat.<br />
          <span className="text-brand">Pelayanan yang Dekat.</span>
        </h1>
        <p className="text-white/55 text-base max-w-lg leading-relaxed">
          Mahameru Baja adalah mitra terpercaya penyedia besi dan material baja di Bekasi dan sekitarnya, melayani dari skala rumah tinggal hingga proyek komersial besar.
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-warm-white/80 to-transparent" aria-hidden="true" />
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────
function StatsSection() {
  const { ref, visible } = useReveal();
  const countY = useCounter(10, 1400, visible);
  const countP = useCounter(500, 2000, visible);
  const countProd = useCounter(22, 1600, visible);
  const countArea = useCounter(9, 1200, visible);

  const stats = [
    { num: countY, suffix: '+', label: 'Tahun Beroperasi', sub: 'Pengalaman di industri baja' },
    { num: countP, suffix: '+', label: 'Pelanggan Puas', sub: 'Dari rumah tangga hingga korporasi' },
    { num: countProd, suffix: '+', label: 'Jenis Produk', sub: 'Besi, baja, dan material bangunan' },
    { num: countArea, suffix: '', label: 'Area Pengiriman', sub: 'Wilayah Bekasi & sekitarnya' },
  ];

  return (
    <section className="py-14 bg-graphite" aria-label="Statistik Mahameru Baja">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}>
              <div className="text-3xl lg:text-4xl font-extrabold text-brand tabular-nums font-[family-name:var(--font-display)] mb-1">
                —
              </div>
              <div className="text-white font-bold text-sm mb-1">{s.label}</div>
              <div className="text-white/70 text-[11px]">Data menunggu verifikasi</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About Intro ────────────────────────────────────────────────────────
function AboutIntro() {
  const { ref, visible } = useReveal();

  return (
    <section className="py-24 bg-warm-white" aria-labelledby="about-intro-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-graphite reveal ${visible ? 'visible' : ''}`}>
            <div className="about-intro-parallax" data-parallax="0.055">
              <img src="/images/steel-indonesia/toko-mahameru.jpg" alt="Toko Mahameru Baja di Tambun Selatan" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gunmetal/50 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-brand text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              TAMBUN SELATAN, BEKASI
            </div>
          </div>
          <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand">Siapa Kami</span>
            </div>
            <h2 id="about-intro-heading" className="text-3xl lg:text-[2.5rem] font-extrabold text-graphite leading-tight mb-5 font-[family-name:var(--font-display)]">
              Toko Besi Mahameru Baja
            </h2>
            <p className="text-steel-grey leading-relaxed mb-4 text-sm">
              Mahameru Baja adalah toko besi dan supplier material konstruksi yang berlokasi di Tambun Selatan, Kabupaten Bekasi. Kami menyediakan berbagai jenis besi dan material baja untuk memenuhi kebutuhan dari skala rumah tinggal hingga proyek komersial berskala besar.
            </p>
            <p className="text-steel-grey leading-relaxed mb-7 text-sm">
              Dengan lokasi strategis di kawasan Bekasi, kami melayani pemilik rumah, bengkel fabrikasi, kontraktor, developer, dan tim procurement perusahaan di Bekasi, Tambun, Cikarang, dan sekitarnya.
            </p>
            <div className="grid grid-cols-2 gap-4 p-5 bg-surface-2 rounded-xl border border-light-steel">
              {[
                { label: 'Lokasi', value: 'Tambun Selatan, Bekasi' },
                { label: 'Layanan Area', value: 'Bekasi & Sekitarnya' },
                { label: 'Jam Buka', value: 'Sen–Sab 07:00–17:00' },
                { label: 'Kontak', value: '+62 812-1805-2017' },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-[10px] text-steel-grey font-medium mb-0.5 uppercase tracking-wide">{item.label}</div>
                  <div className="text-sm font-bold text-graphite font-[family-name:var(--font-display)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── What We Do ─────────────────────────────────────────────────────────
function WhatWeDoSection() {
  const { ref, visible } = useReveal();

  const items = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>,
      num: '01', title: 'Penjualan Material',
      desc: 'Besi, pipa, plat, wiremesh, baja ringan, bondek, dan berbagai material konstruksi untuk pembelian satuan maupun volume besar.',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
      num: '02', title: 'Konsultasi Kebutuhan',
      desc: 'Tim kami siap membantu menentukan spesifikasi material yang tepat sesuai kebutuhan dan anggaran proyek Anda.',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      num: '03', title: 'Supply Proyek',
      desc: 'Layanan suplai material untuk proyek konstruksi dengan penawaran harga kompetitif dan jadwal pengiriman fleksibel.',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
      num: '04', title: 'Pengiriman Material',
      desc: 'Layanan pengiriman material ke lokasi proyek di area Bekasi dan sekitarnya sesuai kesepakatan waktu dan biaya.',
    },
  ];

  return (
    <section className="py-20 bg-surface-2" aria-labelledby="what-we-do-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-12 reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Layanan</span>
            <span className="w-6 h-px bg-brand" />
          </div>
          <h2 id="what-we-do-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
            Apa yang Kami Lakukan
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <div
              key={item.num}
              className={`bg-white border border-light-steel rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 reveal reveal-delay-${(i % 2) + 1} ${visible ? 'visible' : ''}`}
            >
              <div className="w-11 h-11 rounded-xl bg-brand/8 text-brand flex items-center justify-center mb-4">
                <div className="w-5 h-5">{item.icon}</div>
              </div>
              <div className="text-xs font-bold text-brand font-[family-name:var(--font-mono)] mb-1 tracking-wide">{item.num}</div>
              <h3 className="font-extrabold text-graphite text-base mb-2 font-[family-name:var(--font-display)]">{item.title}</h3>
              <p className="text-sm text-steel-grey leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Customer Segments ──────────────────────────────────────────────────
const segmentIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /><path d="M14.83 9.17a4 4 0 010 5.66M9.17 9.17a4 4 0 000 5.66" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 20 22 20 12 4" /><line x1="12" y1="9" x2="12" y2="14" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
];

function CustomerSegmentsSection() {
  const { ref, visible } = useReveal();

  const segments = [
    { label: 'Pemilik Rumah', desc: 'Renovasi dan konstruksi hunian' },
    { label: 'Bengkel Fabrikasi', desc: 'Material untuk fabrication shop' },
    { label: 'Kontraktor', desc: 'Supply proyek konstruksi' },
    { label: 'Developer Property', desc: 'Kebutuhan perumahan & ruko' },
    { label: 'Proyek Komersial', desc: 'Gudang, pabrik, dan gedung' },
    { label: 'Procurement Tim', desc: 'Pengadaan material korporasi' },
  ];

  return (
    <section className="py-20 bg-graphite overflow-hidden relative" aria-labelledby="segments-heading">
      <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-12 reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Pelanggan</span>
            <span className="w-6 h-px bg-brand" />
          </div>
          <h2 id="segments-heading" className="text-2xl lg:text-3xl font-extrabold text-white font-[family-name:var(--font-display)]">
            Kami Melayani
          </h2>
          <p className="text-white/45 mt-2 text-sm">Dari skala individu hingga korporasi</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {segments.map((s, i) => (
            <div
              key={s.label}
              className={`bg-white/5 border border-white/8 rounded-2xl px-5 py-6 text-center hover:bg-white/10 hover:border-brand/30 transition-all duration-300 group reveal reveal-delay-${(i % 3) + 1} ${visible ? 'visible' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3.5 group-hover:bg-brand/20 transition-colors">
                <div className="w-5 h-5">{segmentIcons[i]}</div>
              </div>
              <div className="font-bold text-white text-sm mb-1 font-[family-name:var(--font-display)]">{s.label}</div>
              <div className="text-white/40 text-[11px]">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Choose ─────────────────────────────────────────────────────────
function WhyChooseSection() {
  const { ref, visible } = useReveal();

  const reasons = [
    { title: 'Stok Lengkap', desc: 'Berbagai jenis dan ukuran besi tersedia sehingga Anda tidak perlu mencari ke banyak tempat.' },
    { title: 'Harga Kompetitif', desc: 'Penawaran harga yang bersaing untuk pembelian satuan maupun volume besar.' },
    { title: 'Pelayanan Responsif', desc: 'Tim kami siap merespons pertanyaan dan permintaan penawaran dengan cepat via WhatsApp.' },
    { title: 'Lokasi Strategis', desc: 'Berlokasi di Tambun Selatan, mudah diakses dari Bekasi, Cikarang, dan sekitarnya.' },
    { title: 'Konsultasi Material', desc: 'Membantu Anda memilih material yang tepat sesuai kebutuhan dan anggaran proyek.' },
    { title: 'Semua Skala Dilayani', desc: 'Dari pembelian satu batang hingga kebutuhan proyek berskala besar, semua dilayani.' },
  ];

  return (
    <section className="py-20 bg-warm-white" aria-labelledby="why-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Keunggulan</span>
            </div>
            <h2 id="why-heading" className="text-3xl lg:text-4xl font-extrabold text-graphite mb-4 font-[family-name:var(--font-display)]">
              Mengapa Memilih<br />Mahameru Baja?
            </h2>
            <p className="text-steel-grey text-sm leading-relaxed mb-8">
              Kami berkomitmen memberikan produk berkualitas dengan pelayanan terbaik untuk mendukung keberhasilan proyek konstruksi Anda.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/produk"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
              >
                Lihat Produk <ArrowIcon />
              </Link>
              <Link
                to="/kontak"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-graphite text-graphite font-bold text-sm rounded-xl hover:bg-graphite hover:text-white transition-all"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className={`flex items-start gap-3.5 bg-white border border-light-steel rounded-xl p-4 hover:border-brand/30 hover:shadow-sm transition-all duration-200 reveal reveal-delay-${Math.min(i + 1, 5)} ${visible ? 'visible' : ''}`}
              >
                <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon />
                </div>
                <div>
                  <div className="font-bold text-sm text-graphite mb-0.5 font-[family-name:var(--font-display)]">{r.title}</div>
                  <div className="text-xs text-steel-grey leading-relaxed">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── About CTA ─────────────────────────────────────────────────────────
function AboutCTA() {
  return (
    <section className="py-20 bg-graphite relative overflow-hidden" aria-label="Call to action">
      <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand/8 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-6 h-px bg-brand" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">Mulai Berkolaborasi</span>
          <span className="w-6 h-px bg-brand" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4 font-[family-name:var(--font-display)]">
          Siap Berkonsultasi tentang<br />Kebutuhan Material?
        </h2>
        <p className="text-white/55 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Hubungi tim Mahameru Baja dan dapatkan informasi harga serta ketersediaan material untuk proyek Anda.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/minta-penawaran"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30"
          >
            Minta Penawaran <ArrowIcon />
          </Link>
          <a
            href="https://wa.me/6281218052017"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
          >
            <WAIcon /> Chat WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <MotionController />
      <PageHero />
      <BusinessUnits />
      <StatsSection />
      <AboutIntro />
      <WhatWeDoSection />
      <CustomerSegmentsSection />
      <WhyChooseSection />
      <AboutCTA />
    </>
  );
}
