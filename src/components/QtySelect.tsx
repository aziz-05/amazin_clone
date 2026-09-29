'use client';

import { MAX_QTY } from '@/store/cart';

export default function QtySelect({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <label className='inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-sm'>
      Qty:
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className='bg-transparent font-semibold outline-none'
        aria-label='Quantity'
      >
        {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
    </label>
  );
}
