"use client";

import { useState } from 'react';

const actions = [
  { label: 'Retail Tambun', msg: 'Halo, mohon arahkan saya ke unit Mahameru Baja Retail Tambun.' },
  { label: 'Retail Cibitung', msg: 'Halo, mohon arahkan saya ke unit Garuda Marginal Baja Retail Cibitung.' },
  { label: 'Trading Proyek', msg: 'Halo, mohon arahkan saya ke Mahameru Baja Indonesia untuk supply proyek.' },
  { label: 'Laser Cutting & Bending', msg: 'Halo, mohon arahkan saya ke MBI Laser Cutting & Bending untuk konsultasi gambar dan penawaran.' },
  { label: 'Tanya Harga', msg: 'Halo Mahameru Baja, saya ingin menanyakan harga material.' },
  { label: 'Cek Produk', msg: 'Halo Mahameru Baja, saya ingin mengecek ketersediaan produk.' },
  { label: 'Cek Stok', msg: 'Halo Mahameru Baja, saya ingin mengecek stok material.' },
  { label: 'Minta Penawaran', msg: 'Halo Mahameru Baja, saya ingin meminta penawaran untuk kebutuhan material proyek saya.' },
  { label: 'Info Pengiriman', msg: 'Halo Mahameru Baja, saya ingin menanyakan informasi pengiriman material ke lokasi saya.' },
];

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Action menu */}
      {open && (
        <div className="flex flex-col gap-1.5 mb-1 items-end">
          <p className="max-w-60 p-3 text-[10px] bg-white rounded-lg shadow-lg text-graphite">Pilih unit layanan. Nomor khusus unit belum tersedia; chat diarahkan melalui kontak utama.</p>
          {actions.slice(0, 4).map(action => (
            <a
              key={action.label}
              href={`https://wa.me/6281218052017?text=${encodeURIComponent(action.msg)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-graphite text-sm font-semibold rounded-xl shadow-lg hover:bg-[#25D366] hover:text-white transition-all hover:-translate-y-0.5 whitespace-nowrap border border-light-steel"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] group-hover:bg-white" />
              {action.label}
            </a>
          ))}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Tutup menu WhatsApp' : 'Hubungi via WhatsApp'}
        aria-expanded={open}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${
          open ? 'bg-graphite rotate-45' : 'bg-[#25D366] hover:bg-[#20b858]'
        }`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            <path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" />
          </svg>
        )}
      </button>
    </div>
  );
}
