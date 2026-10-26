import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import "../src/index.css";
import "../src/mobile-compact.css";
import "../src/merged-pages.css";
import "../src/article-cms.css";
import "../src/revision.css";
import "../src/project-gallery.css";
import "../src/unified-home.css";
import "../src/client-readability.css";
import "../src/experience-revision.css";
import "../src/public-refinement.css";
import "../src/poster-lightbox.css";
import "../src/local-business.css";
import "../src/loading-accessibility.css";
import { DivisionDirectory } from "../src/components/DivisionDirectory";
import { readPublicDivisions } from "../src/lib/divisionStore";
import { readPublicSiteContent } from "../src/lib/siteContentStore";
import { WebsiteTextProvider } from "../src/components/PublicText";
import WelcomePosters from "../src/components/WelcomePosters";
import { connection } from "next/server";
import AppShell from "../src/components/AppShell";
import AdminNavigationProvider from "../src/components/AdminNavigationProvider";
import { isPreviewSite, siteOrigin } from "../src/lib/siteOrigin";

const siteUrl = siteOrigin();

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
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
  description: "Retail besi, supplier material proyek, laser cutting, bending, fabrikasi, dan erection di Tambun, Cibitung, dan Bekasi.",
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || "e5pMHAECF9BZQf04S3uJAhmre9xFHY8eTPfEAgap_sA" },
  applicationName: "Mahameru Baja Indonesia",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64", type: "image/x-icon" },
      { url: "/favicon.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Mahameru Baja Indonesia",
    url: siteUrl,
    images: [{ url: "/images/steel-indonesia/toko-mahameru.jpg", width: 1080, height: 608, alt: "Toko Besi Mahameru Baja" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#D92323" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  const [divisions, content] = await Promise.all([readPublicDivisions(), readPublicSiteContent()]);
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${manrope.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body><DivisionDirectory divisions={divisions}><WebsiteTextProvider texts={content.websiteTexts}><AdminNavigationProvider><AppShell inventory={content.inventory}>{children}<WelcomePosters promotions={content.promotions} divisions={divisions} contacts={content.contacts} /></AppShell></AdminNavigationProvider></WebsiteTextProvider></DivisionDirectory></body>
    </html>
  );
}
