import { notFound } from "next/navigation";
import ArticleDetailPage from "../../../src/screens/ArticleDetailPage";
import { readPublishedArticles } from "../../../src/lib/articleStore";

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
  return <ArticleDetailPage article={article} related={articles.filter(item => item.id !== article.id).slice(0, 3)} />;
}
