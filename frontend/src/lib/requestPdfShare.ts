import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const lifetime = 7 * 24 * 60 * 60;
function secret() { const value = process.env.REQUEST_PDF_SECRET || process.env.ADMIN_SESSION_SECRET || ""; return Buffer.byteLength(value, "utf8") >= 32 ? value : ""; }
function signature(id: string, expires: number, key: string) { return createHmac("sha256", key).update(`request-pdf:v1:${id}:${expires}`).digest("base64url"); }
export function requestPdfLink(record: { id: string; createdAt: string }, origin: string) {
  const key = secret(); const expires = Math.floor(new Date(record.createdAt).getTime() / 1000) + lifetime;
  if (!key || !Number.isSafeInteger(expires) || expires <= Date.now() / 1000) return undefined;
  const url = new URL(`/api/requests/${encodeURIComponent(record.id)}/pdf`, origin);
  url.searchParams.set("expires", String(expires)); url.searchParams.set("token", signature(record.id, expires, key));
  return url.href;
}
export function validRequestPdfLink(id: string, expiresValue: string | null, token: string | null, now = Date.now()) {
  const key = secret(); if (!key || !/^MBI-\d{8}-[A-F0-9]{8}$/.test(id) || !expiresValue || !/^\d{10}$/.test(expiresValue) || !token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const expires = Number(expiresValue); if (expires <= now / 1000) return false;
  const expected = Buffer.from(signature(id, expires, key)); const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
