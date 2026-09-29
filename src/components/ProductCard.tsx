import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import AddToCartButton from './AddToCartButton';
import { DealBadge, Price, Stars } from './ui';

export default function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <article className='card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5'>
      <Link href={`/product/${product.slug}`} className='relative block aspect-square bg-white p-6'>
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
          className='object-contain p-6 transition duration-500 group-hover:scale-105'
        />
        <span className='absolute left-3 top-3'>
          <DealBadge cents={product.priceCents} compareAt={product.compareAtCents} />
        </span>
      </Link>
      <div className='flex flex-1 flex-col gap-2 border-t border-slate-100 p-4'>
        <Link href={`/product/${product.slug}`} className='line-clamp-2 text-[15px] font-medium leading-snug hover:text-brand-600'>
          {product.name}
        </Link>
        <Stars value={product.rating.stars} count={product.rating.count} />
        <Price cents={product.priceCents} compareAt={product.compareAtCents} />
        {product.variants.length > 1 && (
          <p className='text-xs text-slate-500'>{product.variants.length} options available</p>
        )}
        {product.stock <= 10 && <p className='text-xs font-medium text-deal'>Only {product.stock} left in stock</p>}
        <div className='mt-auto pt-2'>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
