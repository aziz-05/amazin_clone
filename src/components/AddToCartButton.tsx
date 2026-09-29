'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { toast } from './Toaster';

/** Quick add from a product card. Products that need a choice (size) go to the product page. */
export default function AddToCartButton({ product }: { product: Pick<Product, 'id' | 'slug' | 'name' | 'image' | 'priceCents' | 'sizes' | 'stock'> }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    if (product.sizes?.length) {
      router.push(`/product/${product.slug}`);
      return;
    }
    add({ productId: product.id, slug: product.slug, name: product.name, image: product.image, priceCents: product.priceCents });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    toast({ title: 'Added to cart', image: product.image, action: { href: '/cart', label: 'View cart' } });
  };

  return (
    <button onClick={onClick} className='btn-primary h-10 w-full' disabled={product.stock === 0}>
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {product.sizes?.length ? 'Choose size' : added ? 'Added' : 'Add to cart'}
    </button>
  );
}
