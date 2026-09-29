'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartLine, DeliveryOptionId } from '@/lib/types';

type AddInput = Omit<CartLine, 'key' | 'deliveryOptionId' | 'quantity'> & { quantity?: number };

type CartState = {
  lines: CartLine[];
  saved: CartLine[];
  add: (input: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  setDelivery: (key: string, id: DeliveryOptionId) => void;
  remove: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  clear: () => void;
};

export const MAX_QTY = 10;

const lineKey = (i: { productId: string; variantId?: string; size?: string }) =>
  [i.productId, i.variantId ?? '', i.size ?? ''].join('|');

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      saved: [],
      add: ({ quantity = 1, ...input }) =>
        set((s) => {
          const key = lineKey(input);
          const existing = s.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l
              ),
            };
          }
          return {
            lines: [...s.lines, { ...input, key, quantity: Math.min(MAX_QTY, quantity), deliveryOptionId: 'standard' }],
          };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : l)),
        })),
      setDelivery: (key, id) =>
        set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, deliveryOptionId: id } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      saveForLater: (key) =>
        set((s) => {
          const line = s.lines.find((l) => l.key === key);
          if (!line) return s;
          return { lines: s.lines.filter((l) => l.key !== key), saved: [line, ...s.saved.filter((l) => l.key !== key)] };
        }),
      moveToCart: (key) =>
        set((s) => {
          const line = s.saved.find((l) => l.key === key);
          if (!line) return s;
          return { saved: s.saved.filter((l) => l.key !== key), lines: [...s.lines.filter((l) => l.key !== key), line] };
        }),
      removeSaved: (key) => set((s) => ({ saved: s.saved.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'amazin-cart', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
