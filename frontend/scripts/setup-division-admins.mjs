import { randomBytes, scryptSync } from "node:crypto";
import { readFile, appendFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(frontend, ".env.local");
const existing = await readFile(envPath, "utf8").catch(e => { if (e.code === "ENOENT") return ""; throw e; });
if (/^ADMIN_ACCOUNTS_JSON=/m.test(existing)) { console.log("Lima akun sudah dikonfigurasi. Tidak ada password yang direset."); process.exit(0); }
const divisions = ["retail-tambun", "retail-cibitung", "trading-proyek", "laser-cutting", "fabrikasi-erection"];
const credentials = [];
const accounts = divisions.map(division => {
  const email = `admin.${division}@mahamerubaja.local`;
  const password = randomBytes(18).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  credentials.push(`${division}\nEmail: ${email}\nPassword: ${password}\n`);
  return { email, division, passwordHash: `scrypt:${salt}:${scryptSync(password,salt,64).toString("hex")}` };
});
const access = path.join(frontend, "..", ".admin-divisions-access.local.txt");
await writeFile(access, `AKSES LOKAL RAHASIA — JANGAN COMMIT/SHARE PUBLIK\nLogin: http://localhost:3000/admin/login\nGanti/rotasi sebelum produksi.\n\n${credentials.join("\n")}`, { flag: "wx", mode: 0o600 });
await appendFile(envPath, `\n# Lima portal divisi; generated locally, password hashes only.\nADMIN_ACCOUNTS_JSON='${JSON.stringify(accounts)}'\n${/^ADMIN_SESSION_SECRET=/m.test(existing) ? "" : `ADMIN_SESSION_SECRET=${randomBytes(32).toString("hex")}\n`}`, { mode: 0o600 });
console.log("Lima akun dibuat. Kredensial hanya di .admin-divisions-access.local.txt (ignored Git). Restart Next.js.");
