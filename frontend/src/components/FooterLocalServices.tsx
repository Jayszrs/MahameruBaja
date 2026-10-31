"use client";
import { useSectionList, sectionListAttributes } from "./PublicText";
import { PublicSection } from "./PublicText";
import Link from "next/link";
import type { Division } from "../data/divisionCms";

export default function FooterLocalServices({ divisions }: { divisions: Division[] }) {
  const active = new Set(divisions.map(division => division.slug));
  const defaultGroups = [
    { title: "Material & toko besi", links: [
      { slug: "retail-tambun", href: "/unit/retail-tambun", label: "Toko besi Tambun Bekasi" },
      { slug: "retail-cibitung", href: "/unit/retail-cibitung", label: "Toko besi Cibitung Bekasi" },
      { slug: "retail-tambun", href: "/produk", label: "Besi beton, hollow & plat Bekasi" },
    ] },
    { title: "Cutting & bending plat", links: [
      { slug: "laser-cutting", href: "/jasa", label: "Jasa cutting laser Tambun & Bekasi" },
      { slug: "laser-cutting", href: "/unit/laser-cutting/layanan", label: "Jasa bending plat Bekasi" },
    ] },
    { title: "Kebutuhan proyek", links: [
      { slug: "trading-proyek", href: "/unit/trading-proyek", label: "Supplier besi & baja proyek Bekasi" },
      { slug: "fabrikasi-erection", href: "/unit/fabrikasi-erection", label: "Jasa fabrikasi baja Bekasi" },
      { slug: "fabrikasi-erection", href: "/unit/fabrikasi-erection/layanan", label: "Erection struktur baja Bekasi" },
    ] },
  ].map(group => ({ ...group, links: group.links.filter(link => active.has(link.slug)) })).filter(group => group.links.length);
  const rows=useSectionList("footerLocalLinks",defaultGroups.flatMap(group=>group.links.map(link=>({...link,group:group.title}))),"local","all");
  const groups=[...new Set(rows.map(row=>row.group))].map(title=>({title,links:rows.filter(row=>row.group===title)}));
  if (!groups.length) return null;
  return <PublicSection section="local" page="all"><nav {...sectionListAttributes("footerLocalLinks",rows)} className="footer-local-services" aria-labelledby="footer-local-services-heading">
    <h2 id="footer-local-services-heading">Material & pengerjaan baja di Bekasi</h2>
    <p>Temukan toko, material, dan tim pengerjaan sesuai kebutuhan Anda di Tambun, Cibitung, dan Bekasi.</p>
    <div>{groups.map(group => <section key={group.title}><h3>{group.title}</h3><ul>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></section>)}</div>
  </nav></PublicSection>;
}
