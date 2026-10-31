"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function HomeWebsitePicker({ value, divisions, disabled = false }: { value: string; divisions: { slug: string; name: string }[]; disabled?:boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return <label className="editor-field home-website-picker">Website yang diedit
    <select value={value} disabled={disabled} onChange={event => {
      const next = new URLSearchParams(params.toString());
      if (event.target.value) next.set("site", event.target.value); else next.delete("site");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }}>
      <option value="">Website utama · Mahameru Baja</option>
      {divisions.map(division => <option value={division.slug} key={division.slug}>{division.name}</option>)}
    </select>
  </label>;
}
