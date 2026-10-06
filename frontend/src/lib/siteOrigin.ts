export function isPreviewSite() {
  return process.env.VERCEL_ENV === "preview" || process.env.SITE_PREVIEW_MODE === "1";
}

export function siteOrigin() {
  if (isPreviewSite() && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://mahamerubaja.com";
}
