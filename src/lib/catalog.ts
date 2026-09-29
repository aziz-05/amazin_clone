// Server-side catalog access. In production this would be a database; here the
// seeded catalog is loaded once and queried in memory with the same semantics.
import 'server-only';
import data from '@/data/products.json';
import { discountPercent } from './pricing';
import type { Product, SearchParams, SearchResult, SortKey } from './types';

const products = data as Product[];

export const CATEGORIES = ['Fashion', 'Shoes', 'Accessories', 'Kitchen', 'Home', 'Bath', 'Sports'] as const;

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Avg. customer review' },
  { key: 'reviews', label: 'Most reviewed' },
  { key: 'discount', label: 'Biggest discount' },
];

export function getAllProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id) ?? null;
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug) ?? null;
}

const normalize = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '');

/** Relevance score: name matches beat keyword matches; every query term must match somewhere. */
function score(p: Product, terms: string[]) {
  const name = normalize(p.name);
  const keywords = p.keywords.map(normalize).join(' ');
  const category = normalize(p.category);
  let total = 0;
  for (const t of terms) {
    if (name.split(/\s+/).some((w) => w.startsWith(t))) total += 3;
    else if (name.includes(t)) total += 2;
    else if (keywords.includes(t) || category.includes(t)) total += 1;
    else return 0;
  }
  return total;
}

function sortProducts(items: Product[], sort: SortKey) {
  const sorted = [...items];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.priceCents - b.priceCents);
    case 'price-desc':
      return sorted.sort((a, b) => b.priceCents - a.priceCents);
    case 'rating':
      return sorted.sort((a, b) => b.rating.stars - a.rating.stars || b.rating.count - a.rating.count);
    case 'reviews':
      return sorted.sort((a, b) => b.rating.count - a.rating.count);
    case 'discount':
      return sorted.sort(
        (a, b) => discountPercent(b.priceCents, b.compareAtCents) - discountPercent(a.priceCents, a.compareAtCents)
      );
    default:
      return sorted;
  }
}

export function searchProducts(params: SearchParams): SearchResult {
  const perPage = params.perPage ?? 12;
  const terms = normalize(params.q ?? '').split(/\s+/).filter(Boolean);

  let items = products;
  if (terms.length) {
    const scored = items.map((p) => ({ p, s: score(p, terms) })).filter((x) => x.s > 0);
    scored.sort((a, b) => b.s - a.s || b.p.rating.count - a.p.rating.count);
    items = scored.map((x) => x.p);
  }

  // Facet counts reflect the text query but not the category filter itself.
  const facets = CATEGORIES.map((category) => ({
    category,
    count: items.filter((p) => p.category === category).length,
  })).filter((f) => f.count > 0);

  if (params.category) items = items.filter((p) => p.category === params.category);
  if (params.min != null) items = items.filter((p) => p.priceCents >= params.min! * 100);
  if (params.max != null) items = items.filter((p) => p.priceCents <= params.max! * 100);
  if (params.rating) items = items.filter((p) => p.rating.stars >= params.rating!);
  if (params.deals) items = items.filter((p) => discountPercent(p.priceCents, p.compareAtCents) > 0);

  items = sortProducts(items, params.sort ?? 'featured');

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, params.page ?? 1), pages);
  return { items: items.slice((page - 1) * perPage, page * perPage), total, page, pages, facets };
}

export function suggest(q: string, limit = 6) {
  return searchProducts({ q, perPage: limit }).items.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.image,
    category: p.category,
    priceCents: p.priceCents,
  }));
}

export function relatedProducts(product: Product, limit = 6) {
  const kws = new Set(product.keywords);
  return products
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      s: (p.category === product.category ? 2 : 0) + p.keywords.filter((k) => kws.has(k)).length,
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.rating.count - a.p.rating.count)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Parses untrusted URL search params into typed, bounded filters. */
export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchParams {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const n = Number(one(k));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const sort = one('sort') as SortKey | undefined;
  const category = one('category');
  return {
    q: one('q')?.slice(0, 100),
    category: CATEGORIES.includes(category as (typeof CATEGORIES)[number]) ? category : undefined,
    min: num('min'),
    max: num('max'),
    rating: num('rating'),
    deals: one('deals') === '1',
    sort: SORTS.some((s) => s.key === sort) ? sort : 'featured',
    page: num('page'),
  };
}
