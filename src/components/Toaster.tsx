'use client';

import Image from 'next/image';
import Link from 'next/link';
import { create } from 'zustand';
import { CheckCircle2, X } from 'lucide-react';

type Toast = { id: number; title: string; image?: string; action?: { href: string; label: string } };

const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, 'id'>) => void; dismiss: (id: number) => void }>(
  (set) => ({
    toasts: [],
    push: (t) => {
      const id = Date.now() + Math.random();
      set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3500);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  })
);

export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t);

export default function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4' aria-live='polite'>
      {toasts.map((t) => (
        <div
          key={t.id}
          className='pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink p-3 pr-2 text-white shadow-2xl animate-toast'
        >
          {t.image ? (
            <Image src={t.image} alt='' width={44} height={44} className='h-11 w-11 rounded-lg bg-white object-contain p-1' />
          ) : (
            <CheckCircle2 className='text-emerald-400' />
          )}
          <p className='flex-1 text-sm font-medium'>{t.title}</p>
          {t.action && (
            <Link href={t.action.href} className='rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20'>
              {t.action.label}
            </Link>
          )}
          <button onClick={() => dismiss(t.id)} aria-label='Dismiss' className='rounded-full p-1.5 text-slate-400 hover:text-white'>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
