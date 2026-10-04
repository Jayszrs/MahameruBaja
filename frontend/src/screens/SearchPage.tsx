"use client";

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { searchProducts } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const q = searchParams.get('q') || '';
  const results = q.trim().length > 0 ? searchProducts(q) : [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  }

  const suggestions = ['Besi Beton', 'Hollow Galvanis', 'Besi WF', 'Plat Besi', 'Wiremesh', 'Pipa'];

  return (
    <>
      <section className="pt-32 pb-10 bg-graphite relative overflow-hidden" aria-labelledby="search-hero-heading">
        <div className="simple-hero-media" data-parallax="0.24" aria-hidden="true"><img src="/images/steel-indonesia/wiremesh.jpg" alt="" /></div>
        <div className="simple-hero-shade" aria-hidden="true" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white/70">Pencarian</span>
          </nav>
          <h1 id="search-hero-heading" className="text-2xl font-extrabold text-white mb-5">
            {q ? `Hasil pencarian untuk "${q}"` : 'Cari Produk'}
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari besi, ukuran, kategori..."
                aria-label="Cari produk"
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent/60 transition-all"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-accent hover:bg-accent-dark text-white font-bold text-sm rounded-xl transition-colors">
              Cari
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-10">
        {/laser|cutting|bending|fabrikasi/i.test(q) && <Link to="/laser-cutting" className="block bg-white border border-brand p-6 mb-8"><span className="industrial-eyebrow text-brand">LAYANAN TERKAIT</span><h2 className="text-xl mt-2">Jasa Laser Cutting & CNC Bending</h2><p className="text-sm text-muted mt-2">Cutting plat, komponen custom, fabrikasi dan request gambar teknik. Jelajahi layanan →</p></Link>}
        {!q && (
          <div>
            <p className="text-sm text-muted mb-3 font-medium">Coba cari:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setQuery(s); setSearchParams({ q: s }); }}
                  className="px-4 py-2 bg-white border border-rule text-graphite text-sm font-semibold rounded-full hover:bg-surface hover:border-steel/40 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {q && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-graphite mb-2">Produk tidak ditemukan</h2>
            <p className="text-muted text-sm mb-5 max-w-sm mx-auto">
              Tidak ada produk yang cocok dengan "{q}". Coba kata kunci lain atau hubungi kami langsung.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/produk" className="px-5 py-2.5 bg-graphite text-white text-sm font-semibold rounded-lg hover:bg-navy transition-colors">
                Lihat Semua Produk
              </Link>
              <a href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20mencari%20produk%20tertentu%20yang%20tidak%20saya%20temukan%20di%20website."
                target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#20b858] transition-colors">
                Tanya via WhatsApp
              </a>
            </div>
          </div>
        )}

        {q && results.length > 0 && (
          <>
            <p className="text-sm text-muted mb-6">
              Ditemukan <span className="font-bold text-graphite">{results.length}</span> produk untuk "{q}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
