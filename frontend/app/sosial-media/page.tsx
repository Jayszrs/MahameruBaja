import { connection } from "next/server";
import SocialHub from "../../src/components/SocialHub";
import { readSiteContent } from "../../src/lib/siteContentStore";
export const metadata = { title: "Sosial Media & Cerita Mahameru Baja", description: "Jelajahi kanal Instagram, TikTok, YouTube, serta cerita material dan proses Mahameru Baja.", alternates: { canonical: "/sosial-media" } };
export default async function Page() {
  await connection();
  const content = await readSiteContent();
  return <><section className="social-page-hero"><div className="social-hero-media" data-parallax="0.24"><img src="/images/steel-indonesia/besi-beton.jpg" alt="" /></div><div className="industrial-container"><p className="industrial-eyebrow">MAHAMERU BAJA / SOSIAL MEDIA</p><h1>Cerita di balik<br /><em>setiap proses.</em></h1><p>Material, layanan, dan aktivitas dalam satu ruang untuk mengenal kami lebih dekat.</p></div></section><SocialHub full accounts={content.socialAccounts.filter(a => a.published)} posts={content.socialPosts.filter(p => p.published)} /></>;
}
