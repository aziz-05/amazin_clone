export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-flex flex-col leading-none ${className}`}>
      <span className='font-display text-[26px] font-extrabold tracking-tight'>amazin</span>
      <svg viewBox='0 0 100 18' className='-mt-1 ml-1 h-3 w-[78%]' aria-hidden='true'>
        <path d='M4 4 C 30 18, 70 18, 92 6' fill='none' stroke='#ff7a1a' strokeWidth='5' strokeLinecap='round' />
        <path d='M84 3 L 94 6 L 89 14' fill='none' stroke='#ff7a1a' strokeWidth='4.5' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    </span>
  );
}
