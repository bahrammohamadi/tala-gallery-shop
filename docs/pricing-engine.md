# Iranian gold-store pricing engine

## Data contract and authority

- Internal monetary amounts are integer **Iranian rials (IRR)**. The UI may display **toman**, using the explicit relationship `1 toman = 10 IRR`; the current calculator returns `amountTomanRounded` as a display convenience and keeps `amountIRR` as the immutable accounting value.
- The server requires a product variant with a verified weight and purity, one verified gold-rate snapshot, a named source and timestamp, and one active business-approved pricing-rules row. No rate, fee, margin, tax or shipping amount is seeded by the application.
- Rate source, rate timestamp, price breakdown, formula version, quote creation time and expiry are stored with the quote. `/api/pricing/quote` never accepts a price or product specification from the browser.
- A missing rule, missing rate, unverified rate, stale rate, invalid weight/purity or failed snapshot write results in no quote. The storefront then says **استعلام قیمت / Price on request**.
- An order is expected to copy the verified quote into an immutable pricing snapshot. The database trigger prevents changing an order's amount, currency, quote ID or pricing snapshot after creation. Payment is intentionally not implemented.

## Current configurable formula (`tala-v1`)

All monetary inputs below are business/admin values; the formula is an implementation proposal and must be approved by the retailer and its accounting/legal advisers before live use.

1. `gold = round(ratePerGramIRR × weightGrams × productPurityPerMille ÷ referencePurityPerMille)`
2. `makingFee = round(makingFeeValue × weightGrams)` for `per_gram_irr`, **or** `round(gold × makingFeeValue ÷ 100)` for `percent_of_gold`.
3. `materialAndWork = gold + makingFee + gemstoneValueIRR`.
4. `margin = round(materialAndWork × merchantMarginPercent ÷ 100)`.
5. `beforeDiscount = materialAndWork + margin`.
6. `discount = min(server-approved discount amount, beforeDiscount)`.
7. `configuredTax = round((beforeDiscount − discount) × taxPercent ÷ 100)`.
8. `totalIRR = beforeDiscount − discount + configuredTax + shippingIRR`.

This tax base and order of operations are configurable design choices, **not a claim about Iranian regulations**. The schema leaves the rules row absent until an authorized manager supplies approved values. Promotion/discount tables exist, but the production promotion-redemption UI/API is not complete and the public quote route currently does not apply a client-supplied discount code.

## Freshness and expiry

- Admin-configured `max_rate_age_seconds` determines whether a gold-rate snapshot is fresh enough for a quote.
- Admin-configured `quote_ttl_seconds` determines the quote expiry. The quote response includes source timestamp and expiry.
- There is no fabricated live market feed; a manager records a rate, its source, reference purity and captured timestamp, then explicitly confirms verification.
- Before launch, add an operational rate feed or documented manual-update SLA, stale-rate alerting, audit review and a reconciliation test against the retailer's approved calculator.

## Required approval before production

- Confirm which gold reference purity and rate source the business uses.
- Confirm whether manufacturing fees are per gram, percentage-based, or vary by product/variant.
- Confirm how margin, gemstone appraisal, discounts, shipping, and any legally applicable tax are calculated and rounded.
- Confirm treatment of quote revisions, inventory reservation, refunds and order amendment.
- Obtain legal/accounting approval. Do not interpret the example formula as tax advice.

## Tests

`lib/pricing-engine.test.ts` covers the sample arithmetic, source/expiry snapshot, unverified/stale rates, missing weight and discount capping. No tests use a live gold price.
