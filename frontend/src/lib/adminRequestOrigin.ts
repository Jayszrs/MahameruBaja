import { isIP } from "node:net";
function localHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "::1" || /^127\./.test(host) || (isIP(host) === 4 && (/^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)));
}
// Compare the actual Host, never an unverified forwarded host. Public production hosts require HTTPS.
export function adminRequestOrigin(request: Request): string | null {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    const host = request.headers.get("host") || new URL(request.url).host;
    if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash || origin.host !== host.toLowerCase()) return null;
    if (!["http:", "https:"].includes(origin.protocol)) return null;
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return null;
    if (process.env.VERCEL === "1" || (process.env.NODE_ENV === "production" && !localHost(origin.hostname))) {
      if (origin.protocol !== "https:") return null;
    } else {
      const actual = new URL(request.url);
      if (actual.host === origin.host && actual.protocol !== origin.protocol) return null;
    }
    return origin.origin;
  } catch { return null; }
}
