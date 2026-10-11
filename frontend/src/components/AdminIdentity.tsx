"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { AdminIdentity } from "../data/adminAccount";
const Context = createContext<AdminIdentity | null>(null);
export function AdminIdentityProvider({ identity, children }: { identity: AdminIdentity; children: ReactNode }) { return <Context.Provider value={identity}>{children}</Context.Provider>; }
export function useAdminIdentity() { const identity = useContext(Context); if(!identity) throw new Error("Admin identity is unavailable"); return identity; }
