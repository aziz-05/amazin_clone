import { NextResponse, type NextRequest } from 'next/server';
import { parseSearchParams, searchProducts } from '@/lib/catalog';

// GET /api/products?q=&category=&min=&max=&rating=&deals=1&sort=&page=
export function GET(request: NextRequest) {
  const params = parseSearchParams(Object.fromEntries(request.nextUrl.searchParams));
  return NextResponse.json(searchProducts(params));
}
