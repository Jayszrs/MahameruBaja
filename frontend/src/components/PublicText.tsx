"use client";
import { Children, cloneElement, createContext, isValidElement, useContext, useMemo, type ReactNode, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { contentOwner } from "../data/divisionCms";
import { normalizeWebsiteText, websitePage, type WebsiteText } from "../data/websiteTexts";

const Texts = createContext<WebsiteText[]>([]);
export function WebsiteTextProvider({ texts, children }: { texts: WebsiteText[]; children: ReactNode }) { return <Texts.Provider value={texts}>{children}</Texts.Provider>; }

// Render-time text translation only: never rewrite DOM, URLs, values, handlers or HTML.
export function translatePublicTree(node: ReactNode, replace: (text: string) => string): ReactNode {
  return Children.map(node, child => {
    if (typeof child === "string") return replace(child);
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ children?: ReactNode; placeholder?: string; title?: string }>;
    if (typeof element.type === "string" && ["script", "style", "code", "pre", "svg", "textarea"].includes(element.type)) return element;
    const props: { children?: ReactNode; placeholder?: string; title?: string } = {};
    if (element.props.children !== undefined) props.children = translatePublicTree(element.props.children, replace);
    if (typeof element.props.placeholder === "string") props.placeholder = replace(element.props.placeholder);
    if (typeof element.props.title === "string") props.title = replace(element.props.title);
    return cloneElement(element, props);
  });
}
export default function PublicText({ children }: { children: ReactNode }) {
  const texts = useContext(Texts); const path = usePathname();
  const replacements = useMemo(() => {
    const page = websitePage(path); const slug = /^\/unit\/([^/]+)/.exec(path)?.[1] || null;
    const applicable = texts.filter(row => row.published && contentOwner(row) === slug && (row.page === "all" || row.page === page));
    const result = new Map<string, string>();
    for (const row of [...applicable.filter(row => row.page === "all"), ...applicable.filter(row => row.page !== "all")]) result.set(normalizeWebsiteText(row.source), row.replacement);
    return result;
  }, [texts, path]);
  if (path.startsWith("/admin") || !replacements.size) return <>{children}</>;
  return <>{translatePublicTree(children, value => replacements.get(normalizeWebsiteText(value)) || value)}</>;
}
