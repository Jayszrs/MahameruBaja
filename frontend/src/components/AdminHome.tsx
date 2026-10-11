import Link from "next/link";
import { divisions } from "../data/divisionContent";
import type { AdminDashboardSummary } from "../data/adminDashboard";
function date(value: string) { return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
export default function AdminHome({ summary }: { summary: AdminDashboardSummary }) {
  const metrics = [
    { label: "Permintaan aktif", value: summary.requestsActive, detail: "Permintaan yang belum diarsipkan", href: "/admin/permintaan?view=active" },
    { label: "Perlu ditinjau", value: summary.requestsReview, detail: "Status Baru atau Review kebutuhan", href: "/admin/permintaan?view=active&filter=Perlu+ditinjau" },
    { label: "Artikel terbit", value: summary.articlesPublished, detail: `${summary.articlesDraft} artikel masih berupa draf`, href: "/admin/artikel?status=published" },
    { label: "Banner tayang", value: summary.bannersLive, detail: "Sesuai periode tayang saat ini", href: "/admin/promosi?view=live" },
  ];
  const content = [
    { title: "Konten Publik", detail: `${summary.contactsPublished} kontak · ${summary.reviewsPublished} ulasan terbit`, href: "/admin/konten?tab=contacts" },
    { title: "Kanal sosial", detail: `${summary.accountsPublished} akun · ${summary.postsPublished} unggahan terbit`, href: "/admin/sosial?tab=accounts" },
    { title: "Banner & promo", detail: `${summary.bannersLive} tayang · ${summary.bannersDraft} draf`, href: "/admin/promosi?view=all" },
    { title: "Artikel & panduan", detail: `${summary.articlesPublished} terbit · ${summary.articlesDraft} draf`, href: "/admin/artikel?status=all" },
  ];
  return <div className="admin-overview"><div className="admin-page-heading"><div><p className="industrial-eyebrow">CONTENT STUDIO</p><h1>Dashboard</h1><p>Ringkasan permintaan dan konten Mahameru Baja.</p></div><time dateTime={summary.today}>{date(`${summary.today}T00:00:00+07:00`)} · WIB</time></div>
    <section className="admin-metrics" aria-label="Ringkasan admin">{metrics.map(metric => <Link key={metric.label} href={metric.href}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small><b aria-hidden="true">↗</b></Link>)}</section>
    <div className="admin-overview-grid"><section className="admin-dashboard-panel"><div className="admin-panel-heading"><div><h2>Permintaan terbaru</h2><p>Lima permintaan nonarsip yang terakhir diterima.</p></div><Link href="/admin/permintaan?view=active">Lihat semua ↗</Link></div>
      {summary.recentRequests.length ? <div className="admin-table-scroll"><table className="admin-recent-table"><thead><tr><th>Pelanggan</th><th>Divisi</th><th>Status</th><th>Diterima</th></tr></thead><tbody>{summary.recentRequests.map(record => <tr key={record.id}><td><Link href={`/admin/permintaan?view=active&id=${encodeURIComponent(record.id)}`}><strong>{record.name}</strong><small>{record.id}</small></Link></td><td>{divisions.find(unit => unit.slug === record.businessUnitSlug)?.label || record.businessUnitSlug}</td><td><span className="admin-status-pill">{record.status}</span></td><td><time dateTime={record.createdAt}>{date(record.createdAt)}</time></td></tr>)}</tbody></table></div> : <div className="admin-dashboard-empty"><h3>Belum ada permintaan aktif.</h3><p>Permintaan pelanggan dari website akan muncul di sini.</p><Link href="/admin/permintaan?view=active">Buka Sales Desk ↗</Link></div>}
    </section><section className="admin-dashboard-panel"><div className="admin-panel-heading"><div><h2>Status konten website</h2><p>Konten yang sudah terbit dan siap dikelola.</p></div></div><div className="admin-content-summary">{content.map(item => <Link key={item.title} href={item.href}><div><strong>{item.title}</strong><small>{item.detail}</small></div><span aria-hidden="true">↗</span></Link>)}</div></section></div>
    <section className="admin-dashboard-panel admin-recent-articles"><div className="admin-panel-heading"><div><h2>Artikel terakhir disunting</h2><p>Aktivitas berdasarkan waktu penyimpanan artikel.</p></div><Link href="/admin/artikel?status=all">Kelola artikel ↗</Link></div>
      {summary.recentArticles.length ? <div className="admin-article-activity">{summary.recentArticles.map(article => <Link key={article.id} href={`/admin/artikel?status=all&id=${encodeURIComponent(article.id)}`}><span className={`admin-status-pill${article.status === "draft" ? " draft" : ""}`}>{article.status === "draft" ? "Draf" : "Terbit"}</span><div><strong>{article.title || "Artikel tanpa judul"}</strong><small>{article.category || "Belum ada kategori"}</small></div><time dateTime={article.updatedAt}>{date(article.updatedAt)}</time><span aria-hidden="true">↗</span></Link>)}</div> : <div className="admin-dashboard-empty"><h3>Belum ada artikel.</h3><p>Mulai dengan panduan yang membantu pelanggan memilih material.</p><Link href="/admin/artikel?status=all">Buat artikel ↗</Link></div>}
    </section>
  </div>;
}
