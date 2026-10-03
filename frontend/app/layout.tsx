import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../src/index.css";
import AppShell from "../src/components/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahamerubaja.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Mahameru Baja", template: "%s | Mahameru Baja" },
  description: "Supplier material baja, retail besi, trading proyek, laser cutting, CNC bending, dan fabrikasi di Bekasi.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Mahameru Baja",
    url: siteUrl,
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#101112" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
