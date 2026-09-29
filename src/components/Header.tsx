'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { MapPin, Package, ShoppingCart } from 'lucide-react';
import { cartCount, useCart } from '@/store/cart';
import { useHydrated } from '@/lib/useHydrated';
import { Logo } from './Logo';
import SearchBox from './SearchBox';

const NAV = [
  { href: '/search?deals=1&sort=discount', label: "Today's Deals", hot: true },
  { href: '/search?category=Fashion', label: 'Fashion' },
  { href: '/search?category=Shoes', label: 'Shoes' },
  { href: '/search?category=Accessories', label: 'Accessories' },
  { href: '/search?category=Kitchen', label: 'Kitchen' },
  { href: '/search?category=Home', label: 'Home' },
  { href: '/search?category=Bath', label: 'Bath' },
  { href: '/search?sort=reviews', label: 'Best Sellers' },
];

export default function Header() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));

  return (
    <header className='sticky top-0 z-40 text-white'>
      <div className='bg-ink'>
        <div className='container-x flex flex-wrap items-center gap-x-5 gap-y-3 py-3'>
          <Link href='/' aria-label='Amazin home' className='rounded-lg px-1 py-1 hover:ring-1 hover:ring-white/40'>
            <Logo />
          </Link>

          <div className='hidden items-center gap-1.5 text-xs leading-tight text-slate-300 lg:flex'>
            <MapPin size={18} className='text-white' />
            <span>
              Deliver to
              <b className='block text-sm text-white'>Innsbruck 6020</b>
            </span>
          </div>

          <div className='order-last w-full sm:order-none sm:w-auto sm:flex-1'>
            <Suspense fallback={<div className='h-11 rounded-xl bg-white' />}>
              <SearchBox />
            </Suspense>
          </div>

          <div className='ml-auto flex items-center gap-1 sm:ml-0'>
            <Link href='/orders' className='flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:ring-1 hover:ring-white/40'>
              <Package size={20} />
              <span className='hidden leading-tight sm:block'>
                <span className='block text-xs text-slate-300'>Returns</span>
                <b>& Orders</b>
              </span>
            </Link>
            <Link
              href='/cart'
              className='relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:ring-1 hover:ring-white/40'
              aria-label={`Cart, ${hydrated ? count : 0} items`}
            >
              <span className='relative'>
                <ShoppingCart size={26} />
                <span
                  key={hydrated ? count : 0}
                  className='absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold animate-fade-up'
                >
                  {hydrated ? count : 0}
                </span>
              </span>
              <b className='hidden text-sm sm:block'>Cart</b>
            </Link>
          </div>
        </div>
      </div>
      <nav className='bg-ink-2' aria-label='Categories'>
        <div className='container-x flex gap-1 overflow-x-auto py-1.5 text-sm [scrollbar-width:none]'>
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 hover:ring-1 hover:ring-white/40 ${n.hot ? 'font-semibold text-brand' : 'text-slate-100'}`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
