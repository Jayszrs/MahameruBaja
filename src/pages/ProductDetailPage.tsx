import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router';
import { getProductBySlug, getRelatedProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useReveal } from '../hooks/useReveal';
import { useQuotation } from '../context/QuotationContext';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug ?? '');
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'spesifikasi' | 'deskripsi' | 'penggunaan' | 'pengiriman'>('spesifikasi');
  const [qty, setQty] = useState(1);
  const { ref, visible } = useReveal();
  const { addItem, hasItem, setOpen: setQuotationOpen } = useQuotation();

  if (!product) return <Navigate to="/produk" replace />;

  const related = getRelatedProducts(product);
  const added = hasItem(product.id);

  const waMessage = encodeURIComponent(
    `Halo Mahameru Baja, saya ingin menanyakan produk *${product.name}* (${product.sku ?? product.id}).\nSpesifikasi: ${product.shortSpec}\n\nApakah bisa dibantu informasi harga dan ketersediaannya?`
  );

  function handleAddToQuotation() {
    addItem({
      id: product!.id,
      slug: product!.slug,
      name: product!.name,
      sku: product!.sku ?? product!.id,
      shortSpec: product!.shortSpec,
      image: product!.image,
    });
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-light-steel">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-steel-grey flex-wrap">
            <Link to="/" className="hover:text-graphite transition-colors">Beranda</Link>
            <span>/</span>
            <Link to="/produk" className="hover:text-graphite transition-colors">Produk</Link>
            <span>/</span>
            <Link to={`/produk?kategori=${product.categorySlug}`} className="hover:text-graphite transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-graphite font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-surface-2 mb-3 relative">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badges?.map(badge => (
                  <span key={badge} className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded font-[family-name:var(--font-mono)] ${badge === 'READY STOCK' ? 'bg-positive text-white' : badge === 'BARU' ? 'bg-brand text-white' : 'bg-gunmetal text-white'}`}>
                    {badge === 'READY STOCK' ? 'STOK: KONFIRMASI' : `CONTOH ${badge}`}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} aria-label={`Gambar ${i + 1}`}
                  className={`w-16 h-16 rounded-lg overflow-hidden bg-surface-2 border-2 transition-all ${activeImage === i ? 'border-brand' : 'border-transparent hover:border-light-steel'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Link to={`/produk?kategori=${product.categorySlug}`}
                className="text-xs font-semibold tracking-wide uppercase text-steel-grey hover:text-graphite transition-colors bg-surface-2 px-2.5 py-1 rounded-full">
                {product.category}
              </Link>
              <span className={`text-xs font-semibold flex items-center gap-1 ${product.available ? 'text-positive' : 'text-steel-grey'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-positive' : 'bg-steel-grey'}`} />
                Stok belum diverifikasi
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-graphite leading-tight mb-2 font-[family-name:var(--font-display)]">
              {product.name}
            </h1>

            {/* SKU */}
            <div className="text-xs font-[family-name:var(--font-mono)] text-steel-grey mb-1">
              SKU: {product.sku ?? product.id}
            </div>
            <div className="text-sm font-[family-name:var(--font-mono)] text-steel-grey mb-4">
              {product.shortSpec}
            </div>

            <p className="text-sm text-steel-grey leading-relaxed mb-5">{product.description}</p>

            {/* Price info */}
            <div className="bg-warm-white border border-light-steel rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <svg className="shrink-0 text-brand mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <div>
                  <p className="text-sm font-semibold text-graphite">Harga sesuai kesepakatan</p>
                  <p className="text-xs text-steel-grey mt-0.5">Hubungi kami untuk penawaran harga terbaik sesuai kebutuhan dan volume pembelian Anda.</p>
                </div>
              </div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-3 mb-5">
              <label className="text-sm font-semibold text-graphite">Jumlah:</label>
              <div className="flex items-center border border-light-steel rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Kurangi" className="w-9 h-9 flex items-center justify-center text-steel-grey hover:text-graphite hover:bg-warm-white transition-colors font-bold">−</button>
                <span className="px-4 text-sm font-bold text-graphite min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} aria-label="Tambah" className="w-9 h-9 flex items-center justify-center text-steel-grey hover:text-graphite hover:bg-warm-white transition-colors font-bold">+</button>
              </div>
              <span className="text-sm text-steel-grey">batang</span>
            </div>

            {/* CTA buttons */}
            <div className="space-y-2.5 mb-5">
              <button
                onClick={handleAddToQuotation}
                className={`flex items-center justify-center gap-2.5 w-full py-3.5 font-bold rounded-xl transition-all hover:-translate-y-0.5 ${
                  added
                    ? 'bg-positive/10 text-positive border-2 border-positive/30'
                    : 'bg-brand hover:bg-brand-dark text-white hover:shadow-lg hover:shadow-brand/20'
                }`}
              >
                {added ? (
                  <><CheckIcon /> Ditambahkan ke Penawaran</>
                ) : (
                  <><ListIcon /> Tambah ke Daftar Penawaran</>
                )}
              </button>
              {added && (
                <button onClick={() => setQuotationOpen(true)} className="flex items-center justify-center w-full py-3 border border-light-steel text-graphite hover:bg-warm-white font-semibold text-sm rounded-xl transition-colors">
                  Lihat Daftar Penawaran →
                </button>
              )}
              <a
                href={`https://wa.me/6281218052017?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <WAIcon /> Minta Harga via WhatsApp
              </a>
              <Link to="/minta-penawaran" className="flex items-center justify-center w-full py-3 border-2 border-graphite text-graphite hover:bg-graphite hover:text-white font-bold rounded-xl transition-all text-sm">
                Minta Penawaran Formal
              </Link>
            </div>

            {/* Quick specs */}
            <div className="border-t border-light-steel pt-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {product.specifications.slice(0, 4).map(spec => (
                  <div key={spec.label}>
                    <div className="text-[11px] text-steel-grey uppercase tracking-wide">{spec.label}</div>
                    <div className="text-sm font-semibold text-graphite font-[family-name:var(--font-mono)]">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex border-b border-light-steel gap-0 mb-6 overflow-x-auto">
            {(['spesifikasi', 'deskripsi', 'penggunaan', 'pengiriman'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-sm font-semibold shrink-0 transition-colors ${activeTab === tab ? 'text-graphite' : 'text-steel-grey hover:text-graphite'}`}
              >
                {tab === 'spesifikasi' ? 'Spesifikasi' : tab === 'deskripsi' ? 'Deskripsi' : tab === 'penggunaan' ? 'Penggunaan' : 'Info Pengiriman'}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />}
              </button>
            ))}
          </div>

          {activeTab === 'spesifikasi' && (
            <div className="max-w-2xl">
              <p className="verification-note !mt-0 !mb-5">Data dan foto katalog adalah contoh. Ukuran, sertifikasi, spesifikasi, harga dan stok harus dikonfirmasi sebelum pemesanan.</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-light-steel/60">
                  {product.specifications.map(spec => (
                    <tr key={spec.label} className="hover:bg-warm-white transition-colors">
                      <td className="py-3 pr-6 font-medium text-steel-grey w-40">{spec.label}</td>
                      <td className="py-3 text-graphite font-semibold font-[family-name:var(--font-mono)]">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'deskripsi' && (
            <div className="max-w-2xl"><p className="text-steel-grey leading-relaxed text-sm">{product.description}</p></div>
          )}
          {activeTab === 'penggunaan' && (
            <div className="max-w-2xl">
              <p className="text-sm text-steel-grey mb-3 font-medium">Produk ini cocok digunakan untuk:</p>
              <ul className="space-y-2">
                {product.usages.map(u => (
                  <li key={u} className="flex items-center gap-2.5 text-sm text-graphite">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />{u}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'pengiriman' && (
            <div className="max-w-2xl space-y-4">
              <div className="p-4 bg-warm-white rounded-xl border border-light-steel">
                <h3 className="font-bold text-graphite text-sm mb-2">Layanan Pengiriman</h3>
                <p className="text-sm text-steel-grey leading-relaxed">Kami melayani pengiriman material ke area Bekasi dan sekitarnya. Jadwal dan biaya pengiriman disesuaikan berdasarkan lokasi tujuan, jenis material, dan volume pesanan.</p>
              </div>
              <div className="p-4 bg-warm-white rounded-xl border border-light-steel">
                <h3 className="font-bold text-graphite text-sm mb-2">Area Pengiriman</h3>
                <div className="flex flex-wrap gap-2 text-sm text-steel-grey">
                  {['Tambun', 'Cibitung', 'Cikarang', 'Bekasi Kota', 'Bekasi Utara', 'Bekasi Selatan', 'Bekasi Barat', 'Bekasi Timur'].map(a => (
                    <span key={a} className="px-2.5 py-1 bg-surface-2 rounded-full text-xs border border-light-steel">{a}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-warm-white rounded-xl border border-light-steel">
                <h3 className="font-bold text-graphite text-sm mb-1">Tanya Pengiriman</h3>
                <p className="text-sm text-steel-grey mb-3">Hubungi kami untuk informasi biaya dan estimasi pengiriman ke lokasi Anda.</p>
                <a href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20menanyakan%20pengiriman%20material." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white font-bold text-sm rounded-lg">
                  <WAIcon /> Tanya via WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Help banner */}
        <div className="bg-graphite rounded-2xl p-6 lg:p-8 mb-16 flex flex-col sm:flex-row items-center gap-6">
          <div className="sm:flex-1">
            <h3 className="text-lg font-extrabold text-white mb-1 font-[family-name:var(--font-display)]">Butuh Bantuan Memilih?</h3>
            <p className="text-white/60 text-sm">Tim kami siap membantu menentukan spesifikasi yang tepat sesuai kebutuhan proyek Anda.</p>
          </div>
          <a
            href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20butuh%20bantuan%20memilih%20material%20untuk%20proyek%20saya."
            target="_blank" rel="noopener noreferrer"
            className="shrink-0 px-5 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5"
          >
            Konsultasi Gratis →
          </a>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-graphite font-[family-name:var(--font-display)]">Produk Sejenis</h2>
              <Link to={`/produk?kategori=${product.categorySlug}`} className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-1">
                Lihat Semua
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={{ ...p, sku: p.sku ?? 'MB-???', badges: p.badges }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-light-steel p-3 flex gap-2 shadow-lg">
        <button
          onClick={handleAddToQuotation}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${added ? 'bg-positive/10 text-positive border border-positive/30' : 'bg-brand text-white'}`}
        >
          {added ? '✓ Ditambahkan' : '+ Penawaran'}
        </button>
        <a
          href={`https://wa.me/6281218052017?text=${waMessage}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-3 text-sm font-bold bg-[#25D366] text-white rounded-xl text-center"
        >
          Chat WA
        </a>
      </div>
    </>
  );
}

function WAIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>; }
function ListIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; }
function CheckIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>; }
