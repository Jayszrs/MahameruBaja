"use client";
import type { ReactNode } from "react";
import { NavigationGuardProvider } from "nextjs-nav-guard";
export default function AdminNavigationProvider({ children }: { children: ReactNode }) {
  return <NavigationGuardProvider>{children}</NavigationGuardProvider>;
}
