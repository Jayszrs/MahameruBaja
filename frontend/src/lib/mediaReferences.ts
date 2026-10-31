import { fromMarkdown } from "mdast-util-from-markdown";

export type MediaKind = "image" | "video";
export type MediaReference = { url: string; kind: MediaKind };
export const mediaFilename = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:jpg|png|webp|mp4)$/;
const managedPath = /^\/(?:api\/(?:cms|articles)\/media|media)\/([a-f0-9-]+\.(?:jpg|png|webp|mp4))$/;

// Normalize only our own routes. Remote media must not make a similarly named
// private local object public merely because its path contains the same UUID.
export function localMediaUrl(value: string): string | null {
  let pathname: string;
  try {
    if (value.startsWith("//")) return null;
    const url = new URL(value, "http://cms.internal");
    if (!value.startsWith("/")) {
      const origins = [process.env.NEXT_PUBLIC_SITE_URL, process.env.WEB_ORIGIN, ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(host => `https://${host}`)].filter(Boolean);
      if (!origins.some(origin => { try { return new URL(origin!).origin === url.origin; } catch { return false; } })) return null;
    }
    pathname = decodeURIComponent(url.pathname);
  } catch { return null; }
  const match = managedPath.exec(pathname);
  return match && mediaFilename.test(match[1]) ? pathname : null;
}

export function mediaReferences(value: unknown): MediaReference[] {
  const found: MediaReference[] = [];
  function add(url: unknown, kind: MediaKind) { if (typeof url === "string" && url.trim()) found.push({ url: url.trim(), kind }); }
  function markdown(content: string) {
    const tree = fromMarkdown(content);
    const definitions = new Map<string, string>();
    type Node = { type: string; url?: string; identifier?: string; children?: Node[] };
    function walk(node: Node, visit: (node: Node) => void) { visit(node); node.children?.forEach(child => walk(child, visit)); }
    walk(tree as Node, node => { if (node.type === "definition" && node.identifier && node.url) definitions.set(node.identifier.toLowerCase(), node.url); });
    walk(tree as Node, node => { if (node.type === "image") add(node.url, "image"); else if (node.type === "imageReference" && node.identifier) add(definitions.get(node.identifier.toLowerCase()), "image"); });
  }
  function walk(node: unknown) {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    for (const [key, item] of Object.entries(record)) {
      if (["image", "imageDesktop", "imageMobile", "featureImage", "calloutImage", "photo", "authorPhoto", "logo", "hero", "poster", "src", "avatar"].includes(key)) add(item, "image");
      else if (key === "videoUrl") add(item, "video");
      else if (key === "media") add(item, record.type === "video" ? "video" : "image");
      else if (key === "content" && typeof item === "string") markdown(item);
      if (item && typeof item === "object") walk(item);
    }
  }
  walk(value);
  return found;
}

export function referencesMedia(value: unknown, url: string) { return mediaReferences(value).some(reference => localMediaUrl(reference.url) === url); }
