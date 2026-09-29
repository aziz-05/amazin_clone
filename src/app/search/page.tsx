import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import clsx from 'clsx';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import { Stars } from '@/components/ui';
import { parseSearchParams, searchProducts, SORTS } from '@/lib/catalog';

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const p = parseSearchParams(await searchParams);
  return { title: p.q ? `Results for “${p.q}”` : p.category ?? 'All products' };
}

const PRICE_RANGES = [
  { label: 'Under $10', min: undefined, max: 10 },
  { label: '$10 to $25', min: 10, max: 25 },
  { label: '$25 to $50', min: 25, max: 50 },
  { label: '$50 & above', min: 50, max: undefined },
];

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const params = parseSearchParams(raw);
  const result = searchProducts(params);

  // Builds a URL from the current filters with some keys changed or removed.
  const href = (changes: Record<string, string | number | undefined | null>) => {
    const sp = new URLSearchParams();
    const current = { q: params.q, category: params.category, min: params.min, max: params.max, rating: params.rating, deals: params.deals ? 1 : undefined, sort: params.sort !== 'featured' ? params.sort : undefined };
    for (const [k, v] of Object.entries({ ...current, page: undefined, ...changes })) {
      if (v != null && v !== '') sp.set(k, String(v));
    }
    return `/search?${sp}`;
  };

  const active: { label: string; href: string }[] = [];
  if (params.q) active.push({ label: `“${params.q}”`, href: href({ q: undefined }) });
  if (params.category) active.push({ label: params.category, href: href({ category: undefined }) });
  if (params.min != null || params.max != null)
    active.push({ label: `$${params.min ?? 0}–${params.max != null ? `$${params.max}` : '∞'}`, href: href({ min: undefined, max: undefined }) });
  if (params.rating) active.push({ label: `${params.rating}★ & up`, href: href({ rating: undefined }) });
  if (params.deals) active.push({ label: 'Deals', href: href({ deals: undefined }) });

  const filters = (
    <div className='space-y-7 text-sm'>
      <div>
        <h3 className='mb-2 font-semibold'>Category</h3>
        <ul className='space-y-1'>
          <li>
            <Link href={href({ category: undefined })} className={clsx('hover:text-brand-600', !params.category && 'font-semibold')}>
              All departments
            </Link>
          </li>
          {result.facets.map((f) => (
            <li key={f.category}>
              <Link
                href={href({ category: f.category })}
                className={clsx('flex justify-between hover:text-brand-600', params.category === f.category && 'font-semibold text-brand-600')}
              >
                {f.category} <span className='text-slate-400'>{f.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className='mb-2 font-semibold'>Customer reviews</h3>
        <ul className='space-y-1.5'>
          {[4, 3].map((r) => (
            <li key={r}>
              <Link href={href({ rating: params.rating === r ? undefined : r })} className={clsx('flex items-center gap-1.5', params.rating === r && 'font-semibold')}>
                <Stars value={r} /> & up
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className='mb-2 font-semibold'>Price</h3>
        <ul className='space-y-1'>
          {PRICE_RANGES.map((r) => {
            const on = params.min === r.min && params.max === r.max;
            return (
              <li key={r.label}>
                <Link href={href(on ? { min: undefined, max: undefined } : { min: r.min, max: r.max })} className={clsx('hover:text-brand-600', on && 'font-semibold text-brand-600')}>
                  {r.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <form action='/search' className='mt-3 flex items-center gap-2'>
          {params.q && <input type='hidden' name='q' value={params.q} />}
          {params.category && <input type='hidden' name='category' value={params.category} />}
          <input name='min' type='number' min={0} placeholder='$ Min' defaultValue={params.min} className='input h-9 w-20 px-2 text-sm' aria-label='Minimum price' />
          <input name='max' type='number' min={0} placeholder='$ Max' defaultValue={params.max} className='input h-9 w-20 px-2 text-sm' aria-label='Maximum price' />
          <button className='h-9 rounded-lg bg-slate-200 px-3 font-medium hover:bg-slate-300'>Go</button>
        </form>
      </div>
      <div>
        <h3 className='mb-2 font-semibold'>Deals & discounts</h3>
        <Link href={href({ deals: params.deals ? undefined : 1 })} className='flex items-center gap-2'>
          <span className={clsx('grid h-4 w-4 place-items-center rounded border', params.deals ? 'border-brand bg-brand text-white' : 'border-slate-400')}>
            {params.deals && '✓'}
          </span>
          Today’s deals
        </Link>
      </div>
    </div>
  );

  return (
    <div className='container-x py-6'>
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4'>
        <p className='text-sm text-slate-700'>
          {result.total === 0 ? 'No results' : `${(result.page - 1) * 12 + 1}–${Math.min(result.page * 12, result.total)} of ${result.total} results`}
          {params.q && (
            <>
              {' '}for <b className='text-brand-600'>“{params.q}”</b>
            </>
          )}
        </p>
        <Suspense>
          <SortSelect options={SORTS} value={params.sort ?? 'featured'} />
        </Suspense>
      </div>

      {active.length > 0 && (
        <div className='mb-5 flex flex-wrap items-center gap-2'>
          {active.map((a) => (
            <Link key={a.label} href={a.href} className='inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-slate-300 hover:ring-slate-500'>
              {a.label} <X size={14} />
            </Link>
          ))}
          <Link href='/search' className='text-sm font-medium text-sky-700 hover:underline'>
            Clear all
          </Link>
        </div>
      )}

      <div className='grid gap-8 lg:grid-cols-[220px_1fr]'>
        <aside className='hidden lg:block'>{filters}</aside>
        <details className='card p-4 lg:hidden'>
          <summary className='flex cursor-pointer list-none items-center gap-2 font-semibold'>
            <SlidersHorizontal size={18} /> Filters
          </summary>
          <div className='mt-4'>{filters}</div>
        </details>

        <div>
          {result.total === 0 ? (
            <div className='card grid place-items-center gap-3 px-6 py-20 text-center'>
              <SearchX size={40} className='text-slate-400' />
              <h2 className='font-display text-xl font-bold'>No matching products</h2>
              <p className='max-w-sm text-slate-600'>Try a different search term, or remove some filters.</p>
              <Link href='/search' className='btn-ghost mt-2'>
                Browse everything
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'>
              {result.items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          )}

          {result.pages > 1 && (
            <nav className='mt-10 flex justify-center gap-2' aria-label='Pagination'>
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={href({ page: n })}
                  aria-current={n === result.page ? 'page' : undefined}
                  className={clsx('grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold', n === result.page ? 'bg-ink text-white' : 'bg-white ring-1 ring-slate-300 hover:ring-slate-500')}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
