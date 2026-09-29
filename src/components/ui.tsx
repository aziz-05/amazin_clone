import clsx from 'clsx';
import { Star } from 'lucide-react';
import { discountPercent, formatCents } from '@/lib/pricing';

export function Stars({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className='inline-flex items-center gap-1.5' aria-label={`Rated ${value} out of 5`}>
      <span className='inline-flex'>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className='relative' style={{ width: size, height: size }}>
              <Star size={size} className='absolute inset-0 text-amber-400' strokeWidth={1.5} />
              <span className='absolute inset-0 overflow-hidden' style={{ width: `${fill * 100}%` }}>
                <Star size={size} className='fill-amber-400 text-amber-400' strokeWidth={1.5} />
              </span>
            </span>
          );
        })}
      </span>
      {count != null && <span className='text-sm text-sky-700'>{count.toLocaleString()}</span>}
    </span>
  );
}

export function Price({
  cents,
  compareAt,
  size = 'md',
}: {
  cents: number;
  compareAt?: number | null;
  size?: 'md' | 'lg';
}) {
  const [whole, frac] = (cents / 100).toFixed(2).split('.');
  const off = discountPercent(cents, compareAt ?? null);
  return (
    <div className='flex flex-wrap items-baseline gap-x-2'>
      {off > 0 && <span className={clsx('font-medium text-deal', size === 'lg' ? 'text-2xl' : 'text-base')}>-{off}%</span>}
      <span className={clsx('font-display font-semibold tracking-tight', size === 'lg' ? 'text-3xl' : 'text-xl')}>
        <sup className='top-[-0.6em] text-[0.5em]'>$</sup>
        {Number(whole).toLocaleString()}
        <sup className='top-[-0.6em] text-[0.5em]'>{frac}</sup>
      </span>
      {off > 0 && (
        <span className='text-sm text-slate-500'>
          List: <s>{formatCents(compareAt!)}</s>
        </span>
      )}
    </div>
  );
}

export function DealBadge({ cents, compareAt }: { cents: number; compareAt: number | null }) {
  const off = discountPercent(cents, compareAt);
  if (!off) return null;
  return (
    <span className='inline-flex items-center rounded-md bg-deal px-2 py-0.5 text-xs font-semibold text-white'>
      {off}% off · Deal
    </span>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className='mb-4 flex items-end justify-between gap-4'>
      <h2 className='font-display text-xl font-bold tracking-tight sm:text-2xl'>{title}</h2>
      {action}
    </div>
  );
}
