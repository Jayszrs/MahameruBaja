import { connection } from "next/server";
import Link from "next/link";
import SocialHub from "../../src/components/SocialHub";
import PublicText from "../../src/components/PublicText";
import RotatingHeroMedia from "../../src/components/RotatingHeroMedia";
import { readPublicSiteContent } from "../../src/lib/siteContentStore";
import { readPublicDivisions } from "../../src/lib/divisionStore";
import { visibleInDivision, contentOwner } from "../../src/data/divisionCms";
import { accountDivisionSlugs } from "../../src/data/socialMedia";
export const metadata = { title: "Sosial Media & Cerita Mahameru Baja", description: "Jelajahi kanal Instagram, TikTok, YouTube, serta cerita material dan proses Mahameru Baja.", alternates: { canonical: "/sosial-media" } };
export default async function Page({ searchParams }: { searchParams: Promise<{ divisi?: string }> }) {
  await connection();
  const [content, divisions] = await Promise.all([readPublicSiteContent(), readPublicDivisions()]);
  const { divisi } = await searchParams;
  const division = divisions.find(d => d.slug === divisi);
  const accounts = content.socialAccounts.filter(account => account.published && (!division || (account.audience ? account.audience.includes(division.slug) : contentOwner(account) ? visibleInDivision(account,division.slug) : !accountDivisionSlugs(account).length || accountDivisionSlugs(account).includes(division.slug))));
  const posts = content.socialPosts.filter(post => post.published && (!division || visibleInDivision(post,division.slug)));
  return <PublicText><section className="social-page-hero">
    <RotatingHeroMedia className="social-hero-media" images={division ? [division.hero,...division.images.map(image=>image.src)] : ["/images/steel-indonesia/besi-beton.jpg","/images/steel-indonesia/toko-mahameru.jpg","/images/laser-cutting-illustration.jpg"]} />
    <div className="industrial-container"><nav aria-label="Breadcrumb"><Link href="/">Beranda</Link><span>/</span><span>Sosial media</span></nav>
      <p className="industrial-eyebrow">{division?.name || "MAHAMERU BAJA"} / SOSIAL MEDIA</p><h1>Ikuti kabar<br /><em>dan kegiatan kami.</em></h1><p>Lihat produk, proses pengerjaan, dan kabar terbaru melalui akun resmi kami.</p>
      <nav className="social-division-filter" aria-label="Pilih divisi sosial media"><Link href="/sosial-media" aria-current={!division ? "page" : undefined}>Semua divisi</Link>{divisions.map(d=><Link key={d.slug} href={`/sosial-media?divisi=${d.slug}`} aria-current={division?.slug===d.slug?"page":undefined}>{d.name}</Link>)}</nav>
    </div></section><SocialHub full accounts={accounts} posts={posts} companyName={division?.name} /></PublicText>;
}
