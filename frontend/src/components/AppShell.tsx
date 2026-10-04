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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <QuotationProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <main className="flex-1 page-enter pt-[5.5rem] lg:pt-[8.75rem]">
          {!pathname.startsWith("/produk") && <MotionController key={pathname} />}
          {children}
        </main>
        {!pathname.startsWith("/produk") && <div className="page-scroll-progress" aria-hidden="true" />}
        <Footer />
        <WhatsAppButton />
        <QuotationDrawer />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </QuotationProvider>
  );
}
