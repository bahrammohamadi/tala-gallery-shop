# Launch readiness and verified limitations

## Implemented in this repository

- Localized Persian RTL and English LTR Next.js routes; locale switch preserves the path and a browser-stored enquiry list.
- Pinned GSAP/ScrollTrigger story with explicit Three.js camera/target keyframes, shared text timeline, reverse scrub and cleanup; reduced-motion path; WebGL-independent HTML product content.
- Procedural R3F solitaire concept model with studio lighting/materials; a separate OrbitControls viewer with drag, touch rotation, zoom and reset.
- Responsive storefront pages for the homepage, collection archive and five categories, concept product detail, 3D viewer, about, care, ring-size guidance, enquiry list, enquiry form, customer account, order tracking, policies, contact and protected admin.
- Server-side price calculation and quote endpoint; missing/stale/unverified data produces no quote. Price rules and rate entry require an authenticated manager.
- Supabase migration with catalog, variants, inventory reservation, pricing/rates/quotes, immutable order snapshots, promotions, media, site sections/settings, inquiries, payment-attempt schema, role profiles, audit triggers and row-level-security policies.
- Search metadata, Product JSON-LD without invented offer/price, sitemap generation only when `NEXT_PUBLIC_SITE_URL` is set, and robots exclusions for account/checkout/admin routes.
- Vitest price-engine unit tests.

## Not integrated or not launch-ready

1. **Supabase project and credentials:** no project was identified as belonging to this store. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and server-only `SUPABASE_SERVICE_ROLE_KEY` only after a store project is provisioned and approved. The repository does not create/modify a Supabase project automatically.
2. **Production catalog and product assets:** the product catalog is concept-only, and the hero model and vector artwork are demonstrations. Supply approved product data, workshop CAD/GLB, photography, weights, purity, stone specifications, SKUs and variant inventory before publishing.
3. **Payment gateway:** not connected. No payment initiation/callback verification endpoint, provider credentials, reconciliation or real checkout exists. The customer flow is an enquiry, and no success/payment claim is shown.
4. **Orders and fulfilment:** schema, owner-scoped tracking read, admin visibility and immutable pricing snapshot support are present, but order creation, quote-to-order reservation, idempotent checkout, payment callback verification, shipment updates and refunds are not wired end-to-end.
5. **Admin modules:** authenticated dashboard and write paths exist for product drafts, pricing rules and verified gold-rate entries. Variant/inventory editors, storage uploads, collections CMS, homepage CMS, customer records, discounts/redemptions, reports, fulfilment actions and full settings CRUD are schema/readiness views only; some are explicitly labeled unwired in the dashboard.
6. **Inquiry controls:** when configured, guest inquiries are stored server-side through the service-role client. Add a durable distributed rate limit, abuse protection/CAPTCHA, consent/retention policy, data-export/deletion process and operational monitoring before exposing the endpoint publicly.
7. **Regulatory/business rules:** no tax rate, gold feed, price source, manufacturing fee, shipping promise, showroom address, delivery SLA, return term or certificate claim is assumed. The business must approve and configure each before publishing.
8. **Vercel:** no matching Vercel project was found, so this work has not been deployed. Configure the project, environment variables, database migration and a real production domain before launch.
9. **Accessibility/performance validation:** keyboard structure, labels, reduced-motion behavior, DPR cap, lazy-loaded 3D and static text fallback are implemented. Real-device Lighthouse, screen-reader testing, low-end Android/GPU WebGL testing, RTL manual review and visual QA remain required.

## Suggested launch sequence

1. Approve/create the store Supabase project; apply the migration and verify RLS in both anonymous and authenticated sessions.
2. Create the first administrator using a trusted backend/SQL operation. Do not expose role elevation to public sign-up.
3. Load actual collection/product/variant records and verify that a draft cannot publish without an active variant.
4. Replace concept geometry and vector artwork with signed-off CAD, imagery and accessible bilingual content.
5. Approve the pricing formula, tax treatment, market data source and expiry policy; configure a verified rate and reconcile test quotes with the retailer's approved calculator.
6. Finish inventory reservation, order creation/idempotency, provider payment initiation and verified webhook/callback lifecycle before enabling real checkout.
7. Complete admin CRUD for content, media, inventory, promotions, order operations and audit; define customer-data retention and incident procedures.
8. Configure production environment variables and domain in Vercel; run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, then real-device and security checks.
