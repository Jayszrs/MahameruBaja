import { notFound } from "next/navigation";
import ArticleDetailPage from "../../../src/screens/ArticleDetailPage";
import { articles, getArticleBySlug } from "../../../src/data/articles";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticleBySlug((await params).slug);
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
      images: [{ url: article.image, alt: article.title }],
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
  if (!getArticleBySlug((await params).slug)) notFound();
  return <ArticleDetailPage />;
}
