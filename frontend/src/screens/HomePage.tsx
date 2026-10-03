"use client";

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useReveal, useScrollY, useCounter } from '../hooks/useReveal';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import LaserSpotlight from '../components/LaserSpotlight';
import BusinessUnits from '../components/BusinessUnits';

// ── SVG Icon atoms ─────────────────────────────────────────────────────
function ArrowIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}
function SearchIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function WAIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>;
}
function CatalogIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
}
function QuoteIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
}
function DocIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
function SpreadsheetIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="12" y1="3" x2="12" y2="21" /></svg>;
}
function ImageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}
function ChatIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
}
function LocationPinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function StarIcon({ filled = true }: { filled?: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

// ── Hero ─────────────────────────────────────────────────────────────
function HeroSection() {
  const scrollY = useScrollY();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { ref, visible } = useReveal(0.01);
  const countJ = useCounter(22, 1600, visible);
  const countP = useCounter(500, 2000, visible);
  const countT = useCounter(10, 1400, visible);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/cari?q=${encodeURIComponent(query.trim())}`);
  }

  const popular = ['WF Beam', 'Besi Beton', 'Hollow', 'Wiremesh', 'Bondek'];

  return (
    // Negative top margin pulls the hero UNDER the fixed transparent navbar
    <section
      className="relative bg-gunmetal overflow-hidden -mt-[7.75rem] lg:-mt-[8.5rem]"
      style={{ minHeight: '92vh' }}
      aria-labelledby="hero-heading"
    >
      {/* Parallax background layers */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{ transform: `translateY(${scrollY * 0.22}px)`, willChange: 'transform' }}
        aria-hidden="true"
      >
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=1080&fit=crop&auto=format&q=80"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Blueprint grid layer */}
      <div className="absolute inset-0 texture-blueprint opacity-60" aria-hidden="true" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gunmetal via-gunmetal/88 to-gunmetal/30" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-gunmetal/90 via-transparent to-gunmetal/40" aria-hidden="true" />

      {/* Accent glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand/6 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full bg-brand/4 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Content — pt compensates for fixed navbar (7.75rem mobile / 8.5rem desktop) + breathing room */}
      <div
        ref={ref}
        className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 pt-[10.75rem] lg:pt-[12.5rem] pb-20 flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16"
      >

        {/* Left: headline + CTAs */}
        <div className={`flex-1 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2.5 mb-6">
            <span className="h-px w-8 bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-brand font-[family-name:var(--font-mono)]">
              Toko Besi & Supplier Baja · Bekasi
            </span>
          </div>

          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-white leading-[1.06] mb-5 font-[family-name:var(--font-display)]">
            Material Baja untuk<br />
            Proyek yang{' '}
            <span className="text-brand relative inline-block">
              Lebih Kuat.
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-brand/30 rounded-full" />
            </span>
          </h1>

          <p className="text-white/58 text-base lg:text-[1.0625rem] leading-relaxed max-w-[520px] mb-8">
            Solusi kebutuhan besi dan material baja untuk konstruksi, workshop,
            fabrikasi, dan renovasi di Bekasi dan sekitarnya.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              to="/produk"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/25 font-[family-name:var(--font-display)]"
            >
              Jelajahi Produk <ArrowIcon />
            </Link>
            <Link
              to="/minta-penawaran"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-bold text-sm rounded-xl hover:bg-white/6 transition-all duration-200"
            >
              Minta Penawaran
            </Link>
            <a
              href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#25D366]/12 border border-[#25D366]/25 text-[#4ADE80] font-semibold text-sm rounded-xl hover:bg-[#25D366]/22 transition-all duration-200"
            >
              <WAIcon /> Chat WA
            </a>
          </div>

          {/* Animated stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { num: countJ, suffix: '+', label: 'Jenis Produk' },
              { num: countP, suffix: '+', label: 'Pelanggan Puas' },
              { num: countT, suffix: '+', label: 'Tahun Beroperasi' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-white font-[family-name:var(--font-display)] tabular-nums">
                  {s.num}{s.suffix}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: search panel */}
        <div className={`lg:w-[400px] shrink-0 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/30">
            <p className="text-white/85 font-semibold text-sm mb-3 font-[family-name:var(--font-display)]">
              Cari Kebutuhan Material
            </p>
            <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border border-white/15 bg-white/5 mb-4 focus-within:border-brand/40 transition-colors">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari WF 200, besi beton 10mm..."
                className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder-white/30 focus:outline-none"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-4 bg-brand hover:bg-brand-dark text-white transition-colors shrink-0 font-bold"
                aria-label="Cari produk"
              >
                <SearchIcon />
              </button>
            </form>

            <div>
              <p className="text-[11px] text-white/35 mb-2.5 font-semibold tracking-[0.12em] uppercase">Pencarian Populer</p>
              <div className="flex flex-wrap gap-1.5">
                {popular.map(p => (
                  <button
                    key={p}
                    onClick={() => navigate(`/cari?q=${encodeURIComponent(p)}`)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-white/6 hover:bg-brand/20 hover:text-brand text-white/65 border border-white/8 hover:border-brand/30 rounded-lg transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-2">
              <Link
                to="/produk"
                className="flex items-center gap-2 p-3 rounded-xl bg-white/4 hover:bg-white/10 transition-colors text-xs text-white/65 font-medium hover:text-white"
              >
                <span className="text-brand"><CatalogIcon /></span>
                Katalog Produk
              </Link>
              <Link
                to="/minta-penawaran"
                className="flex items-center gap-2 p-3 rounded-xl bg-white/4 hover:bg-white/10 transition-colors text-xs text-white/65 font-medium hover:text-white"
              >
                <span className="text-brand"><QuoteIcon /></span>
                Minta Penawaran
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warm-white/90 to-transparent" aria-hidden="true" />
    </section>
  );
}

// ── Trust Strip ──────────────────────────────────────────────────────
const trustItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
    label: 'Material Beragam',
    sub: 'Besi, WF, hollow & lebih',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
    ),
    label: 'Retail & Proyek',
    sub: 'Satuan & volume besar',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
    ),
    label: 'Konsultasi Gratis',
    sub: 'Tim siap via WhatsApp',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
    ),
    label: 'Pengiriman Material',
    sub: 'Ke lokasi proyek Anda',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    label: 'Pemesanan Mudah',
    sub: 'Penawaran cepat & tepat',
  },
];

function TrustStrip() {
  return (
    <section className="bg-graphite border-b border-white/6 py-4">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {trustItems.map(item => (
            <div key={item.label} className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 shrink-0 text-brand" aria-hidden="true">
                {item.icon}
              </div>
              <div>
                <div className="text-white text-xs font-bold leading-tight">{item.label}</div>
                <div className="text-white/38 text-[10px] hidden sm:block mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Category Grid ─────────────────────────────────────────────────────
const catData = [
  { slug: 'besi-beton', name: 'Besi Beton', count: 4, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format' },
  { slug: 'besi-wf', name: 'WF Beam', count: 2, img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop&auto=format' },
  { slug: 'besi-hollow', name: 'Hollow', count: 3, img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop&auto=format' },
  { slug: 'wiremesh', name: 'Wiremesh', count: 2, img: 'https://images.unsplash.com/photo-1565814636199-ae8d05eedcd7?w=400&h=300&fit=crop&auto=format' },
  { slug: 'pipa-besi', name: 'Pipa Besi', count: 3, img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format' },
  { slug: 'besi-siku', name: 'Besi Siku', count: 2, img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&auto=format' },
  { slug: 'plat-besi', name: 'Plat Besi', count: 2, img: 'https://images.unsplash.com/photo-1504387508099-cece71a87e17?w=400&h=300&fit=crop&auto=format' },
  { slug: 'bondek', name: 'Bondek', count: 1, img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&auto=format' },
  { slug: 'spandek', name: 'Spandek', count: 1, img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format' },
  { slug: 'baja-ringan', name: 'Baja Ringan', count: 2, img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&auto=format' },
  { slug: 'besi-unp', name: 'UNP', count: 1, img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop&auto=format' },
  { slug: 'h-beam', name: 'H-Beam', count: 1, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format' },
];

function CategorySection() {
  const { ref, visible } = useReveal();
  return (
    <section className="py-16 bg-warm-white" aria-labelledby="cat-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`flex items-end justify-between mb-8 reveal ${visible ? 'visible' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Kategori</span>
            </div>
            <h2 id="cat-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
              Cari Berdasarkan Kategori
            </h2>
            <p className="text-steel-grey mt-1 text-sm">Temukan material sesuai kebutuhan konstruksi Anda.</p>
          </div>
          <Link to="/produk" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark transition-colors">
            Semua Produk <ArrowIcon />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {catData.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/produk?kategori=${cat.slug}`}
              className={`group relative rounded-xl overflow-hidden bg-graphite aspect-[4/3] block reveal reveal-delay-${Math.min(i % 6 + 1, 5)} ${visible ? 'visible' : ''}`}
            >
              <img
                src={cat.img}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover opacity-45 transition-all duration-500 group-hover:opacity-65 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gunmetal/95 via-gunmetal/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="text-white font-bold text-[11px] font-[family-name:var(--font-display)] leading-tight">{cat.name}</div>
                <div className="text-white/45 text-[10px]">{cat.count} produk</div>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand/35 rounded-xl transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Popular Products ──────────────────────────────────────────────────
const ptabs = ['Semua', 'Besi Beton', 'Besi WF / H-Beam', 'Besi Hollow', 'Wiremesh'];

function PopularProductsSection() {
  const { ref, visible } = useReveal();
  const [activeTab, setActiveTab] = useState('Semua');
  const filtered = activeTab === 'Semua' ? products.filter(p => p.isPopular) : products.filter(p => p.category === activeTab).slice(0, 8);
  const display = filtered.slice(0, 8);
  return (
    <section className="py-16 bg-surface-2" aria-labelledby="popular-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-px bg-brand" />
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Populer</span>
              </div>
              <h2 id="popular-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
                Produk Paling Dicari
              </h2>
            </div>
            <Link to="/produk" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark transition-colors">
              Lihat Semua <ArrowIcon />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {ptabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-brand text-white shadow-md shadow-brand/20' : 'bg-white border border-light-steel text-steel-grey hover:text-graphite hover:border-graphite/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {display.map((p, i) => (
            <div key={p.id} className={`reveal reveal-delay-${Math.min(i + 1, 5)} ${visible ? 'visible' : ''}`}>
              <ProductCard product={{ ...p, sku: p.sku ?? 'MB-???', badges: p.badges }} />
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/produk"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-graphite text-graphite font-bold text-sm rounded-xl hover:bg-graphite hover:text-white transition-all duration-200"
          >
            Lihat Semua Produk <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Shop by Project ───────────────────────────────────────────────────
const projectTypes = [
  { title: 'Bangun Rumah', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&h=700&fit=crop&auto=format', materials: ['Besi Beton', 'WF Beam', 'Hollow', 'Wiremesh'] },
  { title: 'Renovasi', img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500&h=700&fit=crop&auto=format', materials: ['Hollow', 'Besi Siku', 'Plat Besi', 'Bondek'] },
  { title: 'Gudang & Workshop', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&h=700&fit=crop&auto=format', materials: ['WF Beam', 'H-Beam', 'CNP', 'Spandek'] },
  { title: 'Ruko & Komersial', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=700&fit=crop&auto=format', materials: ['WF Beam', 'Besi Beton', 'Wiremesh', 'Bondek'] },
];

function ShopByProjectSection() {
  const { ref, visible } = useReveal();
  return (
    <section className="py-16 bg-warm-white" aria-labelledby="by-project-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-10 reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Solusi Proyek</span>
            <span className="w-6 h-px bg-brand" />
          </div>
          <h2 id="by-project-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
            Butuh Material untuk Apa?
          </h2>
          <p className="text-steel-grey mt-1.5 text-sm">Temukan material yang tepat sesuai jenis proyek Anda.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projectTypes.map((pt, i) => (
            <Link
              key={pt.title}
              to={`/produk?q=${encodeURIComponent(pt.materials[0])}`}
              className={`group relative rounded-2xl overflow-hidden bg-graphite block reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={pt.img}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-38 transition-all duration-700 group-hover:opacity-52 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gunmetal/98 via-gunmetal/45 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-extrabold text-lg mb-2.5 font-[family-name:var(--font-display)] leading-tight">{pt.title}</h3>
                <div className="flex flex-wrap gap-1 mb-3.5">
                  {pt.materials.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 bg-white/8 text-white/65 rounded-full border border-white/10">{m}</span>
                  ))}
                </div>
                <span className="flex items-center gap-1.5 text-brand text-xs font-bold group-hover:gap-2.5 transition-all">
                  Lihat Material <ArrowIcon size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Advantage ─────────────────────────────────────────────────────────
function AdvantageSection() {
  const { ref, visible } = useReveal();
  const advs = [
    { num: '01', title: 'Produk Beragam', desc: 'Pilihan material lengkap dari besi beton, WF beam, hollow, hingga plat dan atap.' },
    { num: '02', title: 'Pilihan Spesifikasi', desc: 'Berbagai ukuran, ketebalan, dan tipe material tersedia untuk setiap kebutuhan.' },
    { num: '03', title: 'Konsultasi Gratis', desc: 'Tim kami siap membantu menentukan material tepat untuk proyek Anda via WhatsApp.' },
    { num: '04', title: 'Pemesanan Mudah', desc: 'Ajukan penawaran langsung atau hubungi via WhatsApp tanpa prosedur rumit.' },
    { num: '05', title: 'Pengiriman Material', desc: 'Layanan pengiriman ke lokasi proyek di area Bekasi dan sekitarnya.' },
  ];
  return (
    <section className="py-20 bg-graphite overflow-hidden relative" aria-labelledby="adv-heading">
      <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Mengapa Mahameru</span>
            </div>
            <h2 id="adv-heading" className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.08] font-[family-name:var(--font-display)]">
              Material Tepat.<br />
              <span className="text-brand">Proyek Lebih</span><br />
              Mantap.
            </h2>
            <p className="text-white/45 mt-5 max-w-sm text-sm leading-relaxed">
              Pengalaman bertahun-tahun menjadi mitra material terpercaya untuk berbagai proyek di Bekasi.
            </p>
            <Link
              to="/tentang-kami"
              className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30"
            >
              Tentang Kami <ArrowIcon />
            </Link>
          </div>
          <div className="space-y-5">
            {advs.map((adv, i) => (
              <div
                key={adv.num}
                className={`flex gap-4 group reveal reveal-delay-${Math.min(i + 1, 5)} ${visible ? 'visible' : ''}`}
              >
                <div className="text-brand font-extrabold text-xs font-[family-name:var(--font-mono)] opacity-55 shrink-0 w-8 pt-0.5">{adv.num}</div>
                <div className="flex-1 pb-5 border-b border-white/8 last:border-0">
                  <div className="text-white font-bold text-sm mb-0.5 font-[family-name:var(--font-display)]">{adv.title}</div>
                  <div className="text-white/40 text-sm leading-relaxed">{adv.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Featured Category (WF Beam) ────────────────────────────────────────
function FeaturedCategorySection() {
  const { ref, visible } = useReveal();
  const dims = ['WF 150×75', 'WF 200×100', 'WF 250×125', 'WF 300×150'];
  return (
    <section className="py-20 bg-warm-white overflow-hidden" aria-labelledby="featured-cat-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="relative rounded-3xl bg-graphite overflow-hidden">
          <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div ref={ref} className={`reveal ${visible ? 'visible' : ''} hidden lg:block`}>
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&h=500&fit=crop&auto=format"
                alt="WF Beam material struktural"
                className="w-full h-full object-cover opacity-55 rounded-tl-3xl rounded-bl-3xl"
              />
            </div>
            <div className={`p-10 lg:p-14 flex flex-col justify-center reveal ${visible ? 'visible' : ''}`}>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand mb-3 font-[family-name:var(--font-mono)]">Kategori Unggulan</div>
              <h2 id="featured-cat-heading" className="text-3xl lg:text-4xl font-extrabold text-white mb-3 font-[family-name:var(--font-display)]">WF Beam</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-7">
                Material struktur untuk bangunan lebih kokoh. Pilihan WF dari dimensi ringan hingga berat untuk berbagai aplikasi konstruksi.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {dims.map(d => (
                  <Link
                    key={d}
                    to={`/cari?q=${encodeURIComponent(d.split('×')[0])}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 hover:bg-brand/15 border border-white/8 hover:border-brand/30 rounded-xl text-xs text-white/65 hover:text-white transition-all duration-200"
                  >
                    <span className="text-brand font-bold text-sm">→</span>
                    <span className="font-[family-name:var(--font-mono)]">{d}</span>
                  </Link>
                ))}
              </div>
              <Link
                to="/produk?kategori=besi-wf"
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
              >
                Lihat Semua WF <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── New Arrivals ──────────────────────────────────────────────────────
function NewArrivalsSection() {
  const { ref, visible } = useReveal();
  const newItems = products.filter(p => p.isNew).slice(0, 4);
  if (newItems.length === 0) return null;
  return (
    <section className="py-16 bg-surface-2" aria-labelledby="new-arrivals-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`flex items-end justify-between mb-8 reveal ${visible ? 'visible' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Terbaru</span>
            </div>
            <h2 id="new-arrivals-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
              Produk Terbaru
            </h2>
          </div>
          <Link to="/produk" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark transition-colors">
            Lihat Semua <ArrowIcon />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {newItems.map((p, i) => (
            <div key={p.id} className={`reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}>
              <ProductCard product={{ ...p, sku: p.sku ?? 'MB-???', badges: p.badges }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Project Supply B2B CTA ─────────────────────────────────────────────
const docFormats = [
  { icon: <DocIcon />, label: 'PDF', desc: 'Dokumen penawaran / RAB' },
  { icon: <SpreadsheetIcon />, label: 'XLSX / CSV', desc: 'Spreadsheet BOQ' },
  { icon: <ImageIcon />, label: 'JPG / PNG', desc: 'Foto daftar material' },
  { icon: <ChatIcon />, label: 'WhatsApp', desc: 'Ketik langsung ke WA kami' },
];

function ProjectSupplyCTA() {
  const { ref, visible } = useReveal();
  return (
    <section className="py-20 bg-brand relative overflow-hidden" aria-labelledby="b2b-cta-heading">
      <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/55 mb-3 font-[family-name:var(--font-mono)]">Supply Proyek</div>
            <h2 id="b2b-cta-heading" className="text-3xl lg:text-4xl font-extrabold text-white mb-3 font-[family-name:var(--font-display)]">
              Punya Daftar Material<br />untuk Proyek?
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-7 max-w-md">
              Kirim kebutuhan material atau BOQ Anda. Tim Mahameru Baja akan membantu menyiapkan penawaran sesuai produk, spesifikasi, dan jumlah.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/minta-penawaran"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-brand font-bold text-sm rounded-xl hover:bg-warm-white transition-colors"
              >
                Minta Penawaran <ArrowIcon />
              </Link>
              <a
                href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20punya%20daftar%20material%20proyek."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/12 border border-white/25 text-white font-bold text-sm rounded-xl hover:bg-white/22 transition-colors"
              >
                <WAIcon /> WhatsApp Tim
              </a>
            </div>
          </div>
          <div className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 space-y-3.5">
              <p className="text-white font-bold text-sm mb-4 font-[family-name:var(--font-display)]">Format yang diterima:</p>
              {docFormats.map(f => (
                <div key={f.label} className="flex items-center gap-3.5 text-sm">
                  <span className="text-white/70 shrink-0">{f.icon}</span>
                  <div>
                    <span className="text-white font-semibold">{f.label}</span>
                    <span className="text-white/50 ml-2 text-xs">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How to Order ──────────────────────────────────────────────────────
function HowToOrderSection() {
  const { ref, visible } = useReveal();
  const steps = [
    { num: '01', title: 'Cari Produk', desc: 'Gunakan pencarian atau jelajahi kategori.' },
    { num: '02', title: 'Pilih Spesifikasi', desc: 'Tentukan ukuran, tebal, dan jumlah.' },
    { num: '03', title: 'Tambah ke Penawaran', desc: 'Klik tombol + Penawaran di kartu produk.' },
    { num: '04', title: 'Kirim Permintaan', desc: 'Submit via form atau langsung ke WhatsApp.' },
    { num: '05', title: 'Konfirmasi WA', desc: 'Tim kami konfirmasi harga & ketersediaan.' },
    { num: '06', title: 'Pengiriman', desc: 'Material dikirim atau siap diambil.' },
  ];
  return (
    <section className="py-20 bg-warm-white" aria-labelledby="howto-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-14 reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Cara Pesan</span>
            <span className="w-6 h-px bg-brand" />
          </div>
          <h2 id="howto-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
            Cara Memesan Material
          </h2>
        </div>
        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-6 left-[8.33%] right-[8.33%] h-px bg-light-steel" aria-hidden="true" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <div key={step.num} className={`text-center relative reveal reveal-delay-${Math.min(i + 1, 5)} ${visible ? 'visible' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-graphite border-2 border-warm-white ring-2 ring-light-steel flex items-center justify-center mx-auto mb-4 relative z-10 transition-all hover:ring-brand/40 hover:bg-brand">
                  <span className="text-brand font-extrabold text-xs font-[family-name:var(--font-mono)] group-hover:text-white">{step.num}</span>
                </div>
                <h3 className="font-bold text-xs text-graphite mb-1.5 font-[family-name:var(--font-display)]">{step.title}</h3>
                <p className="text-[11px] text-steel-grey leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────
function GallerySection() {
  const { ref, visible } = useReveal();
  const imgs = [
    { src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&auto=format', alt: 'Gudang material', span: 'col-span-2 row-span-2' },
    { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format', alt: 'Stok besi beton' },
    { src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop&auto=format', alt: 'WF Beam' },
    { src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&auto=format', alt: 'Proyek konstruksi' },
    { src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format', alt: 'Distribusi material' },
    { src: 'https://images.unsplash.com/photo-1565814636199-ae8d05eedcd7?w=400&h=300&fit=crop&auto=format', alt: 'Pipa besi' },
  ];
  return (
    <section className="py-16 bg-graphite" aria-labelledby="gallery-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`flex items-end justify-between mb-8 reveal ${visible ? 'visible' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Galeri</span>
            </div>
            <h2 id="gallery-heading" className="text-2xl lg:text-3xl font-extrabold text-white font-[family-name:var(--font-display)]">
              Material untuk Berbagai Kebutuhan
            </h2>
          </div>
          <Link to="/proyek" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark transition-colors">
            Lihat Galeri <ArrowIcon />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] gap-3">
          {imgs.map(img => (
            <div key={img.src} className={`rounded-xl overflow-hidden bg-gunmetal ${img.span ?? ''}`}>
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover opacity-65 hover:opacity-90 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials (horizontal scroll carousel) ──────────────────────────
const testimonials = ['Kebutuhan retail', 'Pengadaan proyek', 'Laser cutting', 'CNC bending'].map((role, index) => ({
  name: 'Contoh pelanggan ' + (index + 1),
  role,
  company: 'Placeholder, bukan pelanggan nyata',
  rating: 0,
  text: 'Ruang untuk ulasan pelanggan terverifikasi. Testimoni hanya akan ditampilkan setelah persetujuan pelanggan dan verifikasi pengelola.',
}));

function TestimonialsSection() {
  const { ref, visible } = useReveal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => { el.removeEventListener('scroll', updateArrows); window.removeEventListener('resize', updateArrows); };
  }, []);

  return (
    <section className="py-16 bg-warm-white overflow-hidden" aria-labelledby="testi-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`flex items-end justify-between mb-8 reveal ${visible ? 'visible' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Testimoni</span>
            </div>
            <h2 id="testi-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
Ruang Cerita Pelanggan
            </h2>
          </div>
          {/* Scroll arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              aria-label="Geser ke kiri"
              className="w-9 h-9 rounded-full border border-light-steel flex items-center justify-center text-steel-grey hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              aria-label="Geser ke kanan"
              className="w-9 h-9 rounded-full border border-light-steel flex items-center justify-center text-steel-grey hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="shrink-0 w-[300px] sm:w-[340px] bg-white rounded-2xl border border-light-steel/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4 text-[#F59E0B]">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} filled={i < t.rating} />
                ))}
              </div>
              <p className="text-sm text-graphite leading-relaxed mb-5 line-clamp-4">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-graphite flex items-center justify-center text-brand font-extrabold text-sm font-[family-name:var(--font-display)]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-graphite font-[family-name:var(--font-display)]">{t.name}</div>
                  <div className="text-[10px] text-steel-grey">{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Client Logos Marquee ──────────────────────────────────────────────
const clientLogos = ['LOGO KLIEN 01', 'LOGO KLIEN 02', 'LOGO KLIEN 03', 'LOGO KLIEN 04', 'LOGO KLIEN 05', 'LOGO KLIEN 06'];

function ClientLogosSection() {
  const { ref, visible } = useReveal();
  // Duplicate for infinite loop
  const doubled = [...clientLogos, ...clientLogos];
  return (
    <section className="py-10 bg-surface-2 border-y border-light-steel overflow-hidden" aria-labelledby="clients-heading">
      <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
        <div className="text-center mb-6 px-6">
          <p id="clients-heading" className="text-[11px] font-bold tracking-[0.2em] uppercase text-steel-grey">Placeholder logo klien · bukan klaim kemitraan</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {doubled.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="shrink-0 h-12 px-6 rounded-xl bg-white border border-light-steel flex items-center justify-center min-w-[160px]"
              >
                <span className="text-xs font-bold text-steel-grey tracking-wide">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-[10px] text-light-steel mt-4 px-6">Logo klien dapat dikelola melalui CMS · Tambahkan logo resmi sesuai persetujuan</p>
      </div>
    </section>
  );
}

// ── Delivery Area ─────────────────────────────────────────────────────
function DeliverySection() {
  const { ref, visible } = useReveal();
  const areas = ['Tambun', 'Cibitung', 'Cikarang', 'Bekasi Kota', 'Bekasi Utara', 'Bekasi Selatan', 'Bekasi Barat', 'Bekasi Timur', 'Karawang'];
  return (
    <section className="py-16 bg-warm-white" aria-labelledby="delivery-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Jangkauan Pengiriman</span>
            </div>
            <h2 id="delivery-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite mb-3 font-[family-name:var(--font-display)]">
              Pengiriman Material<br />Bekasi & Sekitarnya
            </h2>
            <p className="text-steel-grey text-sm leading-relaxed mb-6">
              Kami melayani pengiriman ke berbagai wilayah di Bekasi. Hubungi kami untuk biaya dan jadwal pengiriman ke lokasi Anda.
            </p>
            <div className="flex flex-wrap gap-2 mb-7">
              {areas.map(a => (
                <span key={a} className="text-xs font-semibold px-3 py-1.5 bg-surface-2 text-graphite rounded-lg border border-light-steel hover:border-brand/40 transition-colors">
                  {a}
                </span>
              ))}
            </div>
            <a
              href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20menanyakan%20pengiriman%20material."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
            >
              <WAIcon /> Cek Pengiriman via WA
            </a>
          </div>
          <div className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="rounded-2xl overflow-hidden bg-graphite aspect-[4/3] relative">
              <img
                src="https://images.unsplash.com/photo-1569163140049-6a58e2e16e99?w=700&h=500&fit=crop&auto=format"
                alt="Wilayah pengiriman Bekasi"
                className="w-full h-full object-cover opacity-38"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gunmetal/60 to-transparent" />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                  <LocationPinIcon /> Tambun Selatan, Bekasi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Blog ──────────────────────────────────────────────────────────────
function BlogSection() {
  const { ref, visible } = useReveal();
  const arts = [
    { slug: 'perbedaan-wf-h-beam', title: 'Perbedaan WF dan H-Beam: Mana yang Tepat untuk Proyek Anda?', cat: 'Panduan Material', date: '15 Sep 2025', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop&auto=format' },
    { slug: 'ukuran-besi-beton', title: 'Cara Memilih Ukuran Besi Beton yang Tepat untuk Konstruksi Rumah', cat: 'Tips Konstruksi', date: '10 Sep 2025', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format' },
    { slug: 'jenis-besi-hollow', title: 'Jenis Besi Hollow dan Penggunaannya dalam Konstruksi Modern', cat: 'Panduan Material', date: '5 Sep 2025', img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop&auto=format' },
  ];
  return (
    <section className="py-16 bg-surface-2" aria-labelledby="blog-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`flex items-end justify-between mb-8 reveal ${visible ? 'visible' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-px bg-brand" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Panduan Material</span>
            </div>
            <h2 id="blog-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
              Artikel & Panduan
            </h2>
          </div>
          <Link to="/informasi" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark transition-colors">
            Semua Artikel <ArrowIcon />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {arts.map((art, i) => (
            <Link
              key={art.slug}
              to={`/informasi/${art.slug}`}
              className={`group bg-white rounded-2xl overflow-hidden border border-light-steel/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}
            >
              <div className="aspect-video overflow-hidden bg-surface-2 relative">
                <img
                  src={art.img}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold tracking-wide uppercase bg-white/90 text-brand px-2 py-1 rounded-md">{art.cat}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] text-steel-grey mb-2">{art.date}</p>
                <h3 className="text-sm font-bold text-graphite leading-snug group-hover:text-brand transition-colors line-clamp-2 font-[family-name:var(--font-display)] mb-3">
                  {art.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand group-hover:gap-2.5 transition-all">
                  Baca Selengkapnya <ArrowIcon size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Apakah Mahameru melayani pembelian satuan?', a: 'Ya, kami melayani pembelian satuan tanpa minimum order untuk renovasi rumah, perbaikan, dan proyek kecil.' },
  { q: 'Bagaimana cara cek harga material?', a: 'Hubungi kami via WhatsApp di +62 812-1805-2017 atau kirim permintaan penawaran melalui halaman Minta Penawaran.' },
  { q: 'Apakah produk tersedia dalam beberapa ukuran?', a: 'Sebagian besar produk tersedia dalam berbagai ukuran dan spesifikasi. Lihat detail produk di katalog atau tanyakan via WhatsApp.' },
  { q: 'Apakah bisa melakukan pemesanan untuk proyek besar?', a: 'Ya, kami melayani pemesanan volume besar untuk proyek. Kirimkan BOQ atau daftar kebutuhan untuk mendapatkan penawaran khusus.' },
  { q: 'Apakah tersedia layanan pengiriman?', a: 'Kami menyediakan layanan pengiriman ke area Bekasi dan sekitarnya. Biaya dan jadwal disesuaikan dengan lokasi dan volume pesanan.' },
];

function FAQSection() {
  const { ref, visible } = useReveal();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-16 bg-warm-white" aria-labelledby="faq-heading">
      <div className="max-w-[760px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-10 reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">FAQ</span>
            <span className="w-6 h-px bg-brand" />
          </div>
          <h2 id="faq-heading" className="text-2xl lg:text-3xl font-extrabold text-graphite font-[family-name:var(--font-display)]">
            Pertanyaan Umum
          </h2>
        </div>
        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <div key={i} className={`reveal reveal-delay-${Math.min(i + 1, 5)} ${visible ? 'visible' : ''}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 bg-white text-left transition-all duration-200 ${open === i ? 'rounded-t-xl border border-light-steel border-b-transparent' : 'rounded-xl border border-light-steel hover:border-graphite/25 hover:shadow-sm'}`}
              >
                <span className="text-sm font-semibold text-graphite pr-2">{faq.q}</span>
                <span className={`text-steel-grey transition-transform duration-300 shrink-0 ${open === i ? 'rotate-45' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-5 py-4 bg-white rounded-b-xl border-x border-b border-light-steel -mt-px">
                  <p className="text-sm text-steel-grey leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────
function FinalCTA() {
  const { ref, visible } = useReveal();
  return (
    <section className="py-24 bg-gunmetal relative overflow-hidden" aria-labelledby="final-cta-heading">
      <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand/6 animate-glow pointer-events-none blur-2xl" aria-hidden="true" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">Mulai Sekarang</span>
            <span className="w-8 h-px bg-brand" />
          </div>
          <h2 id="final-cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 font-[family-name:var(--font-display)]">
            Sudah Tahu Material<br />yang Anda Butuhkan?
          </h2>
          <p className="text-white/50 max-w-md mx-auto mb-9 text-sm lg:text-base leading-relaxed">
            Kirim kebutuhan Anda dan dapatkan informasi produk serta penawaran dari tim Mahameru Baja.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/minta-penawaran"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30 font-[family-name:var(--font-display)]"
            >
              Minta Penawaran <ArrowIcon />
            </Link>
            <a
              href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20butuh%20informasi%20material."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
            >
              <WAIcon /> Chat WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Export ────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <LaserSpotlight />
      <BusinessUnits />
      <TrustStrip />
      <CategorySection />
      <PopularProductsSection />
      <ShopByProjectSection />
      <AdvantageSection />
      <FeaturedCategorySection />
      <NewArrivalsSection />
      <ProjectSupplyCTA />
      <HowToOrderSection />
      <GallerySection />
      <TestimonialsSection />
      <ClientLogosSection />
      <DeliverySection />
      <BlogSection />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
