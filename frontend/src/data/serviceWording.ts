// Display-only wording policy. Stored CMS text, identifiers and asset URLs stay intact.
export function serviceWording(value: string) {
  return value.replace(/\bCNC[ \t]+/gi, "").replace(/[ \t]+CNC\b/gi, "").replace(/^CNC$/i, "");
}
const textKeys = new Set(["name", "title", "label", "category", "description", "summary", "excerpt", "caption", "intro", "mission", "aboutHeadline", "values", "process", "eyebrow", "accent", "alt", "imageAlt", "visualNote", "benefit", "appliesTo", "terms", "ctaLabel", "content", "question", "answer", "offerings", "messages"]);
export function publicServiceWording<T>(value: T, key = ""): T {
  if (key === "offeringDescriptions" && value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([offering, description]) => [serviceWording(offering), typeof description === "string" ? serviceWording(description) : description])) as T;
  }
  if (typeof value === "string") return (textKeys.has(key) ? serviceWording(value) : value) as T;
  if (Array.isArray(value)) return value.map(item => publicServiceWording(item, key)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, publicServiceWording(item, field)])) as T;
  return value;
}
