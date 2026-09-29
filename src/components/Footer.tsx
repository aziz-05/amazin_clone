import Link from 'next/link';
import { Logo } from './Logo';

const COLS = [
  {
    title: 'Shop',
    links: [
      ['Today’s Deals', '/search?deals=1&sort=discount'],
      ['Best Sellers', '/search?sort=reviews'],
      ['Top Rated', '/search?sort=rating'],
      ['All products', '/search'],
    ],
  },
  {
    title: 'Categories',
    links: [
      ['Fashion', '/search?category=Fashion'],
      ['Shoes', '/search?category=Shoes'],
      ['Kitchen', '/search?category=Kitchen'],
      ['Home', '/search?category=Home'],
    ],
  },
  {
    title: 'Your account',
    links: [
      ['Your orders', '/orders'],
      ['Your cart', '/cart'],
      ['Saved for later', '/cart#saved'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className='mt-16 bg-ink text-slate-300'>
      <a href='#top' className='block bg-ink-2 py-3.5 text-center text-sm text-white hover:bg-slate-700'>
        Back to top
      </a>
      <div className='container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='space-y-3'>
          <span className='text-white'>
            <Logo />
          </span>
          <p className='max-w-xs text-sm'>
            A full-stack demo storefront built with Next.js 15, React 19, TypeScript and Tailwind CSS.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className='mb-3 font-semibold text-white'>{c.title}</h3>
            <ul className='space-y-2 text-sm'>
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className='hover:text-white hover:underline'>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className='border-t border-white/10 py-5 text-center text-xs text-slate-400'>
        Portfolio project by{' '}
        <a href='https://abd-elaziz-hafallah.vercel.app' className='text-slate-200 hover:underline'>
          Abd Elaziz Hafallah
        </a>
        . Demo store: no real payments are taken.
      </div>
    </footer>
  );
}
