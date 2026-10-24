import "server-only";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import type { ArticleRecord } from "../data/articleCms";
import { articleTextSources } from "../data/articleWebsiteText";
import { contentOwner } from "../data/divisionCms";
import { normalizeWebsiteText } from "../data/websiteTexts";
import { serviceWording } from "../data/serviceWording";
import type { OwnedWebsiteTextChoice } from "../data/websiteTextChoices";

export function articleWebsiteTextChoices(articles: ArticleRecord[]): OwnedWebsiteTextChoice[] {
  const choices = new Map<string, OwnedWebsiteTextChoice>();
  for (const article of articles) {
    const ownerDivision = contentOwner(article) || null;
    const tree = fromMarkdown(serviceWording(article.content), { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
    for (const value of [article.title, article.excerpt, article.category, article.readTime, ...articleTextSources(tree)]) {
      const source = normalizeWebsiteText(serviceWording(value));
      if (!source) continue;
      choices.set(`${ownerDivision || "main"}\0${source}`, { source, area: "CurrentArticle", ownerDivision });
    }
  }
  return [...choices.values()];
}
