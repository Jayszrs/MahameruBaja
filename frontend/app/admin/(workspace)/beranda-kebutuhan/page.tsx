import { redirect } from "next/navigation";

export default function Page() {
  redirect("/admin/website/beranda?section=needs");
}
