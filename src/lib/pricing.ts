// Pricing rules shared by the client (live preview) and the server (authoritative
// totals when an order is placed). The server never trusts client-sent prices.
import type { DeliveryOptionId, Totals } from './types';

export const TAX_RATE = 0.1;

export const DELIVERY_OPTIONS: Record<
  DeliveryOptionId,
  { id: DeliveryOptionId; label: string; days: number; priceCents: number }
> = {
  standard: { id: 'standard', label: 'Standard', days: 7, priceCents: 0 },
  express: { id: 'express', label: 'Express', days: 3, priceCents: 499 },
  'next-day': { id: 'next-day', label: 'Next day', days: 1, priceCents: 999 },
};

export const deliveryOptionList = Object.values(DELIVERY_OPTIONS);

export function formatCents(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function discountPercent(priceCents: number, compareAtCents: number | null) {
  if (!compareAtCents || compareAtCents <= priceCents) return 0;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

/** Adds business days (skips weekends) to a date. */
export function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

export function formatDeliveryDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

type PricedLine = { unitCents: number; quantity: number; deliveryOptionId: DeliveryOptionId };

export function computeTotals(lines: PricedLine[]): Totals {
  const itemsCents = lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
  // Shipping is charged once per delivery speed chosen, not per item.
  const speeds = new Set(lines.map((l) => l.deliveryOptionId));
  const shippingCents = [...speeds].reduce((sum, id) => sum + DELIVERY_OPTIONS[id].priceCents, 0);
  const taxCents = Math.round((itemsCents + shippingCents) * TAX_RATE);
  return { itemsCents, shippingCents, taxCents, totalCents: itemsCents + shippingCents + taxCents };
}
