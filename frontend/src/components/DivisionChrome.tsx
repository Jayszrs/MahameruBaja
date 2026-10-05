"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Division } from "../data/divisionContent";

export function divisionNavigation(division: Division) {
  const base = `/unit/${division.slug}`;
  return [
    { label: "Beranda", href: base }, { label: "Tentang", href: `${base}/tentang` },
    { label: division.slug.startsWith("retail") ? "Produk" : "Layanan", href: `${base}/${division.slug.startsWith("retail") ? "produk" : "layanan"}` },
    { label: "Galeri", href: `${base}/galeri` }, { label: "Kontak", href: `${base}/kontak` },
  ];
}

export function DivisionHeader({ division }: { division: Division }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => { menu.current?.removeAttribute("open"); }, [pathname]);
  return <header className={`unit-header unit-theme-${division.slug}`}><div className="unit-header-inner">
    <Link className="unit-brand" href={`/unit/${division.slug}`}><img src="/mbi-mark.svg" alt="" width={42} height={42} /><span>{division.name}<small>{division.label}</small></span></Link>
    <nav className="unit-desktop-nav" aria-label={`Navigasi ${division.name}`}>{divisionNavigation(division).map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}</nav>
    <Link href="/divisi" className="unit-group-link">Divisi lainnya ↗</Link>
    <details className="unit-mobile-menu" ref={menu} onKeyDown={event => { if (event.key === "Escape") menu.current?.removeAttribute("open"); }}><summary aria-label="Buka menu divisi"><span /><span /></summary><nav aria-label="Menu divisi mobile">{divisionNavigation(division).map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}<span>↗</span></Link>)}<Link href="/divisi">Divisi lainnya<span>↗</span></Link><Link href="/">Website utama MBI<span>↗</span></Link></nav></details>
  </div></header>;
}

export function DivisionFooter({ division }: { division: Division }) {
  return <footer className="unit-footer"><div className="industrial-container"><div className="unit-footer-top"><div><p className="industrial-eyebrow">BAGIAN DARI MAHAMERU BAJA</p><h2>{division.name}</h2><p>{division.intro}</p></div><Link href={`/unit/${division.slug}/kontak`} className="industrial-button">Bicarakan kebutuhan Anda ↗</Link></div><div className="unit-footer-bottom"><span>{division.area}</span><nav aria-label="Footer divisi"><Link href={`/unit/${division.slug}/tentang`}>Profil perusahaan</Link><Link href="/sosial-media">Sosial media</Link><Link href="/divisi">Divisi lainnya</Link><Link href="/">Website utama ↗</Link></nav></div></div></footer>;
}
