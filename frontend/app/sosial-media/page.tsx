import { connection } from "next/server";
import SocialHub from "../../src/components/SocialHub";
import SocialPageHero from "../../src/components/SocialPageHero";
import PublicText from "../../src/components/PublicText";
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
  const heroImages = division ? [division.hero,...division.images.map(image=>image.src)] : ["/images/steel-indonesia/besi-beton.jpg","/images/steel-indonesia/toko-mahameru.jpg","/images/laser-cutting-illustration.jpg"];
  return <PublicText><SocialPageHero images={heroImages} divisionName={division?.name} activeDivision={division?.slug || ""} divisions={divisions.map(d=>({slug:d.slug,name:d.name}))} /><SocialHub full accounts={accounts} posts={posts} companyName={division?.name} /></PublicText>;
}
