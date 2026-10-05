"use client";

import { useEffect } from 'react';
import { Link } from 'react-router';
import { useQuotation } from '../context/QuotationContext';

export default function QuotationDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQty, updateNotes, clearItems, count } = useQuotation();

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-label="Daftar Penawaran">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gunmetal/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-[420px] bg-white flex flex-col drawer-enter shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-steel bg-warm-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <ListIcon />
            </div>
            <div>
              <div className="font-bold text-graphite text-sm font-[family-name:var(--font-display)]">Daftar Penawaran</div>
              <div className="text-[11px] text-steel-grey">{count} item dipilih</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup daftar penawaran"
            className="p-2 rounded-lg text-steel-grey hover:text-graphite hover:bg-surface-2 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                <ListIcon size={24} />
              </div>
              <p className="font-semibold text-graphite mb-1">Belum ada produk</p>
              <p className="text-sm text-steel-grey mb-5">Tambahkan produk dari katalog untuk membuat penawaran.</p>
              <Link
                to="/produk"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand-dark transition-colors"
              >
                Jelajahi Produk
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-light-steel/60">
              {items.map(item => (
                <li key={item.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-graphite text-sm leading-tight mb-0.5 line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-[family-name:var(--font-mono)] text-steel-grey mb-2">
                        {item.sku} · {item.shortSpec}
                      </div>
                      {/* Qty */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Kurangi"
                          className="w-6 h-6 rounded border border-light-steel flex items-center justify-center text-steel-grey hover:text-graphite hover:border-graphite/40 transition-colors text-sm font-bold"
                        >−</button>
                        <span className="text-sm font-bold text-graphite w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Tambah"
                          className="w-6 h-6 rounded border border-light-steel flex items-center justify-center text-steel-grey hover:text-graphite hover:border-graphite/40 transition-colors text-sm font-bold"
                        >+</button>
                        <span className="text-xs text-steel-grey">{item.unit}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Hapus item"
                          className="ml-auto text-steel-grey hover:text-brand transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Catatan (opsional)..."
                    value={item.notes}
                    onChange={e => updateNotes(item.id, e.target.value)}
                    className="mt-2 w-full text-xs px-3 py-2 bg-warm-white border border-light-steel rounded-lg focus:outline-none focus:border-steel-grey placeholder-light-steel text-graphite"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-light-steel p-4 space-y-2 bg-warm-white">
            <Link to="/minta-penawaran" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-colors">Buat PDF & lanjut WhatsApp</Link>
            <p className="text-xs text-steel-grey">Lengkapi kontak. PDF dibuat otomatis dari daftar material Anda.</p>
            <button
              onClick={clearItems}
              className="w-full py-2 text-xs text-steel-grey hover:text-brand transition-colors"
            >
              Kosongkan Daftar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ListIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
}
function WAIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>;
}
