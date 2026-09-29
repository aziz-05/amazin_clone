import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgePercent, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { SectionTitle } from '@/components/ui';
import { CATEGORIES, getAllProducts, searchProducts } from '@/lib/catalog';

const PERKS = [
  { icon: Truck, title: 'Free delivery', text: 'On every order with standard shipping' },
  { icon: RotateCcw, title: '30-day returns', text: 'Changed your mind? Send it back free' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Card details never stored' },
  { icon: BadgePercent, title: 'Daily deals', text: 'Up to 25% off selected items' },
];

export default function Home() {
  const all = getAllProducts();
  const deals = searchProducts({ deals: true, sort: 'discount', perPage: 5 }).items;
  const bestSellers = searchProducts({ sort: 'reviews', perPage: 10 }).items;
  const topRated = searchProducts({ sort: 'rating', perPage: 5 }).items;
  const categoryTiles = CATEGORIES.map((c) => ({
    name: c,
    items: all.filter((p) => p.category === c).slice(0, 4),
    count: all.filter((p) => p.category === c).length,
  })).filter((c) => c.count >= 3);
  const heroProducts = [all[5], all[12], all[3]].filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className='relative overflow-hidden bg-gradient-to-br from-ink via-[#1b2340] to-[#3b1f3a] text-white'>
        <div className='pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/30 blur-3xl' />
        <div className='pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl' />
        <div className='container-x relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20'>
          <div className='space-y-6 animate-fade-up'>
            <span className='inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium ring-1 ring-white/20'>
              🔥 Autumn sale: up to 25% off
            </span>
            <h1 className='font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'>
              Everything you need,
              <br />
              <span className='text-brand'>delivered fast.</span>
            </h1>
            <p className='max-w-md text-lg text-slate-300'>
              Fashion, kitchen and home essentials at fair prices. Free delivery and free returns on every order.
            </p>
            <div className='flex flex-wrap gap-3'>
              <Link href='/search?deals=1&sort=discount' className='btn-primary h-12 px-6'>
                Shop today’s deals <ArrowRight size={18} />
              </Link>
              <Link href='/search' className='btn h-12 bg-white/10 px-6 text-white ring-1 ring-white/25 hover:bg-white/20'>
                Browse all
              </Link>
            </div>
          </div>
          <div className='relative hidden h-80 md:block'>
            {heroProducts.map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className='absolute rounded-3xl bg-white p-4 shadow-2xl transition hover:-translate-y-1 hover:rotate-0'
                style={{
                  width: i === 1 ? 240 : 190,
                  left: ['4%', '34%', '66%'][i],
                  top: ['18%', '0%', '26%'][i],
                  transform: `rotate(${[-6, 2, 7][i]}deg)`,
                  zIndex: i === 1 ? 2 : 1,
                }}
              >
                <Image src={p.image} alt={p.name} width={240} height={240} className='aspect-square object-contain' priority />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className='border-b border-slate-200 bg-white'>
        <div className='container-x grid grid-cols-2 gap-4 py-5 lg:grid-cols-4'>
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className='flex items-center gap-3'>
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600'>
                <Icon size={20} />
              </span>
              <span className='text-sm'>
                <b className='block'>{title}</b>
                <span className='text-slate-500'>{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className='container-x space-y-14 py-10'>
        {/* Categories */}
        <section>
          <SectionTitle title='Shop by category' />
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {categoryTiles.slice(0, 4).map((c) => (
              <Link key={c.name} href={`/search?category=${c.name}`} className='card group p-5 transition hover:shadow-lg'>
                <h3 className='mb-3 font-display text-lg font-bold'>{c.name}</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {c.items.map((p) => (
                    <div key={p.id} className='relative aspect-square overflow-hidden rounded-xl bg-slate-50'>
                      <Image src={p.image} alt='' fill sizes='120px' className='object-contain p-3 transition group-hover:scale-105' />
                    </div>
                  ))}
                </div>
                <span className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-700 group-hover:underline'>
                  See all {c.count} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Deals */}
        <section>
          <SectionTitle
            title='Today’s deals'
            action={
              <Link href='/search?deals=1&sort=discount' className='text-sm font-medium text-sky-700 hover:underline'>
                See all deals
              </Link>
            }
          />
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
            {deals.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </section>

        {/* Banner */}
        <section className='relative overflow-hidden rounded-3xl bg-brand px-8 py-10 text-white sm:px-12'>
          <div className='absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/15' />
          <div className='relative max-w-xl space-y-3'>
            <h2 className='font-display text-3xl font-extrabold tracking-tight'>Need it tomorrow?</h2>
            <p className='text-white/90'>
              Pick next-day delivery at checkout. Every order can be tracked live from your orders page.
            </p>
            <Link href='/search?sort=reviews' className='btn mt-2 bg-white text-ink hover:bg-slate-100'>
              Shop best sellers
            </Link>
          </div>
        </section>

        {/* Best sellers */}
        <section>
          <SectionTitle title='Best sellers' />
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Top rated */}
        <section>
          <SectionTitle title='Top rated by customers' />
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
            {topRated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
