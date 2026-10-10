"use client";

import Image from 'next/image';
import { mainLogo } from "../data/companyIdentity";
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useQuotation } from '../context/QuotationContext';

interface NavbarProps {
  onSearchOpen: () => void;
}

const bottomLinks = [
  { label: 'Beranda', href: '/', hasMega: false },
  { label: 'Tentang Kami', href: '/tentang-kami', hasMega: false },
  { label: 'Produk', href: '/produk', hasMega: true },
  { label: 'Jasa', href: '/jasa', hasMega: false },
  { label: 'Galeri', href: '/proyek', hasMega: false },
  { label: 'Artikel', href: '/informasi', hasMega: false },
  { label: 'Kontak', href: '/kontak', hasMega: false },
  { label: 'Sosial Media', href: '/sosial-media', hasMega: false },
];

const megaMenuCols = [
  {
    title: 'Besi Struktur',
    items: [
      { label: 'WF Beam', slug: 'besi-wf' },
      { label: 'H-Beam', slug: 'besi-wf' },
      { label: 'Besi Siku', slug: 'besi-siku' },
    ],
  },
  {
    title: 'Besi Beton',
    items: [
      { label: 'Besi Beton Polos', slug: 'besi-beton' },
      { label: 'Besi Beton Ulir', slug: 'besi-beton' },
      { label: 'Wiremesh', slug: 'wiremesh' },
    ],
  },
  {
    title: 'Hollow & Pipa',
    items: [
      { label: 'Besi Hollow', slug: 'besi-hollow' },
      { label: 'Pipa Hitam', slug: 'pipa-besi' },
      { label: 'Pipa Galvanis', slug: 'pipa-besi' },
    ],
  },
  {
    title: 'Plat & Atap',
    items: [
      { label: 'Plat Besi', slug: 'plat-besi' },
      { label: 'Bondek', slug: 'bondek' },
      { label: 'Spandek', slug: 'spandek' },
      { label: 'Galvalum', slug: 'baja-ringan' },
      { label: 'Baja Ringan', slug: 'baja-ringan' },
    ],
  },
];

