# Amazin: full-stack e-commerce marketplace

A complete shopping experience built with **Next.js 15 (App Router)**, **React 19**, **TypeScript** and
**Tailwind CSS 4**. You can search the catalog, filter and sort, choose product options, fill a cart,
check out with validated address and payment details, and then track your order live.

> Rebuilt from my original vanilla HTML/CSS/JS Amazon clone into a production-style, typed, server-rendered app.

## Features

- **Storefront**: hero, category tiles, today's deals, best sellers and top rated, all server-rendered.
- **Search**: relevance-ranked full-text search with a debounced **typeahead** (keyboard navigable).
- **Filters and sorting**: category facets with counts, price ranges (preset or custom), rating, deals,
  six sort orders and pagination. All of it is URL-driven, so every result page is shareable and works without JS.
- **Product pages**: statically generated. Colour/variant gallery, size selection with validation,
  quantity, delivery estimates in business days, stock warnings and related products.
- **Cart**: quantity, delete and **save for later** / move to cart, persisted in the browser.
- **Checkout**: per-item delivery speed with real delivery dates, a live price breakdown (items,
  shipping, 10% tax), and address and card validation with **Zod** (Luhn check, expiry, CVC, brand detection).
- **Orders API**: `POST /api/orders` re-validates everything server-side, **re-prices every line from
  the catalog** (client prices are ignored), checks stock and options, and returns only the card's brand and last 4 digits.
- **Order history and tracking**: an order list with "Buy it again", plus a tracking page with a live progress
  stepper (Ordered → Shipped → Out for delivery → Delivered). Tracking runs on a *demo clock* where
  one delivery day is one minute, so you can watch a package arrive.
- Accessible (labelled controls, ARIA combobox, focus states), responsive, and optimised with `next/image` and `next/font`.

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 15 App Router, React 19 Server & Client Components |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4, lucide-react icons |
| State | Zustand with `persist` (cart, orders) |
| Validation | Zod: shared schemas on client and server |
| API | Next.js Route Handlers |

## API

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/products?q=&category=&min=&max=&rating=&deals=1&sort=&page=` | Search, filter, sort and paginate |
| `GET` | `/api/products/:idOrSlug` | Single product |
| `GET` | `/api/suggest?q=` | Typeahead suggestions (cached) |
| `POST` | `/api/orders` | Validate, price and place an order |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Use test card `4242 4242 4242 4242`, any future expiry and any CVC. No payment is processed.

## Project structure

```
src/
  app/            routes: home, search, product/[slug], cart, checkout, orders, api/*
  components/     Header, SearchBox, BuyBox, ProductCard, Toaster…
  lib/            catalog (server-only search), pricing, order schema, tracking
  store/          Zustand cart + orders stores
  data/           seeded product catalog
```

---

Built by [Abd Elaziz Hafallah](https://abd-elaziz-hafallah.vercel.app).
