'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PackageOpen, RefreshCw } from 'lucide-react';
import { toast } from '@/components/Toaster';
import { formatCents, formatDeliveryDate } from '@/lib/pricing';
import { itemProgress } from '@/lib/tracking';
import { useHydrated } from '@/lib/useHydrated';
import { useNow } from '@/lib/useNow';
import { useCart } from '@/store/cart';
import { useOrders } from '@/store/orders';

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default function OrdersPage() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const add = useCart((s) => s.add);
  const now = useNow(5000);

  if (!hydrated) return <div className='h-screen' />;

  return (
    <div className='container-x max-w-5xl py-8'>
      <h1 className='mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl'>Your orders</h1>

      {orders.length === 0 ? (
        <div className='card grid place-items-center gap-3 px-6 py-20 text-center'>
          <PackageOpen size={44} className='text-slate-300' />
          <h2 className='font-display text-xl font-bold'>No orders yet</h2>
          <p className='text-slate-600'>When you place an order it will show up here, with live tracking.</p>
          <Link href='/' className='btn-primary mt-2'>
            Start shopping
          </Link>
        </div>
      ) : (
        <div className='space-y-6'>
          {orders.map((order) => (
            <article key={order.id} className='card overflow-hidden'>
              <header className='flex flex-wrap items-center gap-x-8 gap-y-2 bg-slate-100 px-5 py-3 text-sm'>
                <div>
                  <p className='text-xs uppercase text-slate-500'>Order placed</p>
                  <p className='font-medium'>{dateFmt.format(new Date(order.placedAt))}</p>
                </div>
                <div>
                  <p className='text-xs uppercase text-slate-500'>Total</p>
                  <p className='font-medium'>{formatCents(order.totals.totalCents)}</p>
                </div>
                <div>
                  <p className='text-xs uppercase text-slate-500'>Ship to</p>
                  <p className='font-medium'>{order.address.fullName}</p>
                </div>
                <div className='ml-auto text-right'>
                  <p className='text-xs uppercase text-slate-500'>Order #</p>
                  <Link href={`/orders/${order.id}`} className='font-mono font-medium text-sky-700 hover:underline'>
                    {order.id}
                  </Link>
                </div>
              </header>
              <ul className='divide-y divide-slate-100'>
                {order.items.map((item, i) => {
                  const t = itemProgress(order, item, now);
                  return (
                    <li key={i} className='grid gap-4 p-5 sm:grid-cols-[96px_1fr_auto]'>
                      <div className='relative h-24 w-24 rounded-xl bg-slate-50'>
                        <Image src={item.image} alt='' fill sizes='96px' className='object-contain p-2' />
                      </div>
                      <div className='space-y-1'>
                        <p className={`font-display text-lg font-bold ${t.stageIndex === 3 ? 'text-ok' : ''}`}>
                          {t.stageIndex === 3 ? 'Delivered' : `${t.stage}: arriving ${formatDeliveryDate(new Date(item.estimatedDelivery))}`}
                        </p>
                        <Link href={`/product/${item.slug}`} className='line-clamp-1 font-medium hover:text-brand-600'>
                          {item.name}
                        </Link>
                        <p className='text-sm text-slate-500'>
                          Qty {item.quantity}
                          {item.variantLabel && ` · ${item.variantLabel}`}
                          {item.size && ` · Size ${item.size}`}
                        </p>
                        <div className='mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200'>
                          <div className='h-full rounded-full bg-ok transition-all duration-700' style={{ width: `${Math.max(4, t.progress * 100)}%` }} />
                        </div>
                      </div>
                      <div className='flex flex-row gap-2 sm:flex-col'>
                        <Link href={`/orders/${order.id}?item=${i}`} className='btn-ghost h-9 text-xs'>
                          Track package
                        </Link>
                        <button
                          onClick={() => {
                            add({ productId: item.productId, slug: item.slug, name: item.name, image: item.image, priceCents: item.unitCents, size: item.size });
                            toast({ title: 'Added to cart again', image: item.image, action: { href: '/cart', label: 'View cart' } });
                          }}
                          className='btn-primary h-9 text-xs'
                        >
                          <RefreshCw size={14} /> Buy it again
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
