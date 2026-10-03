import { Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import SearchOverlay from '../components/SearchOverlay';
import QuotationDrawer from '../components/QuotationDrawer';
import { QuotationProvider } from '../context/QuotationContext';
import PageSEO from '../components/PageSEO';

export default function RootLayout() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setKey(k => k + 1);
  }, [location.pathname]);

  return (
    <QuotationProvider>
      <PageSEO />
      <div className="min-h-screen flex flex-col">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <main key={key} className="flex-1 page-enter pt-[5.5rem] lg:pt-[8.75rem]">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
        <QuotationDrawer />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </QuotationProvider>
  );
}
