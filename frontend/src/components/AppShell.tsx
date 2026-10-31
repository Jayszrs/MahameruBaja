"use client";
import { useDivisionDirectory } from "./DivisionDirectory";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import QuotationDrawer from "./QuotationDrawer";
import { QuotationProvider } from "../context/QuotationContext";
import MotionController from "./MotionController";
import RouteProgress from "./RouteProgress";
import HorizontalRibbons from "./HorizontalRibbons";
import type { InventoryItem } from "../data/inventory";
import { appearanceForSite, type WebsiteAppearance } from "../data/websiteAppearance";

const SearchOverlay = dynamic(() => import("./SearchOverlay"), {
  ssr: false,
  loading: () => <p className="search-loading-status" role="status">Membuka pencarian…</p>,
});

export default function AppShell({ children, inventory = [], appearance = [] }: { children: ReactNode; inventory?: InventoryItem[]; appearance?: WebsiteAppearance[] }) {
  const { divisions } = useDivisionDirectory();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const division = divisions.find(unit => pathname === `/unit/${unit.slug}` || pathname.startsWith(`/unit/${unit.slug}/`));
  const productPage = pathname.split("/").includes("produk");
  const articlePage = pathname.split("/").includes("informasi");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <QuotationProvider>
      <div className="public-site min-h-screen flex flex-col">
        <RouteProgress />
        <HorizontalRibbons />
        <Navbar division={division} memberships={appearanceForSite(appearance, division?.slug).memberships} onSearchOpen={() => setSearchOpen(true)} />
        <main className={`flex-1 page-enter ${pathname === "/" || pathname === `/unit/${division?.slug}` ? "pt-0" : "site-main"}`}>
          {!productPage && !articlePage && <MotionController key={pathname} />}
          {children}
        </main>
        {!productPage && !articlePage && <div className="page-scroll-progress" aria-hidden="true" />}
        <Footer division={division} />
        <WhatsAppButton />
        <QuotationDrawer />
        {searchOpen && <SearchOverlay open onClose={() => setSearchOpen(false)} inventory={inventory} />}
      </div>
    </QuotationProvider>
  );
}
