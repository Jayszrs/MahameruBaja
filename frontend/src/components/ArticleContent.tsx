"use client";
import { useMemo } from "react";
import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeArticleImage, safeArticleLink } from "../data/articleCms";
import { serviceWording } from "../data/serviceWording";
import { replaceArticleTextNodes, type ArticleTextNode } from "../data/articleWebsiteText";
import { usePublicTextReplacement } from "./PublicText";

/** The public article and admin preview share this renderer. Raw HTML is never executed. */
export default function ArticleContent({ content }: { content: string }) {
  const replace = usePublicTextReplacement();
  const textPlugin = useMemo(() => () => (tree:ArticleTextNode) => replaceArticleTextNodes(tree, replace), [replace]);
  return <div className="article-content"><Markdown remarkPlugins={[remarkGfm, textPlugin]} skipHtml
    urlTransform={(url, key) => (key === "src" ? safeArticleImage(url) : safeArticleLink(url)) ? defaultUrlTransform(url) : ""}
    components={{
      table: ({ children }) => <div className="article-table-scroll"><table>{children}</table></div>,
      img: ({ src, alt }) => typeof src === "string" && safeArticleImage(src) ? <img src={src} alt={alt || ""} loading="lazy" /> : null,
      a: ({ href, children }) => href && safeArticleLink(href) ? <a href={href} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a> : <span>{children}</span>,
    }}>{serviceWording(content)}</Markdown></div>;
}
