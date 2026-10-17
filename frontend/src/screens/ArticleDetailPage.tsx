"use client";
import PublicText from "../components/PublicText";
import Image from "../components/CmsImage";

import type { Article } from '../data/articles';
import ArticleContent from '../components/ArticleContent';
import { Link } from 'react-router';

import { useReveal } from '../hooks/useReveal';
import ShareArticle from '../components/ShareArticle';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
}

export default function ArticleDetailPage({ article, related }: { article: Article; related: Article[] }) {
  const { ref, visible } = useReveal();

  return (
    <PublicText><div className="article-reading-page" data-static-motion>
      {/* Hero */}
      <section className="article-detail-hero article-editorial-hero" aria-labelledby="article-heading">
        <div className="article-editorial-visual"><Image src={article.image} alt={article.imageAlt || article.title} fill sizes="100vw" loading="eager" fetchPriority="high"/></div>
        <div className="article-editorial-shade" aria-hidden="true"/>
        <div className="article-editorial-heading">
          <nav aria-label="Breadcrumb" className="article-detail-breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link to="/informasi" className="hover:text-white transition-colors">Informasi</Link>
            <span>/</span>
            <span className="text-white/70 truncate max-w-[160px]">{article.title}</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold tracking-wide uppercase text-accent bg-accent/15 px-2.5 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-white/40 text-xs">{article.readTime}</span>
          </div>
          <h1 id="article-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-white/40 text-xs">
            <span>{formatDate(article.date)}</span>
            <span>&bull;</span>
            <span>Mahameru Baja</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="bg-surface py-16">
        <div className="max-w-[800px] mx-auto px-6">
          <article className="article-reading-body bg-white rounded-md p-6 lg:p-10 border border-rule mb-10">
            <p className="text-base text-muted leading-relaxed mb-6 font-medium">{article.excerpt}</p>
            <hr className="border-rule mb-6" />
            <ArticleContent content={article.content} />
          </article>

          {/* CTA card */}
          <div ref={ref} className={`bg-navy rounded-md p-6 mb-10 reveal ${visible ? 'visible' : ''}`}>
            <h3 className="text-lg font-extrabold text-white mb-2">Butuh material yang dibahas di artikel ini?</h3>
            <p className="text-white/60 text-sm mb-4">Tim Mahameru Baja siap membantu Anda mendapatkan material yang tepat sesuai spesifikasi proyek.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20membaca%20artikel%20di%20website%20dan%20ingin%20berkonsultasi%20tentang%20material."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-white font-bold text-sm rounded-lg transition-colors"
              >
                Konsultasi via WhatsApp
              </a>
              <Link to="/produk" className="px-4 py-2 border border-white/30 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors">
                Lihat Produk
              </Link>
            </div>
          </div>

          {/* Back link */}
          <ShareArticle title={article.title} />
          <Link to="/informasi" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-graphite transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Kembali ke Informasi
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-14 bg-white border-t border-rule" aria-labelledby="related-articles-heading">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <h2 id="related-articles-heading" className="text-xl font-extrabold text-graphite mb-6">Artikel Lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map(a => (
                <Link key={a.id} to={`/informasi/${a.slug}`}
                  className="group bg-surface border border-rule rounded-md overflow-hidden transition-colors hover:border-graphite/40">
                  <div className="aspect-video overflow-hidden bg-graphite">
                    <Image src={a.image} alt={a.title} width={600} height={338} sizes="(max-width:640px) 100vw, 33vw" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-accent mb-1.5">{a.category}</div>
                    <h3 className="text-sm font-bold text-graphite line-clamp-2 group-hover:text-steel transition-colors">{a.title}</h3>
                    <p className="text-xs text-muted mt-1">{formatDate(a.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div></PublicText>
  );
}
