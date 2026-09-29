'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Lock, Minus, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { addBusinessDays, DELIVERY_OPTIONS, formatDeliveryDate } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import { MAX_QTY, useCart } from '@/store/cart';
import { toast } from './Toaster';
import { DealBadge, Price, Stars } from './ui';

/** Gallery + options + purchase panel for the product page. */
export default function BuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [size, setSize] = useState<string>();
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId);
  const image = variant?.image ?? product.image;
  const gallery = product.variants.length ? product.variants : [{ id: 'main', label: product.name, image: product.image }];
  const maxQty = Math.min(MAX_QTY, product.stock);

  const delivery = useMemo(() => {
    const now = new Date();
    return {
      free: formatDeliveryDate(addBusinessDays(now, DELIVERY_OPTIONS.standard.days)),
      fastest: formatDeliveryDate(addBusinessDays(now, DELIVERY_OPTIONS['next-day'].days)),
    };
  }, []);

  const addToCart = (goToCheckout = false) => {
    if (product.sizes?.length && !size) {
      setSizeError(true);
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      priceCents: product.priceCents,
      variantId: variant?.id,
      variantLabel: product.variants.length > 1 ? variant?.label : undefined,
      size,
      quantity: qty,
    });
    if (goToCheckout) router.push('/checkout');
    else toast({ title: `Added ${qty} to cart`, image, action: { href: '/cart', label: 'View cart' } });
  };

  return (
    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_300px]'>
      {/* Gallery */}
      <div className='flex flex-col-reverse items-start gap-3 sm:flex-row md:sticky md:top-32 md:self-start'>
        {gallery.length > 1 && (
          <div className='flex gap-2 sm:flex-col'>
            {gallery.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                aria-label={`Show ${v.label}`}
                className={clsx(
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition',
                  v.id === variantId ? 'ring-brand' : 'ring-slate-200 hover:ring-slate-400'
                )}
              >
                <Image src={v.image} alt='' fill sizes='64px' className='object-contain p-1.5' />
              </button>
            ))}
          </div>
        )}
        <div className='card relative aspect-square w-full min-w-0 flex-1 overflow-hidden'>
          <Image
            key={image}
            src={image}
            alt={product.name}
            fill
            priority
            sizes='(max-width: 1024px) 100vw, 40vw'
            className='object-contain p-10 animate-fade-up'
          />
        </div>
      </div>

      {/* Details */}
      <div className='space-y-4'>
        <p className='text-sm font-medium text-sky-700'>{product.category}</p>
        <h1 className='font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl'>{product.name}</h1>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='font-semibold'>{product.rating.stars.toFixed(1)}</span>
          <Stars value={product.rating.stars} size={17} />
          <span className='text-sm text-sky-700'>{product.rating.count.toLocaleString()} ratings</span>
        </div>
        <hr className='border-slate-200' />
        <DealBadge cents={product.priceCents} compareAt={product.compareAtCents} />
        <Price cents={product.priceCents} compareAt={product.compareAtCents} size='lg' />

        {product.variants.length > 1 && (
          <fieldset>
            <legend className='mb-2 text-sm'>
              Option: <b>{variant?.label}</b>
            </legend>
            <div className='flex flex-wrap gap-2'>
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  aria-pressed={v.id === variantId}
                  className={clsx(
                    'rounded-xl border px-3.5 py-2 text-sm transition',
                    v.id === variantId ? 'border-brand bg-brand-50 font-semibold' : 'border-slate-300 bg-white hover:border-slate-500'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {product.sizes && (
          <fieldset>
            <legend className='mb-2 text-sm'>
              Size: <b>{size ?? 'Select'}</b>
            </legend>
            <div className='flex flex-wrap gap-2'>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  aria-pressed={s === size}
                  className={clsx(
                    'h-10 min-w-12 rounded-xl border px-3 text-sm font-medium transition',
                    s === size ? 'border-ink bg-ink text-white' : 'border-slate-300 bg-white hover:border-slate-500'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className='mt-2 text-sm font-medium text-deal'>Please choose a size.</p>}
          </fieldset>
        )}

        <div>
          <h2 className='mb-2 font-semibold'>About this item</h2>
          <p className='text-[15px] leading-relaxed text-slate-700'>{product.description}</p>
          <ul className='mt-3 list-disc space-y-1 pl-5 text-[15px] text-slate-700'>
            {product.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Purchase panel */}
      <aside className='card h-fit space-y-4 p-5 md:col-span-2 lg:sticky lg:top-32 lg:col-span-1'>
        <Price cents={product.priceCents} compareAt={product.compareAtCents} />
        <div className='space-y-1.5 text-sm'>
          <p className='flex gap-2'>
            <Truck size={18} className='shrink-0 text-ok' />
            <span>
              <b>FREE delivery</b> <span suppressHydrationWarning>{delivery.free}</span>
            </span>
          </p>
          <p className='pl-[26px] text-slate-600'>
            Or fastest delivery <b suppressHydrationWarning>{delivery.fastest}</b>
          </p>
        </div>
        <p className={clsx('font-semibold', product.stock <= 10 ? 'text-deal' : 'text-ok')}>
          {product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In stock'}
        </p>

        <div className='flex items-center justify-between rounded-full border border-slate-300 bg-white p-1'>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className='grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100'
            aria-label='Decrease quantity'
          >
            <Minus size={16} />
          </button>
          <span className='text-sm font-semibold' aria-live='polite'>
            Qty: {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className='grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100'
            aria-label='Increase quantity'
          >
            <Plus size={16} />
          </button>
        </div>

        <button onClick={() => addToCart()} className='btn-primary w-full'>
          Add to cart
        </button>
        <button onClick={() => addToCart(true)} className='btn-dark w-full'>
          Buy now
        </button>

        <ul className='space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600'>
          <li className='flex items-center gap-2'>
            <Lock size={14} /> Secure transaction
          </li>
          <li className='flex items-center gap-2'>
            <RotateCcw size={14} /> Free 30-day returns
          </li>
          <li className='flex items-center gap-2'>
            <ShieldCheck size={14} /> 1-year warranty included
          </li>
        </ul>
      </aside>
    </div>
  );
}
