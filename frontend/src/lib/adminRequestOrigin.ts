// Next's internal URL can use localhost even when the browser connects over LAN.
// Compare against the actual Host header, never an unverified forwarded host.
export function adminRequestOrigin(request: Request): string | null {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    const host = request.headers.get("host") || new URL(request.url).host;
    return ["http:", "https:"].includes(origin.protocol) && origin.host === host ? origin.origin : null;
  } catch { return null; }
}
