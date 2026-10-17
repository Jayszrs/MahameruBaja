"use client";
import { useDivisionDirectory } from "./DivisionDirectory";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import SearchOverlay from "./SearchOverlay";
import QuotationDrawer from "./QuotationDrawer";
import { QuotationProvider } from "../context/QuotationContext";
import MotionController from "./MotionController";
import RouteProgress from "./RouteProgress";
import HorizontalRibbons from "./HorizontalRibbons";


export default function AppShell({ children }: { children: ReactNode }) {
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
        <Navbar division={division} onSearchOpen={() => setSearchOpen(true)} />
        <main className={`flex-1 page-enter ${pathname === "/" || pathname === `/unit/${division?.slug}` ? "pt-0" : "site-main"}`}>
          {!productPage && !articlePage && <MotionController key={pathname} />}
          {children}
        </main>
        {!productPage && !articlePage && <div className="page-scroll-progress" aria-hidden="true" />}
        <Footer division={division} />
        <WhatsAppButton />
        <QuotationDrawer />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </QuotationProvider>
  );
}
