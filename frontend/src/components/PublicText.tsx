"use client";
import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useMemo, type ReactNode, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { contentOwner } from "../data/divisionCms";
import { normalizeWebsiteText, websitePage, type WebsiteText } from "../data/websiteTexts";
import { serviceWording } from "../data/serviceWording";
import type { SectionEdit } from "../data/sectionEdits";
import type { TextPage } from "../data/websiteTexts";
import { groupVision, groupMotto } from "../data/companyIdentity";
import type { SectionList } from "../data/sectionLists";

const Texts = createContext<WebsiteText[]>([]);
const OwnerScope = createContext<string|null|undefined>(undefined);
const SectionEdits = createContext<SectionEdit[]>([]);
const SectionScope = createContext<{ section:string; page?:TextPage } | null>(null);
const CompanyProfile=createContext({vision:groupVision,motto:groupMotto});
export const useCompanyProfile=()=>useContext(CompanyProfile);
const SectionLists = createContext<SectionList[]>([]);
export function WebsiteTextProvider({ texts, sectionEdits = [], sectionLists = [], companyVision=groupVision, companyMotto=groupMotto, children }: { texts: WebsiteText[]; sectionEdits?:SectionEdit[]; sectionLists?:SectionList[]; companyVision?:string; companyMotto?:string; children: ReactNode }) { return <CompanyProfile.Provider value={{vision:companyVision,motto:companyMotto}}><SectionLists.Provider value={sectionLists}><SectionEdits.Provider value={sectionEdits}><Texts.Provider value={texts}>{children}</Texts.Provider></SectionEdits.Provider></SectionLists.Provider></CompanyProfile.Provider>; }
export function WebsiteTextScope({ ownerDivision, children }: { ownerDivision:string|null; children:ReactNode }) { return <OwnerScope.Provider value={ownerDivision}>{children}</OwnerScope.Provider>; }
export function PublicSection({ section, page, children }: { section:string; page?:TextPage; children:ReactElement }) {
  return <SectionScope.Provider value={{ section, page }}><PublicText>{cloneElement(children as ReactElement<Record<string, unknown>>, { "data-cms-section":section })}</PublicText></SectionScope.Provider>;
}
export function useSectionEdit() {
  const edits = useContext(SectionEdits), scope = useContext(SectionScope), owner = useContext(OwnerScope), path = usePathname();
  return useCallback((kind:SectionEdit["kind"], source:string) => {
    if (!scope || path.startsWith("/admin")) return undefined;
    const slug = owner === undefined ? /^\/unit\/([^/]+)/.exec(path)?.[1] || null : owner;
    return [...edits].reverse().find(row => row.published && row.section === scope.section && row.page === (scope.page || websitePage(path)) && contentOwner(row) === slug && row.kind === kind && (kind === "text" ? normalizeWebsiteText(row.source) === normalizeWebsiteText(source) : row.source === source))?.replacement;
  }, [edits, scope, owner, path]);
}
export function useSectionList<T extends object>(key:string, fallback:T[], section?:string, page?:TextPage):T[] {
  const lists=useContext(SectionLists), scope=useContext(SectionScope), owner=useContext(OwnerScope), path=usePathname();
  if((!scope&&!section) || path.startsWith("/admin"))return fallback;
  const slug=owner===undefined?/^\/unit\/([^/]+)/.exec(path)?.[1] || null:owner;
  return (lists.find(row=>row.published&&row.key===key&&row.section===(section||scope?.section)&&row.page===(page||scope?.page||websitePage(path))&&contentOwner(row)===slug)?.rows as unknown as T[]) || fallback;
}
export function sectionListAttributes(key:string, rows:object[]) {
  return { "data-cms-list":key, "data-cms-list-rows":JSON.stringify(rows.map((row,index)=>({id:`${key}-${index}`,...row}))) };
}

// Render-time text translation only: never rewrite DOM, URLs, values, handlers or HTML.
export function translatePublicTree(node: ReactNode, replace: (text: string) => string, attribute?: (kind:SectionEdit["kind"], source:string)=>string|undefined): ReactNode {
  return Children.map(node, child => {
    if (typeof child === "string") return replace(child);
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ children?: ReactNode; placeholder?: string; title?: string }>;
    if (element.type === WebsiteTextScope || element.type === PublicSection || element.type === PublicText) return element;
    if (typeof element.type === "string" && ["script", "style", "code", "pre", "svg", "textarea"].includes(element.type)) return element;
    const props: { children?: ReactNode; placeholder?: string; title?: string } = {};
    if (element.props.children !== undefined) props.children = translatePublicTree(element.props.children, replace, attribute);
    if (typeof element.props.placeholder === "string") props.placeholder = replace(element.props.placeholder);
    if (typeof element.props.title === "string") props.title = replace(element.props.title);
    const values = element.props as Record<string, unknown>;
    for (const key of ["href", "to", "src"] as const) {
      if (typeof values[key] !== "string") continue;
      const kind = key === "src" ? element.type === "iframe" ? "embed" : "image" : "link";
      if (key === "src" && typeof element.type !== "string") continue;
      const value = attribute?.(kind, values[key] as string);
      if (value !== undefined) Object.assign(props, { [key]:value });
    }
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
    if (element.type === WebsiteTextScope || element.type === PublicSection || element.type === PublicText) return element;
    if (typeof element.type === "string" && ["svg", "script", "style", "code", "pre", "textarea"].includes(element.type) || element.props.className === "public-cta-arrow") return element;
    const action = element.type === "a" || element.type === "button" || typeof element.props.href === "string" || typeof element.props.to === "string";
    const hint = action ? Boolean(label(element.props.children).replace(glyphs, "").trim()) : decorate;
    return element.props.children === undefined ? element : cloneElement(element, { children: responsiveArrowHints(element.props.children, hint) });
  });
}
export function usePublicTextReplacement() {
  const texts = useContext(Texts); const path = usePathname(); const ownerScope = useContext(OwnerScope);
  const replacements = useMemo(() => {
    const page = websitePage(path); const slug = ownerScope === undefined ? /^\/unit\/([^/]+)/.exec(path)?.[1] || null : ownerScope;
    const applicable = texts.filter(row => row.published && contentOwner(row) === slug && (row.page === "all" || row.page === page));
    const result = new Map<string, string>();
    for (const row of [...applicable.filter(row => row.page === "all"), ...applicable.filter(row => row.page !== "all")]) {
      result.set(normalizeWebsiteText(row.source), row.replacement);
      result.set(normalizeWebsiteText(serviceWording(row.source)), row.replacement);
    }
    return result;
  }, [texts, path, ownerScope]);
  return useCallback((value:string) => {
    if(path.startsWith("/admin")) return value;
    const replacement = replacements.get(normalizeWebsiteText(value));
    return serviceWording(replacement === undefined ? value : `${value.match(/^\s*/)?.[0] || ""}${replacement}${value.match(/\s*$/)?.[0] || ""}`);
  }, [replacements, path]);
}
export default function PublicText({ children }: { children: ReactNode }) {
  const replace = usePublicTextReplacement(); const edit = useSectionEdit(); const path = usePathname();
  if (path.startsWith("/admin")) return <>{children}</>;
  return <>{responsiveArrowHints(translatePublicTree(children, value => { const current = replace(value); return serviceWording(edit("text", current) ?? current); }, edit))}</>;
}
