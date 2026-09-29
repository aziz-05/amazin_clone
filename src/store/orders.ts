'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Order } from '@/lib/types';

type OrdersState = {
  orders: Order[];
  addOrder: (order: Order) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    { name: 'amazin-orders', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);
