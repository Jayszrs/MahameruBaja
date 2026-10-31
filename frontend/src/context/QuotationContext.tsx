"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { z } from 'zod';
import { safeHttpsUrl, safeLocalAsset } from '../data/safeUrls';

export interface QuotationItem {
  id: string;
  slug: string;
  name: string;
  sku: string;
  shortSpec: string;
  image: string;
  qty: number;
  unit: string;
  notes: string;
}

interface QuotationCtx {
  ready: boolean;
  items: QuotationItem[];
  isOpen: boolean;
  addItem: (item: Omit<QuotationItem, 'qty' | 'unit' | 'notes'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearItems: () => void;
  setOpen: (v: boolean) => void;
  count: number;
  hasItem: (id: string) => boolean;
}

const QuotationContext = createContext<QuotationCtx | null>(null);
const storageKey = 'mahameru:quotation:v1';
const savedItems = z.array(z.object({
  id: z.string().min(1).max(100), slug: z.string().min(1).max(200), name: z.string().min(1).max(200),
  sku: z.string().max(100), shortSpec: z.string().max(1000), image: z.string().max(2000).refine(value => safeHttpsUrl(value) || safeLocalAsset(value, ['images', 'media', 'api/cms/media'])),
  qty: z.number().int().min(1).max(100000000), unit: z.string().max(32), notes: z.string().max(500),
})).max(50);

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  useEffect(() => {
    try { const value = localStorage.getItem(storageKey); if (value) { const parsed = savedItems.safeParse(JSON.parse(value)); if (parsed.success) setItems(parsed.data); } } catch { /* The cart still works when browser storage is unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch { /* Keep the active cart usable. */ } } }, [items, ready]);

  const addItem = useCallback((item: Omit<QuotationItem, 'qty' | 'unit' | 'notes'>) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (prev.length >= 50) return prev;
      return [...prev, { ...item, qty: 1, unit: /plat|lembar|wiremesh|bondek|spandek|upvc/i.test(`${item.name} ${item.shortSpec}`) ? 'lembar' : 'batang', notes: '' }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
  }, []);

  const clearItems = useCallback(() => setItems([]), []);

  const hasItem = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return (
    <QuotationContext.Provider value={{
      items, ready, isOpen, addItem, removeItem, updateQty, updateNotes,
      clearItems, setOpen, count: items.length, hasItem,
    }}>
      {children}
    </QuotationContext.Provider>
  );
}

export function useQuotation() {
  const ctx = useContext(QuotationContext);
  if (!ctx) throw new Error('useQuotation must be inside QuotationProvider');
  return ctx;
}
