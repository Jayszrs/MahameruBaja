import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeArticleImage, safeArticleLink } from "../data/articleCms";

/** The public article and admin preview share this renderer. Raw HTML is never executed. */
export default function ArticleContent({ content }: { content: string }) {
  return <div className="article-content"><Markdown remarkPlugins={[remarkGfm]} skipHtml
    urlTransform={(url, key) => (key === "src" ? safeArticleImage(url) : safeArticleLink(url)) ? defaultUrlTransform(url) : ""}
    components={{
      table: ({ children }) => <div className="article-table-scroll"><table>{children}</table></div>,
      img: ({ src, alt }) => typeof src === "string" && safeArticleImage(src) ? <img src={src} alt={alt || ""} loading="lazy" /> : null,
      a: ({ href, children }) => href && safeArticleLink(href) ? <a href={href} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a> : <span>{children}</span>,
    }}>{content}</Markdown></div>;
}
