"use client";
import { usePathname } from "next/navigation";
export default function LanguageMenu() {
  const pathname = usePathname();
  function translate(language: string) {
    if (!language) return;
    const publicUrl = new URL(pathname + window.location.search, window.location.origin).href;
    window.open(`https://translate.google.com/translate?sl=id&tl=${language}&u=${encodeURIComponent(publicUrl)}`, "_blank", "noopener,noreferrer");
  }
  return <label className="site-language"><span className="language-visible-label">Bahasa / Language</span><select aria-label="Bahasa — terjemahkan halaman melalui Google" value="" onChange={event => translate(event.target.value)}><option value="">ID</option><option value="en">English · Google</option><option value="zh-CN">中文 · Google</option></select></label>;
}
