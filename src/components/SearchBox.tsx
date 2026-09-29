'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { formatCents } from '@/lib/pricing';

type Suggestion = { id: string; slug: string; name: string; image: string; category: string; priceCents: number };

const CATEGORIES = ['All', 'Fashion', 'Shoes', 'Accessories', 'Kitchen', 'Home', 'Bath', 'Sports'];

export default function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'All');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLFormElement>(null);

  // Debounced typeahead; aborts in-flight requests when the user keeps typing.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = await res.json();
        setItems(data.items);
        setActive(-1);
      } catch {
        /* aborted */
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (active >= 0 && items[active]) {
      router.push(`/product/${items[active].slug}`);
    } else {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      if (category !== 'All') sp.set('category', category);
      router.push(`/search?${sp}`);
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form ref={boxRef} onSubmit={submit} role='search' className='relative flex h-11 w-full'>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label='Search category'
        className='hidden rounded-l-xl border-0 bg-slate-100 pl-3 pr-2 text-sm text-slate-700 outline-none sm:block'
      >
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder='Search Amazin'
        aria-label='Search products'
        role='combobox'
        aria-expanded={open && items.length > 0}
        aria-controls={listId}
        aria-autocomplete='list'
        className='min-w-0 flex-1 rounded-l-xl border-0 bg-white px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 sm:rounded-none'
      />
      <button
        type='submit'
        aria-label='Search'
        className='grid w-12 place-items-center rounded-r-xl bg-brand text-white transition hover:bg-brand-600'
      >
        <Search size={20} />
      </button>

      {open && items.length > 0 && (
        <ul
          id={listId}
          role='listbox'
          className='absolute inset-x-0 top-12 z-50 overflow-hidden rounded-xl bg-white py-1 text-slate-900 shadow-2xl ring-1 ring-slate-200 animate-fade-up'
        >
          {items.map((s, i) => (
            <li
              key={s.id}
              role='option'
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                router.push(`/product/${s.slug}`);
                setOpen(false);
              }}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${i === active ? 'bg-slate-100' : ''}`}
            >
              <Image src={s.image} alt='' width={40} height={40} className='h-10 w-10 rounded-lg object-contain' />
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-sm font-medium'>{s.name}</span>
                <span className='text-xs text-slate-500'>in {s.category}</span>
              </span>
              <span className='text-sm font-semibold'>{formatCents(s.priceCents)}</span>
            </li>
          ))}
          <li
            onMouseDown={(e) => {
              e.preventDefault();
              setActive(-1);
              submit();
            }}
            className='cursor-pointer border-t border-slate-100 px-3 py-2.5 text-sm font-medium text-sky-700 hover:bg-slate-50'
          >
            See all results for “{q.trim()}”
          </li>
        </ul>
      )}
    </form>
  );
}
