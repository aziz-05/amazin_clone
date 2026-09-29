import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import BuyBox from '@/components/BuyBox';
import ProductCard from '@/components/ProductCard';
import { SectionTitle } from '@/components/ui';
import { getAllProducts, getProductBySlug, relatedProducts } from '@/lib/catalog';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description } : { title: 'Not found' };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = relatedProducts(product, 5);

  return (
    <div className='container-x py-6'>
      <nav className='mb-5 flex items-center gap-1 text-sm text-slate-500' aria-label='Breadcrumb'>
        <Link href='/' className='hover:underline'>
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href={`/search?category=${product.category}`} className='hover:underline'>
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className='truncate text-slate-700'>{product.name}</span>
      </nav>

      <BuyBox product={product} />

      {related.length > 0 && (
        <section className='mt-16'>
          <SectionTitle title='Customers also viewed' />
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
