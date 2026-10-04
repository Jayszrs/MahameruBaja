import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminConfigured, verifyAdminSession } from "../../../src/lib/adminAuth";

export const metadata = { title: "Masuk Portal Admin", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (verifyAdminSession(session)) redirect("/admin");
  const { error } = await searchParams;
  const ready = adminConfigured();
  return (
    <main className="admin-login-page">
      <div className="admin-login-image" aria-hidden="true"><span>MAHAMERU<br />BAJA INDONESIA</span><p>Ruang kerja untuk konten dan operasional.</p></div>
      <div className="admin-login-panel">
        <a className="admin-login-back" href="/">← Kembali ke situs</a>
        <div className="admin-login-card">
          <img src="/mbi-mark.svg" alt="Mahameru Baja Indonesia" width="58" height="58" />
          <p className="admin-login-kicker">PORTAL ADMIN / AKSES TERBATAS</p>
          <h1>Selamat datang kembali.</h1>
          <p className="admin-login-intro">Masuk untuk membuka workspace Mahameru Baja.</p>
          {error === "credentials" && <p className="admin-login-error" role="alert">Email atau kata sandi salah. Coba lagi.</p>}
          {error === "unavailable" && <p className="admin-login-error" role="alert">Akun admin belum dikonfigurasi di server.</p>}
          {!ready && <p className="admin-login-error" role="alert">Akun admin belum dikonfigurasi di server.</p>}
          <form action="/api/admin/login" method="post" className="admin-login-form">
            <label htmlFor="admin-email">Email admin</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" required placeholder="nama@perusahaan.com" />
            <label htmlFor="admin-password">Kata sandi</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" required placeholder="Masukkan kata sandi" />
            <button type="submit" disabled={!ready}>Masuk ke portal <span aria-hidden="true">→</span></button>
          </form>
          <small>Akses khusus pengelola. Aktivitas workspace saat ini masih berupa pratinjau sesi.</small>
        </div>
      </div>
    </main>
  );
}
