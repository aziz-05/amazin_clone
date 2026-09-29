import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/catalog';
import { cardBrand, orderRequestSchema } from '@/lib/orderSchema';
import { addBusinessDays, computeTotals, DELIVERY_OPTIONS } from '@/lib/pricing';
import type { Order, OrderItem } from '@/lib/types';

// Places an order. Prices, stock and delivery dates are computed here from the
// catalog; the client only says *what* it wants, never what it costs.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      { status: 422 }
    );
  }

  const { items, address, payment } = parsed.data;
  const placedAt = new Date();
  const orderItems: OrderItem[] = [];

  for (const line of items) {
    const product = getProductById(line.productId);
    if (!product) {
      return NextResponse.json({ error: `Product ${line.productId} no longer exists` }, { status: 409 });
    }
    if (line.quantity > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} left of “${product.name}”` }, { status: 409 });
    }
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (line.variantId && !variant) {
      return NextResponse.json({ error: `Unknown option for “${product.name}”` }, { status: 422 });
    }
    if (line.size && !product.sizes?.includes(line.size)) {
      return NextResponse.json({ error: `Unknown size for “${product.name}”` }, { status: 422 });
    }
    const option = DELIVERY_OPTIONS[line.deliveryOptionId];
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: variant?.image ?? product.image,
      variantLabel: variant?.label,
      size: line.size,
      quantity: line.quantity,
      unitCents: product.priceCents,
      deliveryOptionId: option.id,
      estimatedDelivery: addBusinessDays(placedAt, option.days).toISOString(),
    });
  }

  const digits = payment.cardNumber.replace(/\D/g, '');
  const order: Order = {
    id: `AMZ-${placedAt.getTime().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
    placedAt: placedAt.toISOString(),
    items: orderItems,
    address,
    // Only the brand and last four digits ever leave this handler.
    payment: { brand: cardBrand(digits), last4: digits.slice(-4) },
    totals: computeTotals(orderItems),
  };

  return NextResponse.json({ order }, { status: 201 });
}
