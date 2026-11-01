"use client";
import { useSiteLanguage } from "./SiteLanguageProvider";
export default function LanguageMenu() {
 const {language,change,busy,enabled}=useSiteLanguage();
 return <label className="site-language" data-no-translate title={enabled?undefined:"Bahasa tambahan sedang disiapkan"}><span className="language-visible-label">Bahasa / Language</span><select aria-label="Bahasa website" value={language} aria-busy={busy} onChange={event=>change(event.target.value as "id"|"en"|"zh-CN")}><option value="id">ID</option><option value="en" disabled={!enabled}>{enabled?"English":"English · segera"}</option><option value="zh-CN" disabled={!enabled}>{enabled?"中文":"中文 · segera"}</option></select></label>;
}
