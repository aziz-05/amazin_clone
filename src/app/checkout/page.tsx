'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import QtySelect from '@/components/QtySelect';
import { addressSchema, cardBrand, paymentSchema } from '@/lib/orderSchema';
import { addBusinessDays, computeTotals, deliveryOptionList, formatCents, formatDeliveryDate } from '@/lib/pricing';
import type { Address, Order } from '@/lib/types';
import { useHydrated } from '@/lib/useHydrated';
import { cartCount, useCart } from '@/store/cart';
import { useOrders } from '@/store/orders';

type Errors = Record<string, string>;

const COUNTRIES = ['Austria', 'Germany', 'Switzerland', 'France', 'Italy', 'United Kingdom', 'United States', 'Algeria'];

const formatCard = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function Field({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={clsx('block', className)}>
      <span className='label'>{label}</span>
      <input {...props} aria-invalid={!!error} className={clsx('input', error && 'border-deal focus:border-deal focus:ring-deal/15')} />
      {error && <span className='mt-1 block text-xs font-medium text-deal'>{error}</span>}
    </label>
  );
}

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { lines, setQuantity, setDelivery, clear } = useCart();
  const addOrder = useOrders((s) => s.addOrder);

  const [address, setAddress] = useState<Address>({ fullName: '', email: '', street: '', city: 'Innsbruck', postalCode: '6020', country: 'Austria' });
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const totals = computeTotals(lines.map((l) => ({ unitCents: l.priceCents, quantity: l.quantity, deliveryOptionId: l.deliveryOptionId })));
  const dates = useMemo(
    () => Object.fromEntries(deliveryOptionList.map((o) => [o.id, formatDeliveryDate(addBusinessDays(new Date(), o.days))])),
    []
  );

  if (!hydrated) return <div className='h-screen' />;

  if (lines.length === 0) {
    return (
      <div className='container-x grid place-items-center gap-4 py-24 text-center'>
        <h1 className='font-display text-2xl font-bold'>Nothing to check out</h1>
        <p className='text-slate-600'>Your cart is empty.</p>
        <Link href='/' className='btn-primary'>
          Continue shopping
        </Link>
      </div>
    );
  }

  const setAddr = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress((a) => ({ ...a, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const next: Errors = {};
    const a = addressSchema.safeParse(address);
    if (!a.success) for (const i of a.error.issues) next[String(i.path[0])] ??= i.message;
    const p = paymentSchema.safeParse(card);
    if (!p.success) for (const i of p.error.issues) next[String(i.path[0])] ??= i.message;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    setServerError(undefined);
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            size: l.size,
            quantity: l.quantity,
            deliveryOptionId: l.deliveryOptionId,
          })),
          address,
          payment: card,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.issues?.[0]?.message ?? data.error ?? 'Something went wrong');
        return;
      }
      const order = data.order as Order;
      addOrder(order);
      clear();
      router.push(`/orders/${order.id}?placed=1`);
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const brand = cardBrand(card.cardNumber);

  return (
    <div className='min-h-screen bg-canvas'>
      <div className='container-x py-8'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='font-display text-2xl font-bold tracking-tight sm:text-3xl'>
            Checkout <span className='text-lg font-medium text-slate-500'>({cartCount(lines)} items)</span>
          </h1>
          <span className='inline-flex items-center gap-1.5 text-sm text-slate-500'>
            <Lock size={15} /> Secure checkout
          </span>
        </div>

        <div className='grid gap-6 lg:grid-cols-[1fr_340px]'>
          <div className='space-y-6'>
            {/* 1. Address */}
            <section className='card p-5 sm:p-6'>
              <h2 className='mb-5 flex items-center gap-3 font-display text-lg font-bold'>
                <span className='grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-white'>1</span>
                Shipping address
              </h2>
              <div className='grid gap-4 sm:grid-cols-2'>
                <Field label='Full name' value={address.fullName} onChange={setAddr('fullName')} error={errors.fullName} autoComplete='name' />
                <Field label='Email' type='email' value={address.email} onChange={setAddr('email')} error={errors.email} autoComplete='email' />
                <Field label='Street address' className='sm:col-span-2' value={address.street} onChange={setAddr('street')} error={errors.street} autoComplete='street-address' />
                <Field label='City' value={address.city} onChange={setAddr('city')} error={errors.city} autoComplete='address-level2' />
                <div className='grid grid-cols-2 gap-4'>
                  <Field label='Postal code' value={address.postalCode} onChange={setAddr('postalCode')} error={errors.postalCode} autoComplete='postal-code' />
                  <label className='block'>
                    <span className='label'>Country</span>
                    <select value={address.country} onChange={setAddr('country')} className='input' autoComplete='country-name'>
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </section>

            {/* 2. Items & delivery */}
            <section className='card p-5 sm:p-6'>
              <h2 className='mb-5 flex items-center gap-3 font-display text-lg font-bold'>
                <span className='grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-white'>2</span>
                Review items and delivery
              </h2>
              <ul className='space-y-4'>
                {lines.map((l) => (
                  <li key={l.key} className='rounded-xl border border-slate-200 p-4'>
                    <p className='mb-3 font-semibold text-ok'>Arrives {dates[l.deliveryOptionId]}</p>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div className='flex gap-3'>
                        <div className='relative h-20 w-20 shrink-0 rounded-lg bg-slate-50'>
                          <Image src={l.image} alt='' fill sizes='80px' className='object-contain p-2' />
                        </div>
                        <div className='space-y-1 text-sm'>
                          <p className='line-clamp-2 font-medium'>{l.name}</p>
                          {(l.variantLabel || l.size) && (
                            <p className='text-slate-500'>{[l.variantLabel, l.size && `Size ${l.size}`].filter(Boolean).join(' · ')}</p>
                          )}
                          <p className='font-bold'>{formatCents(l.priceCents)}</p>
                          <QtySelect value={l.quantity} onChange={(n) => setQuantity(l.key, n)} />
                        </div>
                      </div>
                      <fieldset className='space-y-2'>
                        <legend className='mb-2 text-sm font-semibold'>Choose a delivery option:</legend>
                        {deliveryOptionList.map((o) => (
                          <label
                            key={o.id}
                            className={clsx(
                              'flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 text-sm transition',
                              l.deliveryOptionId === o.id ? 'border-brand bg-brand-50' : 'border-slate-200 hover:border-slate-400'
                            )}
                          >
                            <input
                              type='radio'
                              name={`delivery-${l.key}`}
                              checked={l.deliveryOptionId === o.id}
                              onChange={() => setDelivery(l.key, o.id)}
                              className='mt-0.5 accent-brand'
                            />
                            <span>
                              <b className='block text-ok'>{dates[o.id]}</b>
                              <span className='text-slate-600'>
                                {o.priceCents ? `${formatCents(o.priceCents)} · ${o.label}` : `FREE · ${o.label}`}
                              </span>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. Payment */}
            <section className='card p-5 sm:p-6'>
              <h2 className='mb-2 flex items-center gap-3 font-display text-lg font-bold'>
                <span className='grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-white'>3</span>
                Payment
              </h2>
              <p className='mb-5 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900'>
                Demo store: no money is charged. Use test card <b className='font-mono'>4242 4242 4242 4242</b>, any future
                expiry and any CVC.
              </p>
              <div className='grid gap-4 sm:grid-cols-[1fr_130px_110px]'>
                <label className='block'>
                  <span className='label'>Card number</span>
                  <span className='relative block'>
                    <input
                      value={card.cardNumber}
                      onChange={(e) => {
                        setCard((c) => ({ ...c, cardNumber: formatCard(e.target.value) }));
                        setErrors((er) => ({ ...er, cardNumber: '' }));
                      }}
                      inputMode='numeric'
                      autoComplete='cc-number'
                      placeholder='1234 5678 9012 3456'
                      aria-invalid={!!errors.cardNumber}
                      className={clsx('input pr-24 font-mono', errors.cardNumber && 'border-deal')}
                    />
                    <span className='absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-xs font-semibold text-slate-500'>
                      <CreditCard size={16} /> {card.cardNumber ? brand : ''}
                    </span>
                  </span>
                  {errors.cardNumber && <span className='mt-1 block text-xs font-medium text-deal'>{errors.cardNumber}</span>}
                </label>
                <Field
                  label='Expiry'
                  value={card.expiry}
                  onChange={(e) => {
                    setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }));
                    setErrors((er) => ({ ...er, expiry: '' }));
                  }}
                  placeholder='MM/YY'
                  inputMode='numeric'
                  autoComplete='cc-exp'
                  error={errors.expiry}
                />
                <Field
                  label='CVC'
                  value={card.cvc}
                  onChange={(e) => {
                    setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }));
                    setErrors((er) => ({ ...er, cvc: '' }));
                  }}
                  placeholder='123'
                  inputMode='numeric'
                  autoComplete='cc-csc'
                  error={errors.cvc}
                />
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className='card h-fit space-y-4 p-5 lg:sticky lg:top-32'>
            <button onClick={placeOrder} disabled={submitting} className='btn-primary h-12 w-full text-base'>
              {submitting ? <Loader2 className='animate-spin' size={18} /> : <Lock size={16} />}
              {submitting ? 'Placing order…' : 'Place your order'}
            </button>
            {serverError && <p className='rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-deal'>{serverError}</p>}
            <h2 className='font-display text-lg font-bold'>Order summary</h2>
            <dl className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <dt>Items:</dt>
                <dd>{formatCents(totals.itemsCents)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt>Shipping & handling:</dt>
                <dd>{totals.shippingCents ? formatCents(totals.shippingCents) : 'FREE'}</dd>
              </div>
              <div className='flex justify-between'>
                <dt>Estimated tax (10%):</dt>
                <dd>{formatCents(totals.taxCents)}</dd>
              </div>
              <div className='flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-deal'>
                <dt>Order total:</dt>
                <dd>{formatCents(totals.totalCents)}</dd>
              </div>
            </dl>
            <p className='text-xs text-slate-500'>
              Final prices are confirmed by the server when you place your order.
            </p>
            <Link href='/' className='flex justify-center pt-2 text-slate-400 hover:text-slate-600' aria-label='Back to store'>
              <Logo className='scale-75 text-ink' />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
