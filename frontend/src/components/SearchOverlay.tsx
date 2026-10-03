"use client";

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { searchProducts, products } from '../data/products';

const suggestions = ['WF Beam', 'Besi Beton', 'Hollow Galvanis', 'Wiremesh', 'Pipa Besi', 'Plat Besi', 'Baja Ringan', 'Bondek'];

const quickCategories = [
  { slug: 'besi-beton', label: 'Besi Beton' },
  { slug: 'besi-wf', label: 'WF Beam' },
  { slug: 'besi-hollow', label: 'Hollow' },
  { slug: 'wiremesh', label: 'Wiremesh' },
  { slug: 'pipa-besi', label: 'Pipa Besi' },
  { slug: 'bondek', label: 'Bondek' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = query.trim().length > 1 ? searchProducts(query).slice(0, 8) : [];
  const categoryHits = query.trim().length > 1
    ? [...new Set(products.filter(p => p.category.toLowerCase().includes(query.toLowerCase())).map(p => p.category))].slice(0, 4)
    : [];

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else setQuery('');
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  function submit(q?: string) {
    const searchTerm = q ?? query;
    if (searchTerm.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Pencarian produk">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gunmetal/70 backdrop-blur-sm" onClick={onClose} />

      {/* Search panel */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-light-steel overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-light-steel">
            <svg width="18" height="18" className="text-steel-grey shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Cari besi beton, WF 200, hollow 4×4..."
              className="flex-1 text-sm text-graphite bg-transparent focus:outline-none placeholder-light-steel"
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Hapus pencarian" className="text-light-steel hover:text-steel-grey transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
            <button onClick={onClose} aria-label="Tutup pencarian" className="text-steel-grey hover:text-graphite transition-colors p-1">
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.trim().length > 1 ? (
              <>
                {/* Product results */}
                {results.length > 0 && (
                  <div className="p-3">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-steel-grey px-2 mb-2">Produk</p>
                    {results.map(p => (
                      <Link
                        key={p.id}
                        to={`/produk/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm-white transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-graphite group-hover:text-brand transition-colors truncate">{p.name}</div>
                          <div className="text-xs font-[family-name:var(--font-mono)] text-steel-grey">{p.sku ?? ''} · {p.shortSpec}</div>
                        </div>
                        <svg width="12" height="12" className="text-light-steel group-hover:text-brand transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Category results */}
                {categoryHits.length > 0 && (
                  <div className="px-3 pb-3 border-t border-light-steel/50 pt-3">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-steel-grey px-2 mb-2">Kategori</p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {categoryHits.map(cat => {
                        const catSlug = results.find(p => p.category === cat)?.categorySlug ?? '';
                        return (
                          <Link
                            key={cat}
                            to={`/produk?kategori=${catSlug}`}
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-semibold bg-warm-white text-graphite rounded-lg border border-light-steel hover:border-brand hover:text-brand transition-colors"
                          >
                            {cat}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {results.length === 0 && categoryHits.length === 0 && (
                  <div className="text-center py-10 px-6">
                    <div className="text-3xl mb-3">🔍</div>
                    <p className="text-sm font-semibold text-graphite mb-1">Tidak ditemukan</p>
                    <p className="text-xs text-steel-grey">Coba kata kunci berbeda atau lihat semua produk.</p>
                  </div>
                )}

                {/* Search all */}
                {results.length > 0 && (
                  <div className="border-t border-light-steel p-3">
                    <button
                      onClick={() => submit()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-brand hover:bg-brand/8 rounded-xl transition-colors"
                    >
                      Cari semua hasil untuk "{query}" →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4">
                {/* Suggestions */}
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-steel-grey mb-3">Pencarian Populer</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="px-3 py-1.5 text-xs font-semibold bg-warm-white text-graphite rounded-lg border border-light-steel hover:border-brand hover:text-brand transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Quick categories */}
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-steel-grey mb-3">Kategori Cepat</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickCategories.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/produk?kategori=${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-center py-2.5 text-xs font-bold text-steel-grey bg-warm-white rounded-xl border border-light-steel hover:border-brand hover:text-brand transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
