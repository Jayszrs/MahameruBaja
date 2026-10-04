import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // The team also opens the local dev server from its Windows link-local address.
  allowedDevOrigins: ["169.254.47.102"],
};

export default nextConfig;
