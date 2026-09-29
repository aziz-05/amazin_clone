export type Variant = {
  id: string;
  label: string;
  image: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  keywords: string[];
  rating: { stars: number; count: number };
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  description: string;
  highlights: string[];
  variants: Variant[];
  sizes?: string[];
};

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'reviews' | 'discount';

export type SearchParams = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  rating?: number;
  deals?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

export type SearchResult = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  facets: { category: string; count: number }[];
};

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  variantId?: string;
  variantLabel?: string;
  size?: string;
  quantity: number;
  deliveryOptionId: DeliveryOptionId;
};

export type DeliveryOptionId = 'standard' | 'express' | 'next-day';

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variantLabel?: string;
  size?: string;
  quantity: number;
  unitCents: number;
  deliveryOptionId: DeliveryOptionId;
  estimatedDelivery: string;
};

export type Order = {
  id: string;
  placedAt: string;
  items: OrderItem[];
  address: Address;
  payment: { brand: string; last4: string };
  totals: Totals;
};

export type Address = {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Totals = {
  itemsCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};
