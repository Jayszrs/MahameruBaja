import { notFound } from "next/navigation";
import ArticleDetailPage from "../../../src/screens/ArticleDetailPage";
import { readPublishedArticles } from "../../../src/lib/articleStore";
import { siteOrigin } from "../../../src/lib/siteOrigin";
import { jsonLd, organizationSchema } from "../../../src/lib/structuredData";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const article = (await readPublishedArticles()).find(article => article.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/informasi/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `/informasi/${article.slug}`,
      images: [{ url: article.image, alt: article.imageAlt || article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = await readPublishedArticles();
  const article = articles.find(article => article.slug === slug);
  if (!article) notFound();
  const base = siteOrigin();
  const url = `${base}/informasi/${article.slug}`;
  const schema = { "@context": "https://schema.org", "@graph": [organizationSchema(base), {
    "@type": "Article", "@id": `${url}#article`, headline: article.title, description: article.excerpt,
    image: new URL(article.image, base).href, datePublished: article.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: { "@id": `${base}/#organization` }, inLanguage: "id-ID",
  }, {
    "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Informasi", item: `${base}/informasi` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><ArticleDetailPage article={article} related={articles.filter(item => item.id !== article.id).slice(0, 3)} /></>;
}
