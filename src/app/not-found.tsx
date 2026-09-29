import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='container-x grid place-items-center gap-4 py-28 text-center'>
      <p className='font-display text-7xl font-extrabold text-brand'>404</p>
      <h1 className='font-display text-2xl font-bold'>We couldn’t find that page</h1>
      <p className='max-w-sm text-slate-600'>The product may have sold out or the link is broken. Try searching instead.</p>
      <Link href='/' className='btn-primary'>
        Back to the store
      </Link>
    </div>
  );
}
