import { homeSections, serviceSections } from "../data/pageVisibility";
import type { WebsiteAppearance } from "../data/websiteAppearance";
export default function PageSectionVisibility({ appearance, page }: { appearance:WebsiteAppearance; page:"home"|"services"|null }) {
  const selectors = page === "home" ? homeSections.filter(section=>appearance.hiddenHomeSections.includes(section.id)).map(section=>`.unified-home [data-home-section="${section.id}"]`) : page === "services" ? serviceSections.filter(section=>appearance.hiddenServiceSections.includes(section.id)).map(section=>section.selector) : [];
  return selectors.length ? <style>{`${selectors.join(",")} { display:none !important; }`}</style> : null;
}
