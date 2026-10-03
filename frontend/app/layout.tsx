import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import "../src/index.css";
import AppShell from "../src/components/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahamerubaja.com";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mahameru Baja Indonesia | Material, Laser Cutting & Fabrikasi",
    template: "%s | Mahameru Baja Indonesia",
  },
  description: "Retail besi, supplier material proyek, laser cutting, CNC bending, dan fabrikasi di Tambun, Cibitung, dan Bekasi.",
  applicationName: "Mahameru Baja Indonesia",
  icons: {
    icon: "/images/steel-indonesia/company-logo.jpeg",
    apple: "/images/steel-indonesia/company-logo.jpeg",
  },
  alternates: { canonical: "/" },
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
    <html lang="id" className={`${manrope.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
