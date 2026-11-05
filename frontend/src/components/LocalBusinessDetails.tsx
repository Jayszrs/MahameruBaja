"use client";
import Link from "next/link";
import PublicText, { PublicSection, sectionListAttributes, useSectionList } from "./PublicText";
import type { Division } from "../data/divisionCms";
import { internationalPhone } from "../data/siteContent";

export default function LocalBusinessDetails({ divisions }: { divisions: Division[]; service?: boolean }) {
  if (!divisions.length) return null;
  const checklist = useSectionList("serviceContactChecklist", [
    { id: "drawing", title: "Gambar", detail: "DWG / DXF. PDF atau foto untuk konsultasi awal." },
    { id: "material", title: "Material & jumlah", detail: "Jenis, ketebalan, ukuran, dan jumlah komponen." },
    { id: "target", title: "Target pengerjaan", detail: "Finishing, lokasi, dan tanggal kebutuhan." },
  ], "contact", "services");
  return <PublicText><PublicSection section="contact" page="services"><section className="home-section local-business-details service-contact-section" aria-labelledby="local-business-heading"><div className="home-shell">
    <div className="service-contact-heading"><div><h2 id="local-business-heading">Siap bahas kebutuhan Anda?</h2><p>Kirim desain, cek prosesnya, lalu terima penawaran.</p></div><Link href="/jasa#request" className="home-button home-button-primary">Kirim desain & minta harga</Link></div>
    <div className="service-contact-grid">
      <article className="service-prepare-card"><h3>Cukup siapkan ini</h3><ul {...sectionListAttributes("serviceContactChecklist", checklist)}>{checklist.map(item=><li key={String(item.id)}><strong>{String(item.title||"")}</strong><span>{String(item.detail||"")}</span></li>)}</ul><small>Harga dan jadwal dipastikan setelah gambar diperiksa.</small></article>
      {divisions.map(division => <article className="service-location-card" data-cms-static key={division.slug}><h3>{division.name}</h3><address>{division.address}</address><div className="service-sales-buttons">{division.admins.map(admin => <a key={`${admin.name}-${admin.phone}`} href={`https://wa.me/${internationalPhone(admin.phone)}`} target="_blank" rel="noopener noreferrer"><span>Chat {admin.name}</span><small>{admin.phone}</small></a>)}</div><div className="service-location-actions">{division.mapsUrl && <a href={division.mapsUrl} target="_blank" rel="noopener noreferrer">Buka Google Maps</a>}<Link href={`/unit/${division.slug}/kontak`}>Kontak lengkap</Link></div></article>)}
    </div>
  </div></section></PublicSection></PublicText>;
}
