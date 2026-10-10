"use client";
import type { Promotion } from "../data/promotions";

export function countdownParts(target: string, now: number) {
  const seconds = Math.max(0, Math.floor((Date.parse(target) - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60, ended: seconds === 0 };
}
export default function EventCountdown({ item, now }: { item: Promotion; now: number | null }) {
  if (!item.countdownAt) return null;
  const parts = now === null ? null : countdownParts(item.countdownAt, now);
  return <div className="event-countdown" aria-label={`${item.countdownLabel}, waktu Indonesia Barat`}>
    <span>{item.countdownLabel}</span>
    {parts?.ended ? <strong>Hari yang ditunggu telah tiba.</strong> : <div className="event-countdown-values">{([['days', 'Hari'], ['hours', 'Jam'], ['minutes', 'Menit'], ['seconds', 'Detik']] as const).map(([key, label]) => <div key={key}><strong>{parts ? String(parts[key]).padStart(2, '0') : '—'}</strong><small>{label}</small></div>)}</div>}
    <small>{parts && parts.days >= 30 ? `Sekitar ${Math.round(parts.days / 30.44)} bulan lagi · ` : ''}{item.countdownEstimated ? 'Perkiraan · menunggu penetapan pemerintah' : 'Waktu Indonesia Barat'}</small>
  </div>;
}
