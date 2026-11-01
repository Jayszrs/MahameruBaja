import type { Division } from "../data/divisionCms";
export const siteDisplayName = "MBI Laser Cutting";
export const siteAlternateNames = ["MBI Laser", "Mahameru Baja", "Mahameru Baja Indonesia"];

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationSchema(base: string) {
  return {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: "Mahameru Baja Indonesia",
    alternateName: ["Mahameru Baja", "MBI"],
    url: base,
    logo: {"@type":"ImageObject",url:`${base}/apple-touch-icon.png`,width:180,height:180,caption:"Logo MBI — Mahameru Baja Indonesia"},
  };
}

export function websiteSchema(base:string){return {"@type":"WebSite","@id":`${base}/#website`,name:siteDisplayName,alternateName:siteAlternateNames,url:`${base}/`,inLanguage:"id-ID",publisher:{"@id":`${base}/#organization`}};}

export function divisionBusinessSchema(division: Division, base: string) {
  const digits = division.admins[0]?.phone.replace(/\D/g, "");
  const telephone = digits ? `+${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}` : undefined;
  return {
    "@type": division.slug.startsWith("retail-") ? "HardwareStore" : "LocalBusiness",
    "@id": `${base}/unit/${division.slug}#business`,
    name: division.name,
    ...(division.slug === "laser-cutting" ? {alternateName:["MBI Laser","MBI Laser Cutting"],logo:{"@type":"ImageObject",url:`${base}/apple-touch-icon.png`,width:180,height:180}} : {}),
    url: `${base}/unit/${division.slug}`,
    description: division.description,
    image: division.hero ? new URL(division.hero, base).href : undefined,
    telephone,
    // Keep the complete CMS address without guessing administrative fields.
    address: division.address ? { "@type": "PostalAddress", streetAddress: division.address, addressCountry: "ID" } : undefined,
    areaServed: division.area || undefined,
    hasMap: division.mapsUrl || undefined,
    parentOrganization: { "@id": `${base}/#organization` },
  };
}

export function faqSchema(base: string, path: string, faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${base}${path}#faq`,
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(base: string, path: string, name: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${base}/` },
      { "@type": "ListItem", position: 2, name, item: `${base}${path}` },
    ],
  };
}
