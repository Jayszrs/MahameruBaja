"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  const addItem = useCallback((item: Omit<QuotationItem, 'qty' | 'unit' | 'notes'>) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, unit: 'batang', notes: '' }];
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
      items, isOpen, addItem, removeItem, updateQty, updateNotes,
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
