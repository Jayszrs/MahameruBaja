"use client";
import { createContext, useCallback, useContext, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type AdminWorkspaceState = {
  dirty: boolean; busy: boolean; label?: string; disabled?: boolean; onSave?: () => void;
  secondaryLabel?: string; onSecondary?: () => void;
};
export const emptyAdminWorkspace: AdminWorkspaceState = { dirty: false, busy: false };
export const AdminWorkspaceContext = createContext<{
  register: (state: AdminWorkspaceState) => void; confirmDiscard: () => Promise<boolean>;
} | null>(null);

export function useAdminWorkspace(options: AdminWorkspaceState) {
  const context = useContext(AdminWorkspaceContext);
  if (!context) throw new Error("Admin workspace must be inside AdminShell");
  const { register, confirmDiscard } = context;
  const latest = useRef(options); latest.current = options;
  const onSave = useCallback(() => latest.current.onSave?.(), []);
  const onSecondary = useCallback(() => latest.current.onSecondary?.(), []);
  const { dirty, busy, label, disabled, secondaryLabel } = options;
  useLayoutEffect(() => {
    register({ dirty, busy, label, disabled, onSave: label ? onSave : undefined, secondaryLabel, onSecondary });
  }, [register, dirty, busy, label, disabled, secondaryLabel, onSave, onSecondary]);
  useLayoutEffect(() => () => register(emptyAdminWorkspace), [register]);
  const router = useRouter();
  return { confirmDiscard, refreshDashboard: useCallback(() => router.refresh(), [router]) };
}

export function useAdminView<T extends string>(key: string, allowed: readonly T[], fallback: T): [T, (value: T) => void] {
  const params = useSearchParams(); const router = useRouter(); const pathname = usePathname();
  const candidate = params.get(key) as T;
  const value = allowed.includes(candidate) ? candidate : fallback;
  const setValue = (next: T) => {
    const search = new URLSearchParams(params.toString()); search.set(key, next);
    router.replace(`${pathname}?${search}`, { scroll: false });
  };
  return [value, setValue];
}
export function useAdminRecordId() { return useSearchParams().get("id"); }
