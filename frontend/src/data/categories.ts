export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  count: number;
  image: string;
  description: string;
  featured?: boolean;
}

export const categories: Category[] = [
  {
    id: 'besi-beton',
    slug: 'besi-beton',
    name: 'Besi Beton',
    nameEn: 'Reinforcement Bar',
    count: 12,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&auto=format',
    description: 'Besi beton polos dan ulir standar SNI untuk pondasi dan struktur beton bertulang.',
    featured: true,
  },
  {
    id: 'besi-hollow',
    slug: 'besi-hollow',
    name: 'Besi Hollow',
    nameEn: 'Square Hollow Section',
    count: 18,
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=600&fit=crop&auto=format',
    description: 'Hollow galvanis dan hitam berbagai ukuran untuk pagar, rangka, dan konstruksi ringan.',
    featured: true,
  },
  {
    id: 'besi-siku',
    slug: 'besi-siku',
    name: 'Besi Siku',
    nameEn: 'Angle Bar',
    count: 8,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop&auto=format',
    description: 'Besi siku untuk rangka konstruksi, rak, dan berbagai kebutuhan fabrikasi.',
  },
  {
    id: 'besi-unp',
    slug: 'besi-unp',
    name: 'Besi UNP',
    nameEn: 'U-Channel (UNP)',
    count: 6,
    image: 'https://images.unsplash.com/photo-1504387508099-cece71a87e17?w=800&h=600&fit=crop&auto=format',
    description: 'Profil kanal U untuk balok, rangka atap, dan struktur baja ringan menengah.',
  },
  {
    id: 'besi-cnp',
    slug: 'besi-cnp',
    name: 'Besi CNP',
    nameEn: 'C-Channel (CNP)',
    count: 6,
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop&auto=format',
    description: 'Profil kanal C untuk rangka atap, purlin, dan struktur baja ringan.',
  },
  {
    id: 'besi-wf',
    slug: 'besi-wf',
    name: 'Besi WF / H-Beam',
    nameEn: 'Wide Flange / H-Beam',
    count: 10,
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&auto=format',
    description: 'Profil WF dan H-Beam untuk struktur gedung, jembatan, dan konstruksi berat.',
    featured: true,
  },
  {
    id: 'pipa-besi',
    slug: 'pipa-besi',
    name: 'Pipa Besi',
    nameEn: 'Steel Pipe',
    count: 14,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8d05eedcd7?w=800&h=600&fit=crop&auto=format',
    description: 'Pipa hitam, galvanis, dan seamless untuk berbagai aplikasi konstruksi dan industri.',
    featured: true,
  },
  {
    id: 'plat-besi',
    slug: 'plat-besi',
    name: 'Plat Besi',
    nameEn: 'Steel Plate',
    count: 8,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&auto=format',
    description: 'Plat hitam, bordes, dan strip untuk fabrikasi, lantai, dan pelapis struktural.',
  },
  {
    id: 'wiremesh',
    slug: 'wiremesh',
    name: 'Wiremesh',
    nameEn: 'Welded Wire Mesh',
    count: 6,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop&auto=format&q=80',
    description: 'Wiremesh standar SNI untuk cor lantai, dak beton, dan panel dinding.',
  },
  {
    id: 'baja-ringan',
    slug: 'baja-ringan',
    name: 'Baja Ringan',
    nameEn: 'Light Steel Truss',
    count: 10,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop&auto=format',
    description: 'Rangka baja ringan untuk atap rumah tinggal dan komersial.',
  },
  {
    id: 'bondek',
    slug: 'bondek',
    name: 'Bondek',
    nameEn: 'Bondek Floor Deck',
    count: 4,
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=500&fit=crop&auto=format',
    description: 'Floordeck baja bergelombang untuk lantai beton komposit dan dak.',
  },
  {
    id: 'spandek',
    slug: 'spandek',
    name: 'Spandek',
    nameEn: 'Spandeck Roofing',
    count: 5,
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=500&fit=crop&auto=format',
    description: 'Atap seng gelombang dan spandek untuk bangunan industri, gudang, dan rumah.',
  },
  {
    id: 'aksesoris',
    slug: 'aksesoris',
    name: 'Aksesoris Konstruksi',
    nameEn: 'Construction Accessories',
    count: 20,
    image: 'https://images.unsplash.com/photo-1504387508099-cece71a87e17?w=800&h=500&fit=crop&auto=format',
    description: 'Baut, mur, angkur, kawat bendrat, dan aksesoris konstruksi lainnya.',
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find(c => c.slug === slug);
}
