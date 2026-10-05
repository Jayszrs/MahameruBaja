"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import SearchOverlay from "./SearchOverlay";
import QuotationDrawer from "./QuotationDrawer";
import { QuotationProvider } from "../context/QuotationContext";
import MotionController from "./MotionController";
import { divisions } from "../data/divisionContent";
import { DivisionHeader, DivisionFooter } from "./DivisionChrome";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const division = divisions.find(unit => pathname === `/unit/${unit.slug}` || pathname.startsWith(`/unit/${unit.slug}/`));
  const productPage = pathname.split("/").includes("produk");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <QuotationProvider>
      <div className="min-h-screen flex flex-col">
        {division ? <DivisionHeader division={division} /> : <Navbar onSearchOpen={() => setSearchOpen(true)} />}
        <main className={`flex-1 page-enter ${pathname === "/" ? "pt-0" : division ? "unit-main" : "site-main"}`}>
          {!productPage && <MotionController key={pathname} />}
          {children}
        </main>
        {!productPage && <div className="page-scroll-progress" aria-hidden="true" />}
        {division ? <DivisionFooter division={division} /> : <Footer />}
        <WhatsAppButton />
        <QuotationDrawer />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </QuotationProvider>
  );
}
