import Link from "next/link";
import { cmsPages } from "../data/cmsPageMap";
export default function CmsPageGuide({ pageKey }: { pageKey: string }) {
  const page = cmsPages[pageKey];
  return <div className="admin-management cms-page-guide"><header className="admin-page-heading"><div><h1>{page.label}</h1><p>Urutan di bawah mengikuti halaman website dari atas ke bawah. Pilih bagian yang ingin diubah.</p></div><Link className="admin-secondary" href={page.publicHref} target="_blank" rel="noopener noreferrer">Lihat halaman {page.label} ↗</Link></header>{["beranda","jasa"].includes(pageKey) && <Link className="admin-secondary" href={`${pageKey === "jasa" ? "/admin/jasa" : "/admin/tampilan"}?section=layout`}>Tampilkan / sembunyikan section {page.label}</Link>}<ol className="cms-section-list">{page.sections.map((section, index) => <li key={`${section.heading}-${index}`}><span>{index + 1}</span><div><h2>{section.heading}</h2><p>{section.detail}</p></div><Link className="admin-secondary" href={section.edit}>{section.action} ↗</Link></li>)}</ol></div>;
}
