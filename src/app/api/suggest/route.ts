import { NextResponse, type NextRequest } from 'next/server';
import { suggest } from '@/lib/catalog';

// GET /api/suggest?q= : typeahead results for the header search box.
export function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ items: [] });
  return NextResponse.json(
    { items: suggest(q) },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
  );
}
