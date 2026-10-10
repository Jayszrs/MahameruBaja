"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Division } from "../data/divisionContent";
import { divisionIdentity, divisionWhatsApp } from "../data/companyIdentity";
import { divisions } from "../data/divisionContent";

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
    <Link className="unit-brand" href={`/unit/${division.slug}`}><Image src={divisionIdentity[division.slug].logo} alt="" width={65} height={55} sizes="65px" /><span>{division.name}<small>{division.label}</small></span></Link>
    <nav className="unit-desktop-nav" aria-label={`Navigasi ${division.name}`}>{divisionNavigation(division).map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}</nav>
    <Link href="/tentang-kami#divisi" className="unit-group-link">Divisi lainnya ↗</Link>
    <details className="unit-mobile-menu" ref={menu} onKeyDown={event => { if (event.key === "Escape") menu.current?.removeAttribute("open"); }}><summary aria-label="Buka menu divisi"><span /><span /></summary><nav aria-label="Menu divisi mobile">{divisionNavigation(division).map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}<span>↗</span></Link>)}<Link href="/tentang-kami#divisi">Divisi lainnya<span>↗</span></Link><Link href="/">Website utama MBI<span>↗</span></Link></nav></details>
  </div></header>;
}

export function DivisionFooter({ division }: { division: Division }) {
  const base = `/unit/${division.slug}`;
  return <footer className={`unit-footer unit-footer-v2 unit-theme-${division.slug}`}>
    <div className="industrial-container">
      <div className="unit-footer-main">
        <div className="unit-footer-about">
          <Link className="unit-footer-brand" href={base} aria-label={`Beranda ${division.name}`}><Image src={divisionIdentity[division.slug].logo} alt="" width={65} height={55} sizes="65px" /><span><strong>{division.name}<i>.</i></strong><small>{division.label.toUpperCase()}</small></span></Link>
          <p>{division.intro}</p>
          <span className="unit-footer-phone-label">KONTAK UTAMA</span><a className="unit-footer-phone" href={divisionWhatsApp(division.slug)}>{divisionIdentity[division.slug].admins[0].phone}</a>
          <div className="unit-footer-actions"><Link className="unit-footer-contact" href={`${base}/kontak`}>Hubungi kami <span aria-hidden="true">↗</span></Link><button type="button" className="unit-footer-up" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Kembali ke atas">↑</button></div>
        </div>
        <nav aria-label={`Navigasi footer ${division.name}`}><strong>Jelajahi divisi</strong>{divisionNavigation(division).map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
        <nav aria-label="Jaringan Mahameru Baja"><strong>Lima divisi</strong>{divisions.filter(item => item.slug !== division.slug).map(item => <Link href={`/unit/${item.slug}`} key={item.slug}>{item.name}</Link>)}<Link href="/tentang-kami#divisi">Lihat semua divisi ↗</Link></nav>
        <nav aria-label="Sosial media Mahameru Baja"><strong>Terhubung</strong><a href={division.slug === "retail-cibitung" ? "https://www.instagram.com/gmbgarudaofficial/" : "https://www.instagram.com/mbilasercutting/"} target="_blank" rel="noopener noreferrer">Instagram ↗</a><Link href="/sosial-media">Konten sosial ↗</Link><a href={divisionWhatsApp(division.slug)} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></nav>
      </div>
      <div className="unit-footer-wordmark" aria-label={division.name}>{division.name.toUpperCase()}<span>.</span></div>
      <div className="unit-footer-bottom"><span>© {new Date().getFullYear()} Mahameru Baja Indonesia. Seluruh hak cipta dilindungi.</span><span>{division.area}</span><Link href="/">Website utama ↗</Link></div>
    </div>
  </footer>;
}
