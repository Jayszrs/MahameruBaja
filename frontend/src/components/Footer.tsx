"use client";

import Image from 'next/image';
import { Link } from 'react-router';

const produkLinks = [
  { label: 'Besi Beton', href: '/produk?kategori=besi-beton' },
  { label: 'WF Beam', href: '/produk?kategori=besi-wf' },
  { label: 'Besi Hollow', href: '/produk?kategori=besi-hollow' },
  { label: 'Pipa Besi', href: '/produk?kategori=pipa-besi' },
  { label: 'Wiremesh', href: '/produk?kategori=wiremesh' },
  { label: 'Baja Ringan', href: '/produk?kategori=baja-ringan' },
  { label: 'Bondek & Spandek', href: '/produk?kategori=bondek' },
  { label: 'Lihat Semua →', href: '/produk', special: true },
];

const perusahaanLinks = [
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Layanan', href: '/layanan' },
  { label: 'Proyek & Galeri', href: '/proyek' },
  { label: 'Artikel', href: '/informasi' },
  { label: 'Kontak', href: '/kontak' },
];

const bantuanLinks = [
  { label: 'Cara Memesan', href: '/tentang-kami' },
  { label: 'Minta Penawaran', href: '/minta-penawaran' },
  { label: 'Cek Produk', href: '/produk' },
  { label: 'Pertanyaan & Bantuan', href: '/kontak' },
];

export default function Footer() {
  return (
    <footer className="bg-gunmetal text-white relative overflow-hidden" role="contentinfo">
      {/* Blueprint texture */}
      <div className="absolute inset-0 texture-blueprint opacity-100 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* CTA strip */}
        <div className="border-b border-white/8 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-1 font-[family-name:var(--font-display)]">
                Butuh Material? Hubungi Kami.
              </h2>
              <p className="text-white/50 text-sm">Konsultasi gratis · Penawaran cepat · Pengiriman Bekasi & sekitarnya</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/minta-penawaran"
                className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-lg transition-all hover:-translate-y-0.5"
              >
                Minta Penawaran
              </Link>
              <a
                href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20konsultasi%20kebutuhan%20material."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-bold text-sm rounded-lg hover:bg-white/8 transition-colors"
              >
                <WAIcon />
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 py-14 border-b border-white/8">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="relative w-11 h-11 bg-white overflow-hidden">
                <Image src="/images/steel-indonesia/company-logo.jpeg" alt="Logo MBI" fill sizes="44px" className="object-contain" />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-base text-white tracking-tight font-[family-name:var(--font-display)]">MAHAMERU BAJA</div>
                <div className="font-semibold text-[9px] text-brand tracking-[0.16em] uppercase">INDONESIA</div>
              </div>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-5">
              Supplier besi dan material baja terpercaya di Bekasi. Melayani kebutuhan retail, bengkel, fabrikasi, hingga proyek konstruksi skala besar.
            </p>

            {/* Contact details */}
            <div className="space-y-3 mb-5">
              <div className="flex gap-3">
                <span className="text-white/30 mt-0.5 shrink-0"><LocationIcon /></span>
                <p className="text-sm text-white/55 leading-relaxed">
                  Jl. Permata Regensi Blok K1 No. 38–39,<br />
                  Tambun Selatan, Kab. Bekasi 17510
                </p>
              </div>
              <a
                href="https://wa.me/6281218052017"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/55 hover:text-white transition-colors"
              >
                <span className="text-white/30 shrink-0"><PhoneIcon /></span>
                +62 812-1805-2017
              </a>
              <div className="flex gap-3">
                <span className="text-white/30 mt-0.5 shrink-0"><ClockIcon /></span>
                <div className="text-sm text-white/55">
                  <div>Sen–Sab: 07:00–17:00 WIB</div>
                  <div>Minggu: 07:00–15:00 WIB</div>
                </div>
              </div>
            </div>

            <Link to="/kontak" className="inline-flex text-sm font-bold text-white hover:text-brand transition-colors">Lihat detail kontak →</Link>
          </div>

          {/* Produk col */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-4">Produk</h3>
            <ul className="space-y-2.5">
              {produkLinks.map(l => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className={`text-sm transition-colors ${l.special ? 'text-brand hover:text-brand-dark' : 'text-white/55 hover:text-white'}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan col */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-4">Perusahaan</h3>
            <ul className="space-y-2.5">
              {perusahaanLinks.map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-white/55 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan col */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-4">Bantuan</h3>
            <ul className="space-y-2.5">
              {bantuanLinks.map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-white/55 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/8">
              <div className="text-xs font-semibold text-white/70 mb-1">Jam Operasional</div>
              <div className="text-xs text-white/40">Senin – Sabtu</div>
              <div className="text-sm font-bold text-white">07:00 – 17:00 WIB</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Toko Besi Mahameru Baja. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-1 text-white/25 text-xs">
            <span className="font-[family-name:var(--font-mono)]">Tambun Selatan, Bekasi</span>
            <span className="mx-2">·</span>
            <Link to="/kontak" className="hover:text-white/60 transition-colors">Hubungi kami</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === 'instagram') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
  if (name === 'facebook') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LocationIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function PhoneIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>; }
function ClockIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function WAIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>; }
