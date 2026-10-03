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

export function useNavigate() {
  const router = useRouter();
  return (href: string) => router.push(href);
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
