# TALA — a house of gold

A bilingual Persian/English luxury jewellery storefront study built with Next.js App Router, React, TypeScript, Tailwind CSS, GSAP ScrollTrigger and React Three Fiber. The homepage features a genuinely scroll-linked, pinned camera journey around a procedural Three.js ring model; a dedicated product view supports free mouse/touch rotation, zoom and reset.

> **Concept preview:** this repository was supplied without real product media, CAD, catalog records, prices, or a store-specific backend. The ring, product cards and sample catalog are explicitly concept-only. No purity, weight, stone, certificate, inventory, live gold rate, shipping promise or price is asserted. Prices display “استعلام قیمت / Price on request” until verified data is configured. No payment provider is connected; the cart is an enquiry list, not an order.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` (redirects to `/fa`) or `/en`. The storefront and concept camera story run without Supabase credentials. Sign-in, the live admin workspace, server-persisted enquiries and price quotes remain unavailable until the appropriate Supabase project is configured.

## Public GitHub Pages preview

The `Publish GitHub Pages preview` workflow builds a static concept showcase at [`https://bahrammohamadi.github.io/tala-gallery-shop/`](https://bahrammohamadi.github.io/tala-gallery-shop/) from the active Arena branch. GitHub Pages cannot host Next.js server APIs, middleware, authenticated admin operations or payment/order services; the workflow removes API routes and auth-refresh middleware only from its temporary build workspace. In the Pages preview, inquiry submission and order tracking are explicitly disabled, and no personal data should be entered. The full server-backed storefront still requires a Node.js host and an approved Supabase project.

## Commands

```bash
npm run dev        # Next.js on 0.0.0.0 for preview
npm run typecheck  # TypeScript check
npm run lint       # Next.js ESLint
npm run test       # Pricing engine unit tests
npm run build      # Production build
npm start          # Production server on 0.0.0.0
```

## Optional Supabase setup

1. Provision or explicitly approve a Supabase project for this store. Do not point the app at an unrelated project.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` / the deployment environment. The service-role key is server-only and must never use a `NEXT_PUBLIC_` prefix.
3. Apply `supabase/migrations/202611230001_initial.sql` using the trusted Supabase CLI/Studio workflow.
4. Create the first `admin`/`manager` role through a trusted administrative path. Public sign-up cannot elevate privileges.
5. Configure actual products, variants, approved price rules and a verified timestamped rate. Until then the quote endpoint correctly returns unavailable.

See [`docs/architecture.md`](docs/architecture.md), [`docs/pricing-engine.md`](docs/pricing-engine.md), [`docs/asset-requirements.md`](docs/asset-requirements.md), and [`docs/launch-readiness.md`](docs/launch-readiness.md).

## Environment variables

See `.env.example`. `NEXT_PUBLIC_SITE_URL` should be set to the real production origin before release; otherwise no fabricated canonical base or sitemap URL is emitted. Payment credentials are intentionally absent because a gateway has not been configured or tested.

## Routes

- `/fa`, `/en` — cinematic storefront
- `/{locale}/collections` and `/{locale}/collections/{rings|necklaces|bracelets|earrings|sets}` — concept collections
- `/{locale}/products/{slug}` — product detail
- `/{locale}/experience/{slug}` — interactive 3D viewer
- `/{locale}/cart`, `/{locale}/checkout` — local enquiry list and contact-only enquiry
- `/{locale}/about`, `/care`, `/ring-size`, `/policies`, `/contact`, `/account`, `/tracking`, `/admin` — editorial, support and operations pages

## Security notes

- Price calculations are server-side and derive only from database product variants, a verified gold-rate snapshot and active admin-approved rules.
- The frontend cannot submit a price to the quote API.
- Admin writes require a Supabase Auth session plus a server-checked `admin` or `manager` profile role; database RLS is the second boundary.
- The order schema has immutable pricing snapshots and idempotency keys, but end-to-end order creation/payment is not implemented.
- Do not accept payment or publish real product specifications until the incomplete integrations in `docs/launch-readiness.md` are resolved.
