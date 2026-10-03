import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import ProjectsPage from './pages/ProjectsPage';
import InformasiPage from './pages/InformasiPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import KontakPage from './pages/KontakPage';
import QuotationPage from './pages/QuotationPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import LaserCuttingPage from './pages/LaserCuttingPage';
import BusinessUnitPage from './pages/BusinessUnitPage';
import OperationsDemoPage from './pages/OperationsDemoPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'tentang-kami', Component: AboutPage },
      { path: 'produk', Component: ProductsPage },
      { path: 'produk/:slug', Component: ProductDetailPage },
      { path: 'layanan', Component: ServicesPage },
      { path: 'laser-cutting', Component: LaserCuttingPage },
      { path: 'unit/:slug', Component: BusinessUnitPage },
      { path: 'admin-demo', Component: OperationsDemoPage },
      { path: 'proyek', Component: ProjectsPage },
      { path: 'informasi', Component: InformasiPage },
      { path: 'informasi/:slug', Component: ArticleDetailPage },
      { path: 'kontak', Component: KontakPage },
      { path: 'minta-penawaran', Component: QuotationPage },
      { path: 'cari', Component: SearchPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
