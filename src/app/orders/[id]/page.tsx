'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import clsx from 'clsx';
import { CheckCircle2, Clock, Home, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { formatCents, formatDeliveryDate, DELIVERY_OPTIONS } from '@/lib/pricing';
import { itemProgress, STAGES } from '@/lib/tracking';
import { useHydrated } from '@/lib/useHydrated';
import { useNow } from '@/lib/useNow';
import { useOrders } from '@/store/orders';

const ICONS = [ShoppingBag, PackageCheck, Truck, Home];

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const hydrated = useHydrated();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const now = useNow(1000);

  if (!hydrated) return <div className='h-screen' />;
  if (!order) {
    return (
      <div className='container-x grid place-items-center gap-3 py-24 text-center'>
        <h1 className='font-display text-2xl font-bold'>Order not found</h1>
        <p className='text-slate-600'>Orders are stored in this browser. Try the device you ordered on.</p>
        <Link href='/orders' className='btn-primary'>
          Your orders
        </Link>
      </div>
    );
  }

  const focus = Number(search.get('item') ?? 0);
  const items = order.items.map((item, i) => ({ item, i, t: itemProgress(order, item, now) }));
  const placed = search.get('placed') === '1';

  return (
    <div className='container-x max-w-5xl space-y-6 py-8'>
      {placed && (
        <div className='card flex items-center gap-4 border-l-4 border-ok p-5 animate-fade-up'>
          <CheckCircle2 className='shrink-0 text-ok' size={32} />
          <div>
            <h1 className='font-display text-xl font-bold text-ok'>Order placed, thank you!</h1>
            <p className='text-sm text-slate-600'>
              Confirmation for order <b className='font-mono'>{order.id}</b> will be sent to {order.address.email}.
            </p>
          </div>
        </div>
      )}

      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <Link href='/orders' className='text-sm text-sky-700 hover:underline'>
            ← Your orders
          </Link>
          <h2 className='font-display text-2xl font-bold tracking-tight'>Order {order.id}</h2>
        </div>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200'>
          <Clock size={13} /> Demo tracking: 1 day passes every minute
        </span>
      </div>

      {items.map(({ item, i, t }) => (
        <section key={i} className={clsx('card p-5 sm:p-6', i === focus && 'ring-2 ring-brand/40')}>
          <div className='flex flex-wrap items-start gap-4'>
            <div className='relative h-20 w-20 shrink-0 rounded-xl bg-slate-50'>
              <Image src={item.image} alt='' fill sizes='80px' className='object-contain p-2' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className={clsx('font-display text-xl font-bold', t.stageIndex === 3 && 'text-ok')}>
                {t.stageIndex === 3 ? 'Delivered' : `Arriving ${formatDeliveryDate(new Date(item.estimatedDelivery))}`}
              </p>
              <p className='line-clamp-1 font-medium'>{item.name}</p>
              <p className='text-sm text-slate-500'>
                Qty {item.quantity} · {DELIVERY_OPTIONS[item.deliveryOptionId].label} delivery
                {t.stageIndex < 3 && ` · demo delivery in ${Math.ceil(t.msRemaining / 1000)}s`}
              </p>
            </div>
          </div>

          {/* Stepper */}
          <ol className='relative mt-8 grid grid-cols-4'>
            <div className='absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-slate-200'>
              <div className='h-full rounded-full bg-ok transition-all duration-1000' style={{ width: `${Math.min(1, t.progress) * 100}%` }} />
            </div>
            {STAGES.map((stage, s) => {
              const Icon = ICONS[s];
              const done = s <= t.stageIndex;
              return (
                <li key={stage} className='relative flex flex-col items-center gap-2 text-center'>
                  <span
                    className={clsx(
                      'grid h-10 w-10 place-items-center rounded-full ring-4 ring-white transition',
                      done ? 'bg-ok text-white' : 'bg-slate-200 text-slate-500',
                      s === t.stageIndex && s < 3 && 'animate-pulse'
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <span className={clsx('text-xs font-medium sm:text-sm', done ? 'text-slate-900' : 'text-slate-400')}>{stage}</span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <div className='grid gap-6 md:grid-cols-3'>
        <section className='card p-5'>
          <h3 className='mb-2 font-semibold'>Shipping address</h3>
          <address className='text-sm not-italic leading-relaxed text-slate-700'>
            {order.address.fullName}
            <br />
            {order.address.street}
            <br />
            {order.address.postalCode} {order.address.city}
            <br />
            {order.address.country}
          </address>
        </section>
        <section className='card p-5'>
          <h3 className='mb-2 font-semibold'>Payment method</h3>
          <p className='text-sm text-slate-700'>
            {order.payment.brand} ending in <b className='font-mono'>{order.payment.last4}</b>
          </p>
        </section>
        <section className='card p-5'>
          <h3 className='mb-2 font-semibold'>Order summary</h3>
          <dl className='space-y-1 text-sm'>
            <div className='flex justify-between'>
              <dt>Items</dt>
              <dd>{formatCents(order.totals.itemsCents)}</dd>
            </div>
            <div className='flex justify-between'>
              <dt>Shipping</dt>
              <dd>{order.totals.shippingCents ? formatCents(order.totals.shippingCents) : 'FREE'}</dd>
            </div>
            <div className='flex justify-between'>
              <dt>Tax</dt>
              <dd>{formatCents(order.totals.taxCents)}</dd>
            </div>
            <div className='flex justify-between border-t border-slate-200 pt-2 font-bold'>
              <dt>Total</dt>
              <dd>{formatCents(order.totals.totalCents)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense>
      <OrderDetail />
    </Suspense>
  );
}
