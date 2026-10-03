import { notFound } from "next/navigation";
import ArticleDetailPage from "../../../src/screens/ArticleDetailPage";
import { articles, getArticleBySlug } from "../../../src/data/articles";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticleBySlug((await params).slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (!getArticleBySlug((await params).slug)) notFound();
  return <ArticleDetailPage />;
}
