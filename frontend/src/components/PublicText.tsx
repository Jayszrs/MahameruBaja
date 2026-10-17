"use client";
import { Children, cloneElement, createContext, isValidElement, useContext, useMemo, type ReactNode, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { contentOwner } from "../data/divisionCms";
import { normalizeWebsiteText, websitePage, type WebsiteText } from "../data/websiteTexts";
import { serviceWording } from "../data/serviceWording";

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
// Presentation-only hints: preserve labels/actions and real carousel controls.
export function responsiveArrowHints(node: ReactNode, decorate = false): ReactNode {
  const glyphs = /([↗↘↙↖→←↑↓]\uFE0F?)/gu;
  function label(value: ReactNode): string { return Children.toArray(value).map(child => typeof child === "string" ? child : isValidElement(child) ? label((child.props as { children?: ReactNode }).children) : "").join(""); }
  return Children.map(node, child => {
    if (typeof child === "string") return decorate ? child.split(glyphs).map((part, index) => /^[↗↘↙↖→←↑↓]\uFE0F?$/u.test(part) ? <span className="public-cta-arrow" aria-hidden="true" key={index}>{part}</span> : part) : child;
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ children?: ReactNode; href?: string; to?: string; className?: string }>;
    if (typeof element.type === "string" && ["svg", "script", "style", "code", "pre", "textarea"].includes(element.type) || element.props.className === "public-cta-arrow") return element;
    const action = element.type === "a" || element.type === "button" || typeof element.props.href === "string" || typeof element.props.to === "string";
    const hint = action ? Boolean(label(element.props.children).replace(glyphs, "").trim()) : decorate;
    return element.props.children === undefined ? element : cloneElement(element, { children: responsiveArrowHints(element.props.children, hint) });
  });
}
export default function PublicText({ children }: { children: ReactNode }) {
  const texts = useContext(Texts); const path = usePathname();
  const replacements = useMemo(() => {
    const page = websitePage(path); const slug = /^\/unit\/([^/]+)/.exec(path)?.[1] || null;
    const applicable = texts.filter(row => row.published && contentOwner(row) === slug && (row.page === "all" || row.page === page));
    const result = new Map<string, string>();
    for (const row of [...applicable.filter(row => row.page === "all"), ...applicable.filter(row => row.page !== "all")]) {
      result.set(normalizeWebsiteText(row.source), row.replacement);
      result.set(normalizeWebsiteText(serviceWording(row.source)), row.replacement);
    }
    return result;
  }, [texts, path]);
  if (path.startsWith("/admin")) return <>{children}</>;
  return <>{responsiveArrowHints(translatePublicTree(children, value => serviceWording(replacements.get(normalizeWebsiteText(value)) || value)))}</>;
}
