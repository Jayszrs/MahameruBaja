import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { products, type Product } from '../data/products';
import ProductCard from '../components/ProductCard';

const categoryFilters = [
  { slug: 'besi-beton', label: 'Besi Beton' },
  { slug: 'besi-wf', label: 'WF Beam / H-Beam' },
  { slug: 'besi-hollow', label: 'Besi Hollow' },
  { slug: 'pipa-besi', label: 'Pipa Besi' },
  { slug: 'besi-siku', label: 'Besi Siku' },
  { slug: 'wiremesh', label: 'Wiremesh' },
  { slug: 'plat-besi', label: 'Plat Besi' },
  { slug: 'bondek', label: 'Bondek' },
  { slug: 'spandek', label: 'Spandek' },
  { slug: 'baja-ringan', label: 'Baja Ringan' },
];

const sortOptions = [
  { value: 'default', label: 'Urutan Default' },
  { value: 'name-asc', label: 'Nama A-Z' },
  { value: 'name-desc', label: 'Nama Z-A' },
];

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  const initialKategori = searchParams.get('kategori') ?? '';
  const initialQ = searchParams.get('q') ?? searchParams.get('search') ?? '';

  const [activeCategories, setActiveCategories] = useState<string[]>(
    initialKategori ? [initialKategori] : []
  );
  const [searchQ, setSearchQ] = useState(initialQ);
  const [availability, setAvailability] = useState<'all' | 'ready'>('all');

  // Sync URL params
  useEffect(() => {
    const k = searchParams.get('kategori');
    if (k && !activeCategories.includes(k)) setActiveCategories([k]);
  }, [searchParams]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  function toggleCategory(slug: string) {
    setPage(1);
    setActiveCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  }

  function clearFilters() {
    setActiveCategories([]);
    setSearchQ('');
    setAvailability('all');
    setPage(1);
    setSearchParams({});
  }

  // Filter and sort
  let filtered: Product[] = products;

  if (searchQ.trim()) {
    const q = searchQ.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.shortSpec.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  if (activeCategories.length > 0) {
    filtered = filtered.filter(p => activeCategories.includes(p.categorySlug));
  }

  if (availability === 'ready') {
    filtered = filtered.filter(p => p.available);
  }

  if (sort === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = activeCategories.length > 0 || searchQ.trim() || availability !== 'all';

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Search in sidebar */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-steel-grey mb-2">Cari Produk</label>
        <input
          type="search"
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setPage(1); }}
          placeholder="Nama, spesifikasi, SKU..."
          className="w-full px-3 py-2.5 text-sm border border-light-steel rounded-xl focus:outline-none focus:border-graphite/50 bg-warm-white placeholder-light-steel text-graphite"
        />
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wide text-steel-grey">Kategori</label>
          {activeCategories.length > 0 && (
            <button onClick={() => setActiveCategories([])} className="text-[10px] text-brand font-semibold">Reset</button>
          )}
        </div>
        <div className="space-y-1.5">
          {categoryFilters.map(cat => (
            <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="w-4 h-4 accent-brand rounded"
              />
              <span className={`text-sm transition-colors ${activeCategories.includes(cat.slug) ? 'text-brand font-semibold' : 'text-graphite group-hover:text-brand'}`}>
                {cat.label}
              </span>
              <span className="ml-auto text-[11px] text-light-steel">
                {products.filter(p => p.categorySlug === cat.slug).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-steel-grey mb-2.5">Ketersediaan</label>
        <div className="space-y-1.5">
          {[{ value: 'all', label: 'Semua Produk' }, { value: 'ready', label: 'Ready Stock' }].map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value={opt.value}
                checked={availability === opt.value}
                onChange={() => { setAvailability(opt.value as 'all' | 'ready'); setPage(1); }}
                className="w-4 h-4 accent-brand"
              />
              <span className={`text-sm ${availability === opt.value ? 'text-brand font-semibold' : 'text-graphite group-hover:text-brand'}`}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button onClick={clearFilters} className="w-full py-2.5 text-sm font-bold text-steel-grey border border-light-steel rounded-xl hover:border-brand hover:text-brand transition-colors">
          Hapus Semua Filter
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-graphite pt-4 pb-10 relative overflow-hidden" aria-labelledby="products-hero">
        <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white/70">Produk</span>
          </nav>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand">Katalog Material</span>
          </div>
          <h1 id="products-hero" className="text-3xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-display)]">
            Katalog Produk Mahameru Baja
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            {products.length} produk tersedia — besi beton, WF, hollow, pipa, plat, dan lebih.
          </p>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-[280px] shrink-0" aria-label="Filter produk">
            <div className="sticky top-[120px] bg-white border border-light-steel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-graphite font-[family-name:var(--font-display)]">Filter</span>
                {hasFilters && (
                  <span className="text-xs px-2 py-0.5 bg-brand text-white rounded-full font-bold">
                    {activeCategories.length + (searchQ.trim() ? 1 : 0) + (availability !== 'all' ? 1 : 0)}
                  </span>
                )}
              </div>
              <SidebarContent />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-light-steel rounded-lg text-sm font-semibold text-graphite hover:border-graphite/40 transition-colors"
                >
                  <FilterIcon /> Filter {hasFilters && <span className="w-4 h-4 bg-brand text-white text-[10px] rounded-full flex items-center justify-center font-bold">{activeCategories.length + (searchQ.trim() ? 1 : 0)}</span>}
                </button>
                <p className="text-sm text-steel-grey">
                  <span className="font-bold text-graphite">{filtered.length}</span> produk
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs text-steel-grey hidden sm:block">Urutkan:</label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-sm border border-light-steel rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-graphite/50 text-graphite"
                >
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Applied filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeCategories.map(slug => {
                  const cat = categoryFilters.find(c => c.slug === slug);
                  return (
                    <span key={slug} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/8 text-brand text-xs font-semibold rounded-full border border-brand/20">
                      {cat?.label ?? slug}
                      <button onClick={() => toggleCategory(slug)} aria-label={`Hapus filter ${cat?.label}`} className="hover:text-brand-dark">×</button>
                    </span>
                  );
                })}
                {searchQ.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-steel-grey/10 text-steel-grey text-xs font-semibold rounded-full border border-steel-grey/20">
                    "{searchQ}"
                    <button onClick={() => { setSearchQ(''); setPage(1); }} aria-label="Hapus pencarian" className="hover:text-graphite">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid */}
            {paged.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {paged.map(p => (
                  <ProductCard key={p.id} product={{ ...p, sku: p.sku ?? 'MB-???', badges: p.badges }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <p className="font-bold text-graphite mb-1">Produk tidak ditemukan</p>
                <p className="text-sm text-steel-grey mb-5">Coba ubah filter atau kata kunci pencarian Anda.</p>
                <button onClick={clearFilters} className="px-5 py-2.5 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-colors">
                  Hapus Filter
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm border border-light-steel rounded-lg text-steel-grey hover:border-graphite/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman sebelumnya"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 text-sm rounded-lg font-semibold transition-colors ${n === page ? 'bg-brand text-white' : 'border border-light-steel text-steel-grey hover:border-graphite/40'}`}
                    aria-label={`Halaman ${n}`}
                    aria-current={n === page ? 'page' : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm border border-light-steel rounded-lg text-steel-grey hover:border-graphite/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman berikutnya"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog" aria-label="Filter produk">
          <div className="absolute inset-0 bg-gunmetal/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col sheet-enter">
            <div className="flex items-center justify-between px-5 py-4 border-b border-light-steel">
              <span className="font-bold text-graphite">Filter Produk</span>
              <button onClick={() => setSidebarOpen(false)} aria-label="Tutup filter" className="p-2 text-steel-grey">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <SidebarContent />
            </div>
            <div className="p-4 border-t border-light-steel">
              <button onClick={() => setSidebarOpen(false)} className="w-full py-3 bg-brand text-white font-bold text-sm rounded-xl">
                Terapkan Filter ({filtered.length} produk)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" /></svg>;
}
