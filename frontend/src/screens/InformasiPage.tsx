"use client";

import { Link } from 'react-router';
import { articles } from '../data/articles';
import { useReveal } from '../hooks/useReveal';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function InformasiPage() {
  const { ref, visible } = useReveal();

  return (
    <>
      {/* Hero */}
      <section className="bg-graphite relative overflow-hidden" aria-labelledby="informasi-hero-heading">
        <div className="simple-hero-media" data-parallax="0.27" aria-hidden="true"><img src="/images/hero-steel-warehouse-v2.png" alt="" /></div>
        <div className="simple-hero-shade" aria-hidden="true" />
        <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 pt-8 pb-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/38 mb-5">
            <Link to="/" className="hover:text-white/65 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white/60">Artikel</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-px bg-brand" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand">Panduan & Edukasi</span>
          </div>
          <h1 id="informasi-hero-heading" className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3 font-[family-name:var(--font-display)]">
            Artikel & Panduan Material
          </h1>
          <p className="text-white/50 max-w-lg text-sm leading-relaxed">
            Panduan teknis seputar material baja, tips memilih besi yang tepat, dan edukasi konstruksi untuk proyek Anda.
          </p>
          <small className="simple-visual-note">Visual ilustrasi material</small>
        </div>
      </section>

      {/* Articles */}
      <section className="py-14 bg-warm-white" aria-labelledby="articles-heading">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <h2 id="articles-heading" className="sr-only">Daftar Artikel</h2>

          {/* Featured article */}
          <div ref={ref} className={`mb-10 reveal ${visible ? 'visible' : ''}`}>
            <Link
              to={`/informasi/${articles[0].slug}`}
              className="group grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white border border-light-steel/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-brand/25"
            >
              <div className="lg:col-span-3 aspect-video lg:aspect-auto bg-graphite overflow-hidden">
                <img src={articles[0].image} alt={articles[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-brand bg-brand/8 px-2.5 py-1 rounded-md">
                    {articles[0].category}
                  </span>
                  <span className="text-xs text-steel-grey">{articles[0].readTime}</span>
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold text-graphite leading-tight mb-3 group-hover:text-brand transition-colors font-[family-name:var(--font-display)]">
                  {articles[0].title}
                </h3>
                <p className="text-sm text-steel-grey leading-relaxed mb-5 line-clamp-3">{articles[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-steel-grey">{formatDate(articles[0].date)}</span>
                  <span className="text-sm font-bold text-brand flex items-center gap-1.5 group-hover:gap-3 transition-all">
                    Baca Selengkapnya
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Article grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.slice(1).map((article, i) => (
              <Link
                key={article.id}
                to={`/informasi/${article.slug}`}
                className={`group bg-white border border-light-steel/80 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal reveal-delay-${(i % 3) + 1} ${visible ? 'visible' : ''}`}
              >
                <div className="aspect-video overflow-hidden bg-surface-2 relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold tracking-wide uppercase bg-white/92 text-brand px-2 py-1 rounded-md">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[11px] text-steel-grey mb-2">{formatDate(article.date)} · {article.readTime}</p>
                  <h3 className="font-bold text-graphite text-sm leading-snug mb-2.5 group-hover:text-brand transition-colors line-clamp-2 font-[family-name:var(--font-display)]">
                    {article.title}
                  </h3>
                  <p className="text-xs text-steel-grey leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand group-hover:gap-2.5 transition-all">
                    Baca Selengkapnya
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to product */}
      <section className="py-14 bg-graphite relative overflow-hidden" aria-label="CTA ke produk">
        <div className="absolute inset-0 texture-blueprint" aria-hidden="true" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-xl lg:text-2xl font-extrabold text-white mb-3 font-[family-name:var(--font-display)]">
            Butuh material yang dibahas di sini?
          </h2>
          <p className="text-white/55 mb-6 text-sm">Mahameru Baja menyediakan semua material yang dibahas dalam panduan ini.</p>
          <Link
            to="/produk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30"
          >
            Lihat Katalog Produk
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </>
  );
}
