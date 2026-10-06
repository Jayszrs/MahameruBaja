"use client";

import type { ReactNode } from 'react';
import { Link, useParams, Navigate } from 'react-router';
import { getArticleBySlug, articles } from '../data/articles';
import { useReveal } from '../hooks/useReveal';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug ?? '');
  const { ref, visible } = useReveal();

  if (!article) return <Navigate to="/informasi" replace />;

  const related = articles.filter(a => a.id !== article.id).slice(0, 3);

  function renderContent(content: string) {
    const lines = content.trim().split('\n');
    const elements: ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) { i++; continue; }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-extrabold text-graphite mt-8 mb-3">{line.slice(3)}</h2>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={i} className="font-bold text-graphite mb-2">{line.slice(2, -2)}</p>);
      } else if (line.startsWith('- ')) {
        const items = [line];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
          i++;
          items.push(lines[i].trim());
        }
        elements.push(
          <ul key={i} className="list-none space-y-1.5 mb-4">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                <span dangerouslySetInnerHTML={{ __html: item.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </li>
            ))}
          </ul>
        );
      } else if (line.startsWith('|')) {
        const rows = [line];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
          i++;
          rows.push(lines[i].trim());
        }
        const headers = rows[0].split('|').filter(Boolean).map(h => h.trim());
        const dataRows = rows.slice(2).map(r => r.split('|').filter(Boolean).map(c => c.trim()));
        elements.push(
          <div key={i} className="overflow-x-auto mb-5">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  {headers.map((h, j) => <th key={j} className="px-3 py-2 text-left font-semibold text-graphite border border-rule">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, j) => (
                  <tr key={j} className="hover:bg-surface transition-colors">
                    {row.map((cell, k) => <td key={k} className="px-3 py-2 text-muted border border-rule">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else {
        elements.push(
          <p key={i} className="text-sm text-muted leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-graphite">$1</strong>') }}
          />
        );
      }
      i++;
    }
    return elements;
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-0 bg-graphite" aria-labelledby="article-heading">
        <div className="max-w-[800px] mx-auto px-6 pb-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
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
            <span>•</span>
            <span>Mahameru Baja</span>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <div className="relative bg-graphite">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="rounded-md overflow-hidden aspect-video bg-graphite -mb-8">
            <img src={article.image} alt={article.title} className="auto-parallax w-full h-full object-cover opacity-90" data-parallax="0.08" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-surface py-16">
        <div className="max-w-[800px] mx-auto px-6">
          <article className="bg-white rounded-md p-6 lg:p-10 border border-rule mb-10">
            <p className="text-base text-muted leading-relaxed mb-6 font-medium">{article.excerpt}</p>
            <hr className="border-rule mb-6" />
            <div>{renderContent(article.content)}</div>
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
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
    </>
  );
}
