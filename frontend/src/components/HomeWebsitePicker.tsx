"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import WebsiteScopePicker from "./WebsiteScopePicker";

export default function HomeWebsitePicker({ value, divisions, disabled = false }: { value: string; divisions: { slug: string; name: string }[]; disabled?:boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return <WebsiteScopePicker className="home-website-picker" value={value} divisions={divisions} disabled={disabled} onChange={selected=>{
      const next = new URLSearchParams(params.toString());
      if (selected) next.set("site", selected); else next.delete("site");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }} />;
}
