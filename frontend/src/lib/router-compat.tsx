"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { useEffect } from "react";

export function Link({ to, ...props }: { to: string; [key: string]: any }) {
  return <NextLink href={to} {...props} />;
}

export function useLocation() {
  return { pathname: usePathname() };
}

let pendingNav: string | null = null;
let lastNavTime = 0;

export function useNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    pendingNav = null;
  }, [pathname]);

  return (href: string) => {
    const now = Date.now();
    if (pendingNav === href || (pendingNav && now - lastNavTime < 300)) return;
    pendingNav = href;
    lastNavTime = now;
    setTimeout(() => {
      if (pendingNav === href) pendingNav = null;
    }, 8000);
    router.push(href);
  };
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useNextParams() as T;
}

export function useSearchParams(): [
  ReturnType<typeof useNextSearchParams>,
  (values: Record<string, string>) => void,
] {
  const params = useNextSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return [params, (values) => router.push(`${pathname}?${new URLSearchParams(values)}`)];
}

export function Navigate({ to }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => router.replace(to), [router, to]);
  return null;
}
