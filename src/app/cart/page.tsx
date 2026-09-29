'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import QtySelect from '@/components/QtySelect';
import { computeTotals, formatCents } from '@/lib/pricing';
import { useHydrated } from '@/lib/useHydrated';
import { cartCount, useCart } from '@/store/cart';

export default function CartPage() {
  const hydrated = useHydrated();
  const { lines, saved, setQuantity, remove, saveForLater, moveToCart, removeSaved } = useCart();

  if (!hydrated) return <div className='container-x h-96 py-8' />;

  const totals = computeTotals(lines.map((l) => ({ unitCents: l.priceCents, quantity: l.quantity, deliveryOptionId: l.deliveryOptionId })));
  const count = cartCount(lines);

  return (
    <div className='container-x grid gap-6 py-8 lg:grid-cols-[1fr_320px]'>
      <div className='space-y-6'>
        <section className='card p-5 sm:p-6'>
          <h1 className='border-b border-slate-200 pb-4 font-display text-2xl font-bold tracking-tight sm:text-3xl'>Shopping cart</h1>

          {lines.length === 0 ? (
            <div className='grid place-items-center gap-3 py-16 text-center'>
              <ShoppingBag size={44} className='text-slate-300' />
              <h2 className='font-display text-xl font-bold'>Your cart is empty</h2>
              <p className='text-slate-600'>Browse today’s deals and fill it with something nice.</p>
              <Link href='/search?deals=1&sort=discount' className='btn-primary mt-2'>
                Shop deals
              </Link>
            </div>
          ) : (
            <ul className='divide-y divide-slate-200'>
              {lines.map((l) => (
                <li key={l.key} className='flex gap-4 py-5 animate-fade-up'>
                  <Link href={`/product/${l.slug}`} className='relative h-28 w-28 shrink-0 rounded-xl bg-slate-50 sm:h-36 sm:w-36'>
                    <Image src={l.image} alt={l.name} fill sizes='144px' className='object-contain p-3' />
                  </Link>
                  <div className='min-w-0 flex-1 space-y-1.5'>
                    <div className='flex justify-between gap-4'>
                      <Link href={`/product/${l.slug}`} className='line-clamp-2 font-medium hover:text-brand-600 sm:text-lg'>
                        {l.name}
                      </Link>
                      <span className='font-display text-lg font-bold'>{formatCents(l.priceCents * l.quantity)}</span>
                    </div>
                    <p className='text-sm font-medium text-ok'>In stock</p>
                    {(l.variantLabel || l.size) && (
                      <p className='text-sm text-slate-600'>
                        {l.variantLabel && (
                          <>
                            Option: <b>{l.variantLabel}</b>{' '}
                          </>
                        )}
                        {l.size && (
                          <>
                            Size: <b>{l.size}</b>
                          </>
                        )}
                      </p>
                    )}
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm'>
                      <QtySelect value={l.quantity} onChange={(n) => setQuantity(l.key, n)} />
                      <button onClick={() => remove(l.key)} className='inline-flex items-center gap-1 text-sky-700 hover:underline'>
                        <Trash2 size={14} /> Delete
                      </button>
                      <button onClick={() => saveForLater(l.key)} className='text-sky-700 hover:underline'>
                        Save for later
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {lines.length > 0 && (
            <p className='border-t border-slate-200 pt-4 text-right text-lg'>
              Subtotal ({count} item{count === 1 ? '' : 's'}): <b>{formatCents(totals.itemsCents)}</b>
            </p>
          )}
        </section>

        {saved.length > 0 && (
          <section id='saved' className='card p-5 sm:p-6'>
            <h2 className='mb-4 font-display text-xl font-bold'>Saved for later ({saved.length})</h2>
            <ul className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              {saved.map((l) => (
                <li key={l.key} className='space-y-2 rounded-xl border border-slate-200 p-3'>
                  <Link href={`/product/${l.slug}`} className='relative block aspect-square rounded-lg bg-slate-50'>
                    <Image src={l.image} alt={l.name} fill sizes='200px' className='object-contain p-3' />
                  </Link>
                  <p className='line-clamp-2 text-sm font-medium'>{l.name}</p>
                  <p className='font-bold'>{formatCents(l.priceCents)}</p>
                  <button onClick={() => moveToCart(l.key)} className='btn-ghost h-9 w-full text-xs'>
                    Move to cart
                  </button>
                  <button onClick={() => removeSaved(l.key)} className='w-full text-xs text-sky-700 hover:underline'>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {lines.length > 0 && (
        <aside className='card h-fit space-y-4 p-5 lg:sticky lg:top-32'>
          <p className='rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800'>
            ✓ Your order qualifies for <b>FREE standard delivery</b>.
          </p>
          <p className='text-lg'>
            Subtotal ({count} item{count === 1 ? '' : 's'}): <b>{formatCents(totals.itemsCents)}</b>
          </p>
          <Link href='/checkout' className='btn-primary w-full'>
            Proceed to checkout
          </Link>
          <p className='text-center text-xs text-slate-500'>Shipping and tax calculated at checkout</p>
        </aside>
      )}
    </div>
  );
}
