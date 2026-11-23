# TALA storefront — architecture and implementation plan

## Current project baseline

The repository contained only a README and no supplied application, product catalog, media, 3D model, backend environment, or payment integration. The application is built as a Next.js App Router project on the current branch. The Supabase and Vercel accounts were inspected for an existing `tala-gallery-shop` project; Vercel returned no matching project. The available Supabase projects were not identified as belonging to this store, so none was connected or modified.

## Technical architecture

- **Web application:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4 (with a small, deliberate editorial CSS system), server-rendered page content, route metadata, and API routes.
- **Locales:** `/fa` (Persian, RTL, Vazirmatn) and `/en` (English, LTR, Manrope, Cormorant Garamond). The language switch retains the pathname; the enquiry list is shared in local storage across both locale routes.
- **Cinematic story:** a pinned GSAP ScrollTrigger master timeline drives an explicit camera path in a React Three Fiber scene. Camera position and target are separate keyframes; the text panels share the same scrubbed timeline. Reverse scrolling uses the same timeline in reverse. The 3D bundle is dynamically imported and the story falls back to a static, accessible composition when reduced motion is requested or WebGL is unavailable.
- **Product viewer:** a separate real-time Three.js viewer uses OrbitControls for mouse/touch rotation and controlled zoom; its reset control returns to the saved view. The hero's 3D camera is scroll-driven, not a CSS zoom of a flat image.
- **Catalog:** typed concept-only catalog data supports collection pages, localized product detail pages, crawlable HTML and a shoppable enquiry-list flow. Concept product pages are `noindex` until actual catalog data replaces the studies.
- **Commerce:** the cart is intentionally an enquiry list while no verified catalog pricing, inventory or payment provider is configured. Quote requests are submitted to `/api/inquiries`; that endpoint returns an explicit unavailable response when server credentials are absent. It never claims that a local form created an order.
- **Pricing:** `lib/pricing-engine.ts` is a pure server-usable calculation module. `/api/pricing/quote` accepts a product-variant ID only, loads all rates and rules on the server, rejects stale/unverified rates, and persists an immutable price snapshot. It never trusts a client-supplied amount.
- **Data and identity:** the Supabase SSR/browser clients are optional. Protected admin routes check the authenticated Supabase user and the `profiles.role` value on the server. Row-level security is defined in the initial migration. The service-role key is used only by server routes for guest enquiries/price snapshots and is never included in browser bundles.
- **Administration:** `/[locale]/admin` is access-gated. When connected, the dashboard includes live catalog, gold-rate, configurable pricing, order and audit views; product drafts, pricing rules and verified rate entry are wired to authenticated APIs. The schema reserves operational data for media, variants/inventory, promotions, homepage content, order snapshots, and payment callbacks. UI/API work for those additional modules is explicitly identified as unfinished below.

## Important routes

| Route | Purpose |
| --- | --- |
| `/fa`, `/en` | Cinematic home, concept catalog, category entry points, brand story, pricing transparency |
| `/[locale]/collections` | Collection archive |
| `/[locale]/collections/[slug]` | Rings, necklaces, bracelets, earrings, jewellery sets |
| `/[locale]/products/[slug]` | Localized server-rendered product study and enquiry action |
| `/[locale]/experience/[slug]` | Interactive Three.js viewer when a matching model is available |
| `/[locale]/cart` | Local enquiry list, not a sale or stock reservation |
| `/[locale]/checkout` | Contact/enquiry form, not a payment checkout |
| `/[locale]/about`, `/care`, `/ring-size`, `/policies`, `/contact` | Editorial and customer support information |
| `/[locale]/account`, `/tracking` | Supabase sign-in and owner-scoped order tracking, disabled until configured |
| `/[locale]/admin` | Server-authenticated store management |
| `/api/pricing/quote` | Server-side verified price quote; unavailable until database/rules/rate exist |
| `/api/inquiries` | Guest enquiry insert; unavailable until server-side Supabase credentials exist |
| `/api/orders/track` | Authenticated, owner-scoped order lookup |

## Design system

- **Palette:** near-black `#080807`, raised charcoal `#11110F`, champagne `#C7A56A`, warm ivory `#F6F0E5`, and muted mineral neutrals.
- **Typography:** Vazirmatn Variable for Persian shaping; Manrope Variable and Cormorant Garamond for English editorial hierarchy. Both font packages are open-source and bundled locally through npm.
- **Composition:** restrained rules, low-contrast dividers, large negative space, responsive logical properties, no generic template cards or excessive glow.
- **Interaction:** fine-grain hover feedback, keyboard-visible focus, semantic forms, native links/scrolling, and explicit empty/loading/unavailable states.

## Scroll storyboard

The pinned scene occupies roughly 3.75 viewport-heights of native scroll. A single GSAP timeline scrubs from progress 0 to 1; it is bidirectional and pins only the stage, with ScrollTrigger cleanup on unmount.

| Progress | Chapter | Authored camera / content |
| --- | --- | --- |
| 0–0.17 | Intro | Front studio view, ring in the dark; Persian headline and concept-data disclosure |
| 0.17–0.33 | Approach | Camera advances and makes a small lateral move; copy describes proportion without claiming product facts |
| 0.33–0.50 | Macro | Camera target rises to the concept setting; macro geometry and a restrained setting callout |
| 0.50–0.62 | Material & light | Camera eases back slightly; PBR reflections are framed as a digital lighting study, not a finish certification |
| 0.62–0.84 | Orbit | Authored side-to-side camera path and a gentle ring pose change; a link opens the free-rotation viewer |
| 0.84–1.00 | Shopping transition | Camera returns to a clean studio frame while name, known/unknown specification states, price-on-request and enquiry actions fade in |

A reduced-motion preference skips the pin and leaves a stable headline/model scene. On narrow screens, the lateral camera excursion and model pose are reduced and the pinned duration is shorter; the static HTML product details and shopping/enquiry path do not rely on WebGL.

## Rendering strategy evaluation

The repository had no approved CAD or rendered sequence to use. For this first delivery, a small procedural R3F model is the more useful choice: it supports a live, reversible camera path now and avoids a heavy frame sequence that would still depict an invented product. The hero currently has no rendered-image sequence; its authored camera path and a warm area-like point light are both driven by scroll progress, and the light sweep reverses naturally when scrolling backward. Once the exact CAD is supplied, compare (a) the optimized GLB viewer at real mobile DPR and (b) a Blender-rendered macro sequence with a static fallback. A hybrid is preferred if macro fidelity or low-end device decoding favors pre-rendered frames, while keeping OrbitControls for product rotation and HTML product details outside WebGL.

## Repository map

- `app/[locale]/*` — localized pages
- `app/api/*` — server routes
- `components/cinematic-experience.tsx`, `components/ring-canvas.tsx` — scroll and 3D experience
- `components/product-viewer.tsx` — mouse/touch 3D exploration
- `components/cart-provider.tsx` — locale-independent, non-sensitive enquiry-list state
- `lib/products.ts` — clearly labeled concept-only catalog
- `lib/pricing-engine.ts` — validated IRR price calculator
- `lib/supabase/*` — optional SSR/browser/server-only clients
- `supabase/migrations/*` — PostgreSQL schema, RLS and initial collections
- `docs/*` — launch, asset, and pricing requirements
