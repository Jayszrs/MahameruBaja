import { useState } from 'react';
import { Link } from 'react-router';
import { useReveal } from '../hooks/useReveal';
import { laserImage } from '../data/business';

const filters = ['Semua', 'Laser Cutting & Bending', 'Fabrikasi & Ereksion', 'Retail', 'Mesin', 'Produk', 'Warehouse', 'Pengiriman', 'Proyek', 'Aktivitas'];

const galleryItems = [
  { id: 11, src: laserImage, category: 'Laser Cutting & Bending', title: 'Ilustrasi cutting plat logam, bukan hasil pengerjaan aktual', span: 'col-span-2' },
  { id: 12, src: laserImage, category: 'Mesin', title: 'Ilustrasi mesin — kapasitas fasilitas menunggu verifikasi', span: '' },
  { id: 13, src: 'https://images.unsplash.com/photo-1504387508099-cece71a87e17?w=800&h=600&fit=crop&auto=format', category: 'Fabrikasi & Ereksion', title: 'Placeholder dokumentasi fabrikasi dan ereksion', span: '' },
  { id: 14, src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&auto=format', category: 'Retail', title: 'Placeholder dokumentasi retail', span: '' },
  { id: 1, src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&auto=format', category: 'Warehouse', title: 'Gudang Material Utama', span: 'col-span-2 row-span-2' },
  { id: 2, src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format', category: 'Produk', title: 'Stok Besi Beton', span: '' },
  { id: 3, src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop&auto=format', category: 'Produk', title: 'Profil Baja Struktural', span: '' },
  { id: 4, src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop&auto=format', category: 'Proyek', title: 'Material di Proyek', span: '' },
  { id: 5, src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop&auto=format', category: 'Proyek', title: 'Konstruksi Bangunan', span: '' },
  { id: 6, src: 'https://images.unsplash.com/photo-1504387508099-cece71a87e17?w=800&h=600&fit=crop&auto=format', category: 'Aktivitas', title: 'Proses Fabrikasi', span: 'col-span-2' },
  { id: 7, src: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop&auto=format', category: 'Produk', title: 'Material Baja', span: '' },
  { id: 8, src: 'https://images.unsplash.com/photo-1565814636199-ae8d05eedcd7?w=600&h=400&fit=crop&auto=format', category: 'Produk', title: 'Stok Pipa Besi', span: '' },
  { id: 9, src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=800&fit=crop&auto=format', category: 'Warehouse', title: 'Area Penyimpanan', span: 'row-span-2' },
  { id: 10, src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format', category: 'Pengiriman', title: 'Siap Dikirim', span: '' },
  { id: 11, src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop&auto=format', category: 'Pengiriman', title: 'Distribusi Material', span: '' },
  { id: 12, src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop&auto=format', category: 'Proyek', title: 'Proyek Bekasi', span: 'col-span-2' },
];

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [lightbox, setLightbox] = useState<typeof galleryItems[0] | null>(null);
  const { ref, visible } = useReveal();

  const filtered = activeFilter === 'Semua'
    ? galleryItems
    : galleryItems.filter(i => i.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 bg-graphite relative overflow-hidden" aria-labelledby="projects-hero-heading">
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&h=600&fit=crop&auto=format"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/80 to-graphite" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white/70">Proyek & Galeri</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-accent">Galeri</span>
          </div>
          <h1 id="projects-hero-heading" className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Proyek & Galeri<br />Mahameru Baja
          </h1>
          <p className="text-white/60 max-w-lg text-base">
            Galeri ilustrasi untuk kategori material, laser cutting, bending, fabrikasi dan proyek. Semua foto di halaman ini adalah placeholder, bukan bukti stok, fasilitas atau proyek nyata.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface" aria-labelledby="gallery-heading">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          {/* Filter bar */}
          <div ref={ref} className={`flex items-center gap-2 mb-8 overflow-x-auto pb-1 reveal ${visible ? 'visible' : ''}`}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === f
                    ? 'bg-graphite text-white'
                    : 'bg-white border border-rule text-muted hover:text-graphite hover:border-steel/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
            {filtered.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setLightbox(item)}
                aria-label={`Lihat gambar: ${item.title}`}
                className={`group relative rounded-xl overflow-hidden bg-graphite cursor-zoom-in transition-all hover:shadow-xl ${item.span}`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-graphite/0 group-hover:bg-graphite/40 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] font-bold tracking-wide uppercase text-accent">{item.category}</span>
                    <div className="text-white text-sm font-bold">{item.title}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted">Tidak ada gambar untuk kategori ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-ink/92 flex flex-col items-center justify-center p-4 lightbox-overlay"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.src.replace('w=600', 'w=1200').replace('w=800', 'w=1400')}
              alt={lightbox.title}
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-wide uppercase text-accent">{lightbox.category}</div>
                <div className="text-white font-bold">{lightbox.title}</div>
              </div>
              <button
                onClick={() => setLightbox(null)}
                aria-label="Tutup"
                className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-14 bg-accent" aria-label="CTA Proyek">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Butuh material untuk proyek Anda?</h2>
          <p className="text-white/80 mb-5 max-w-sm mx-auto">Konsultasikan kebutuhan material dengan tim Mahameru Baja.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/minta-penawaran" className="px-5 py-2.5 bg-white text-accent font-bold text-sm rounded-lg hover:bg-surface transition-colors">
              Minta Penawaran
            </Link>
            <Link to="/produk" className="px-5 py-2.5 border border-white/40 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors">
              Lihat Produk
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
