'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect({ options, value }: { options: { key: string; label: string }[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className='flex items-center gap-2 text-sm'>
      <span className='text-slate-600'>Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const sp = new URLSearchParams(params);
          sp.set('sort', e.target.value);
          sp.delete('page');
          router.push(`${pathname}?${sp}`);
        }}
        className='h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm outline-none focus:border-brand'
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
