import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import "../src/index.css";
import "../src/mobile-compact.css";
import "../src/merged-pages.css";
import "../src/article-cms.css";
import AppShell from "../src/components/AppShell";
import { isPreviewSite, siteOrigin } from "../src/lib/siteOrigin";

const siteUrl = siteOrigin();

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  robots: isPreviewSite() ? { index: false, follow: false } : undefined,
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mahameru Baja Indonesia | Material, Laser Cutting & Fabrikasi",
    template: "%s | Mahameru Baja Indonesia",
  },
  description: "Retail besi, supplier material proyek, laser cutting, CNC bending, dan fabrikasi di Tambun, Cibitung, dan Bekasi.",
  applicationName: "Mahameru Baja Indonesia",
  icons: {
    icon: "/mbi-mark.svg",
    apple: "/mbi-mark.svg",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Mahameru Baja Indonesia",
    url: siteUrl,
    images: [{ url: "/images/steel-indonesia/toko-mahameru.jpg", width: 1080, height: 608, alt: "Toko Besi Mahameru Baja" }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#101112" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${manrope.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
