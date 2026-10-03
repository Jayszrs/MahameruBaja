import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="text-center max-w-md">
        {/* Decorative */}
        <div className="font-extrabold text-[120px] lg:text-[160px] leading-none text-graphite/10 select-none mb-0" aria-hidden="true">
          404
        </div>
        <div className="-mt-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-5 h-px bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-accent">Halaman Tidak Ditemukan</span>
            <span className="w-5 h-px bg-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-graphite mb-3">
            Halaman yang Anda cari tidak tersedia.
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Mungkin halaman ini sudah dipindahkan atau URL yang Anda masukkan tidak sesuai. Gunakan navigasi di bawah untuk kembali ke halaman yang benar.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/" className="px-5 py-2.5 bg-graphite hover:bg-navy text-white font-bold text-sm rounded-lg transition-colors">
            Beranda
          </Link>
          <Link to="/produk" className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-bold text-sm rounded-lg transition-colors">
            Lihat Produk
          </Link>
          <Link to="/kontak" className="px-5 py-2.5 border border-rule text-graphite hover:bg-surface font-semibold text-sm rounded-lg transition-colors">
            Kontak
          </Link>
        </div>
      </div>
    </div>
  );
}