export default function Navbar({ onSearchOpen }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { count, setOpen: setQuotationOpen } = useQuotation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [homeNavVisible, setHomeNavVisible] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [location.pathname]);

  useEffect(() => {
    const update = () => setHomeNavVisible(window.scrollY > Math.min(180, window.innerHeight * 0.22));
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [mobileOpen]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    if (megaOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [megaOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const close = () => setMegaOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [megaOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Menu utama"]');
    const items = () => Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []);
    items()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab") return;
      const controls = items(); const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); previous?.focus(); };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' :
      href === '/tentang-kami' ? location.pathname.startsWith('/tentang-kami') || location.pathname.startsWith('/unit/') :
        location.pathname.startsWith(href);

  const navSolid = true;
  const homeNavHidden = location.pathname === '/' && !homeNavVisible && !mobileOpen;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <>
      {/* MAIN NAVBAR */}
      <div
        inert={homeNavHidden}
        className={`site-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 home-nav-layer ${homeNavHidden ? 'home-nav-hidden' : ''} ${
          navSolid
            ? 'bg-white shadow-sm border-b border-light-steel'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 lg:h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="Mahameru Baja - Beranda"
            >
              <LogoMark light={!navSolid} />
              <div className="navbar-wordmark leading-tight">
                <div className={`font-extrabold text-[13px] tracking-tight font-[family-name:var(--font-display)] ${navSolid ? 'text-gunmetal' : 'text-white'}`}>MAHAMERU BAJA</div>
                <div className="font-semibold text-[8px] text-brand tracking-[0.16em] uppercase">INDONESIA</div>
              </div>
            </Link>

            {/* Center Search (desktop) */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-xl items-center gap-0 rounded-xl overflow-hidden border border-light-steel bg-white shadow-sm hover:border-steel-grey focus-within:border-graphite/50 focus-within:shadow-md transition-all"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari besi beton, WF, hollow, wiremesh..."
                aria-label="Cari produk" className="min-w-0 flex-1 px-4 py-2.5 text-sm text-graphite bg-transparent focus:outline-none placeholder-light-steel"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand hover:bg-brand-dark text-white transition-colors shrink-0"
                aria-label="Cari produk"
              >
                <SearchIcon size={16} />
              </button>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              {/* Mobile search */}
              <button
                onClick={onSearchOpen}
                aria-label="Buka pencarian"
                className={`lg:hidden p-2 rounded-lg transition-colors ${navSolid ? 'text-graphite hover:bg-warm-white' : 'text-white hover:bg-white/10'}`}
              >
                <SearchIcon />
              </button>

              {/* WA */}
              <a
                href="https://wa.me/6281218052017"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat WhatsApp"
                className={`hidden sm:flex p-2 rounded-lg transition-colors ${navSolid ? 'text-graphite hover:bg-warm-white' : 'text-white hover:bg-white/10'}`}
              >
                <WAIcon />
              </a>

              {/* Quotation count */}
              <button
                onClick={() => setQuotationOpen(true)}
                aria-label={`Daftar Penawaran — ${count} item`}
                className={`relative p-2 rounded-lg transition-colors ${navSolid ? 'text-graphite hover:bg-warm-white' : 'text-white hover:bg-white/10'}`}
              >
                <ListIcon />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {/* Penawaran CTA (desktop) */}
              <Link
                to="/minta-penawaran"
                className="hidden lg:flex items-center gap-1.5 ml-1 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md font-[family-name:var(--font-display)]"
              >
                Minta Penawaran
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={mobileOpen}
                className={`lg:hidden p-2 rounded-lg transition-colors ${navSolid ? 'text-graphite' : 'text-white'}`}
              >
                {mobileOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV (desktop only) */}
        <div className={`hidden lg:block border-t ${navSolid ? 'border-light-steel/60' : 'border-white/10'}`}>
          <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
            <div ref={megaRef} className="flex items-center gap-0 relative">
              {bottomLinks.map(link => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.hasMega && setMegaOpen(true)}
                  onMouseLeave={() => link.hasMega && setMegaOpen(false)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 px-2.5 py-3 text-[12px] font-semibold transition-colors relative group font-[family-name:var(--font-display)] ${
                      isActive(link.href)
                        ? navSolid ? 'text-brand' : 'text-white'
                        : navSolid ? 'text-graphite hover:text-brand' : 'text-white/80 hover:text-white'
                    }`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                    {link.hasMega && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                    {isActive(link.href) && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand rounded-full" />
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {link.hasMega && megaOpen && (
                    <div className="absolute top-full left-0 w-[min(780px,calc(100vw-250px))] bg-white shadow-2xl border border-light-steel rounded-xl overflow-hidden"
                      style={{ zIndex: 100 }}
                      onMouseEnter={() => setMegaOpen(true)}
                      onMouseLeave={() => setMegaOpen(false)}
                    >
                      <div className="grid grid-cols-5 gap-0">
                        {/* 4 category columns */}
                        <div className="col-span-4 grid grid-cols-4 gap-0 p-5">
                          {megaMenuCols.map(col => (
                            <div key={col.title}>
                              <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand mb-3">{col.title}</div>
                              <ul className="space-y-1.5">
                                {col.items.map(item => (
                                  <li key={item.label}>
                                    <Link
                                      to={`/produk?kategori=${item.slug}`}
                                      onClick={() => setMegaOpen(false)}
                                      className="flex items-center gap-1.5 text-sm text-graphite hover:text-brand transition-colors py-0.5"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-light-steel inline-block shrink-0" />
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Featured sidebar */}
                        <div className="bg-warm-white border-l border-light-steel p-4 flex flex-col">
                          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-steel-grey mb-3">Paling Dicari</div>
                          <div className="space-y-2 flex-1">
                            {['WF Beam', 'Besi Beton', 'Hollow'].map(p => (
                              <Link
                                key={p}
                                to={`/cari?q=${encodeURIComponent(p)}`}
                                onClick={() => setMegaOpen(false)}
                                className="flex items-center gap-2 text-sm text-graphite hover:text-brand transition-colors"
                              >
                                <span className="text-brand font-bold">→</span>
                                {p}
                              </Link>
                            ))}
                          </div>
                          <Link
                            to="/produk"
                            onClick={() => setMegaOpen(false)}
                            className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition-colors"
                          >
                            Lihat Semua Produk →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" aria-modal="true" aria-label="Menu utama" role="dialog">
          <div className="absolute inset-0 bg-gunmetal/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[min(340px,100vw)] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-light-steel">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <LogoMark light={false} />
                <div className="navbar-wordmark leading-tight">
                  <div className="font-extrabold text-[13px] text-gunmetal tracking-tight font-[family-name:var(--font-display)]">MAHAMERU BAJA</div>
                  <div className="font-semibold text-[8px] text-brand tracking-[0.16em] uppercase">INDONESIA</div>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Tutup menu" className="p-2 text-steel-grey">
                <XIcon />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-0.5" role="list">
                {bottomLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive(link.href)
                          ? 'text-brand font-bold'
                          : 'text-graphite hover:bg-warm-white hover:text-brand'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Mega items on mobile */}
              <div className="mt-4 pt-4 border-t border-light-steel">
                <p className="px-3 text-[11px] font-bold tracking-wide uppercase text-steel-grey mb-2">Kategori Produk</p>
                <div className="space-y-0.5">
                  {megaMenuCols.flatMap(col => col.items).slice(0, 8).map(item => (
                    <Link
                      key={item.label}
                      to={`/produk?kategori=${item.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-graphite hover:text-brand hover:bg-warm-white rounded-lg transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-light-steel" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
            <div className="mobile-menu-actions px-4 pb-6 pt-2 border-t border-light-steel space-y-2">
              <button
                onClick={() => { setQuotationOpen(true); setMobileOpen(false); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-light-steel text-graphite text-sm font-bold rounded-xl hover:bg-warm-white transition-colors"
              >
                <ListIcon />
                Daftar Penawaran {count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-brand text-white text-[10px] rounded-full">{count}</span>}
              </button>
              <Link
                to="/minta-penawaran"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-xl transition-colors"
              >
                Minta Penawaran
              </Link>
              <a
                href="https://wa.me/6281218052017"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1A7A3E] text-white text-sm font-bold rounded-xl"
              >
                <WAIcon />
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LogoMark({ light }: { light: boolean }) {
  return (
    <span className={`relative block h-14 w-16 overflow-hidden ${light ? 'ring-1 ring-white/20' : 'ring-1 ring-black/10'} bg-white`} aria-hidden="true">
      <Image src={mainLogo} alt="" fill sizes="64px" className="object-contain" />
    </span>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function WAIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" /></svg>;
}
function ListIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function XIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
