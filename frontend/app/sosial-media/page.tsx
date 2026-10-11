import { connection } from "next/server";
import Link from "next/link";
import SocialHub from "../../src/components/SocialHub";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { visibleInDivision, contentOwner } from "../../src/data/divisionCms";
import { accountDivisionSlugs } from "../../src/data/socialMedia";
export const metadata = { title: "Sosial Media & Cerita Mahameru Baja", description: "Jelajahi kanal Instagram, TikTok, YouTube, serta cerita material dan proses Mahameru Baja.", alternates: { canonical: "/sosial-media" } };
export default async function Page({ searchParams }: { searchParams: Promise<{ divisi?: string }> }) {
  await connection();
  const content = await readPublicSiteContent();
  const { divisi } = await searchParams;
  const division = (await readPublicDivisions()).find(d => d.slug === divisi);
  const accounts = content.socialAccounts.filter(account => account.published && (!division || (account.audience ? account.audience.includes(division.slug) : contentOwner(account) ? visibleInDivision(account,division.slug) : !accountDivisionSlugs(account).length || accountDivisionSlugs(account).includes(division.slug))));
  const posts = content.socialPosts.filter(post => post.published && (!division || visibleInDivision(post,division.slug)));
  return <><section className="social-page-hero"><div className="social-hero-media" data-parallax="0.24"><img src={division?.hero || "/images/steel-indonesia/besi-beton.jpg"} alt="" /></div><div className="industrial-container"><nav aria-label="Breadcrumb"><Link href="/">Beranda</Link><span>/</span><span>Sosial media</span></nav><p className="industrial-eyebrow">{division?.name || "MAHAMERU BAJA"} / SOSIAL MEDIA</p><h1>Cerita di balik<br /><em>setiap proses.</em></h1><p>Material, layanan, dan aktivitas dalam satu ruang untuk mengenal kami lebih dekat.</p><nav className="social-division-filter" aria-label="Pilih divisi sosial media"><Link href="/sosial-media" aria-current={!division ? "page" : undefined}>Semua divisi</Link>{(await readPublicDivisions()).map(d => <Link key={d.slug} href={`/sosial-media?divisi=${d.slug}`} aria-current={division?.slug === d.slug ? "page" : undefined}>{d.name}</Link>)}</nav></div></section><SocialHub full accounts={accounts} posts={posts} companyName={division?.name} /></>;
}
