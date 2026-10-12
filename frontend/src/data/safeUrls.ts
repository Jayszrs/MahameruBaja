// Shared by validation and rendering. Browsers treat backslashes as slashes in
// HTTP URLs, so a leading slash alone does not establish a local destination.
const unsafeUrl = /[\\\u0000-\u0020\u007f]/;
const unsafeDecodedUrl = /[\\\u0000-\u001f\u007f]/;
const localOrigin = "https://cms-link.invalid";

export function safeInternalLink(value: string) {
  if (!value || unsafeUrl.test(value) || !(value.startsWith("/") || value.startsWith("#"))) return false;
  let decoded = value;
  try {
    for (let count = 0; count < 3; count++) {
      if (unsafeDecodedUrl.test(decoded) || decoded.startsWith("//")) return false;
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    return !unsafeDecodedUrl.test(decoded) && !decoded.startsWith("//") && new URL(value, localOrigin).origin === localOrigin;
  } catch { return false; }
}

export function safeHttpsUrl(value: string) {
  if (!value || unsafeUrl.test(value)) return false;
  try { const url = new URL(value); return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password; }
  catch { return false; }
}

export function safeLocalAsset(value: string, prefixes: readonly string[]) {
  if (!/^\/[a-zA-Z0-9/_ .-]+$/.test(value) || value.includes("\\")) return false;
  const parts = value.split("/").slice(1);
  return parts.every(part => part && part !== "." && part !== "..") && prefixes.some(prefix => value.startsWith(`/${prefix}/`));
}

export function isPublicBlobUrl(value: string) {
  if (!safeHttpsUrl(value)) return false;
  return new URL(value).hostname.endsWith(".public.blob.vercel-storage.com");
}
