import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL === "1" ? undefined : "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  // Public limits mirror the server target; no secrets are exposed here.
  env: { NEXT_PUBLIC_CMS_VIDEO_MAX_BYTES: process.env.VERCEL === "1" ? "4000000" : "30000000" },
  images: {
    // Private CMS proxies must never enter the optimizer's shared cache.
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/mbi-mark.svg" }],
    remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }],
  },
  // The team also opens the local dev server from its Windows link-local address.
  allowedDevOrigins: ["169.254.47.102"],
  async headers() {
    const baseline = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(process.env.VERCEL_ENV === "preview" || process.env.SITE_PREVIEW_MODE === "1" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
    ];
    return [
      { source: "/:path*", headers: baseline },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
