export function isPreviewSite() {
  return process.env.VERCEL_ENV === "preview" || process.env.SITE_PREVIEW_MODE === "1";
}

export function siteOrigin() {
  if (isPreviewSite() && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const configured = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://mahamerubaja.vercel.app");
  return new URL(configured).origin;
}
