"use client";

import { Link } from 'react-router';
import { useState } from 'react';
import { useQuotation } from '../context/QuotationContext';

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  shortSpec: string;
  image: string;
  available: boolean;
  badges?: Array<'READY STOCK' | 'BARU' | 'POPULAR'>;
}

interface ProductCardProps {
  product: ProductCardData;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem, hasItem, setOpen } = useQuotation();
  const added = hasItem(product.id);
  const [saved, setSaved] = useState(false);

  function handleAddToQuotation(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      shortSpec: product.shortSpec,
      image: product.image,
    });
  }

  return (
    <article className="product-card group relative bg-white rounded-xl border border-light-steel/70 overflow-hidden flex flex-col">
      {/* Image */}
      <Link to={`/produk/${product.slug}`} className="block relative overflow-hidden bg-surface-2 aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="card-img w-full h-full object-cover"
          loading="lazy"
        />
        {/* Badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.badges?.map(badge => (
            <span
              key={badge}
              className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded font-[family-name:var(--font-mono)] ${
                badge === 'READY STOCK' ? 'bg-positive text-white' :
                badge === 'BARU' ? 'bg-brand text-white' :
                'bg-gunmetal text-white'
              }`}
            >
              {badge === 'READY STOCK' ? 'STOK: KONFIRMASI' : `CONTOH ${badge}`}
            </span>
          ))}
          {!product.available && (
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded bg-steel-grey/80 text-white font-[family-name:var(--font-mono)]">
              HUBUNGI KAMI
            </span>
          )}
        </div>

        {/* Quick actions on hover */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={event => { event.preventDefault(); event.stopPropagation(); setSaved(value => !value); }}
            aria-label={saved ? 'Batalkan simpan produk' : 'Simpan produk sementara'}
            aria-pressed={saved}
            className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-steel-grey hover:text-brand transition-colors"
          >
            <span className={saved ? 'text-brand' : ''}><BookmarkIcon /></span>
          </button>
        </div>
      </Link>

      {/* Body */}
      <div className="flex-1 flex flex-col p-3.5">
        {/* Category */}
        <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-steel-grey mb-1.5">
          {product.category}
        </div>

        {/* Name */}
        <Link
          to={`/produk/${product.slug}`}
          className="block font-bold text-graphite text-sm leading-snug mb-1.5 hover:text-brand transition-colors line-clamp-2 font-[family-name:var(--font-display)]"
        >
          {product.name}
        </Link>

        {/* Short spec */}
        <div className="text-[11px] text-steel-grey font-[family-name:var(--font-mono)] mb-1">
          {product.shortSpec}
        </div>

        {/* SKU */}
        <div className="text-[10px] text-steel-grey font-[family-name:var(--font-mono)] tracking-wide mb-3">
          SKU: {product.sku}
        </div>
        <p className="text-[10px] text-steel-grey mb-3">Data & foto contoh. Spesifikasi, sertifikasi dan stok perlu konfirmasi.</p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-1.5">
          <Link
            to={`/produk/${product.slug}`}
            className="flex-1 py-2 text-center text-xs font-bold text-graphite border border-light-steel rounded-lg hover:border-graphite/40 hover:text-brand transition-colors"
          >
            Lihat Detail
          </Link>
          <button
            onClick={handleAddToQuotation}
            aria-label="Tambah ke daftar penawaran"
            title={added ? 'Sudah ditambahkan' : 'Tambah ke Daftar Penawaran'}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              added
                ? 'bg-positive/10 text-positive border border-positive/30'
                : 'bg-brand hover:bg-brand-dark text-white'
            }`}
          >
            {added ? '✓ Ditambahkan' : '+ Penawaran'}
          </button>
        </div>

        {/* WhatsApp quick */}
        <a
          href={`https://wa.me/6281218052017?text=${encodeURIComponent(`Halo Mahameru Baja, saya ingin bertanya tentang *${product.name}* (${product.sku}). Apakah stok tersedia?`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#16A34A] border border-[#16A34A]/25 rounded-lg hover:bg-[#16A34A]/8 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <WAIcon />
          Cek Stok via WA
        </a>
      </div>
    </article>
  );
}

function BookmarkIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
}
function WAIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>;
}
