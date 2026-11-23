import { describe, expect, it } from "vitest";
import { calculatePriceQuote, PricingConfigurationError, type PriceQuoteInput } from "./pricing-engine";

const now = new Date("2026-11-23T12:00:00.000Z");
const base: PriceQuoteInput = {
  productId: "product-1",
  variantId: "variant-1",
  weightGrams: 2,
  purityPerMille: 750,
  gemstoneValueIRR: 100_000,
  goldRate: {
    ratePerGramIRR: 1_000_000,
    referencePurityPerMille: 750,
    source: "Business-approved source",
    capturedAt: "2026-11-23T11:59:00.000Z",
    verified: true,
  },
  rules: {
    makingFeeMode: "per_gram_irr",
    makingFeeValue: 50_000,
    merchantMarginPercent: 10,
    taxPercent: 0,
    shippingIRR: 0,
    quoteTtlSeconds: 300,
    maxRateAgeSeconds: 600,
  },
  now,
};

describe("server-side pricing engine", () => {
  it("calculates from configured IRR inputs and snapshots the source and expiry", () => {
    const quote = calculatePriceQuote(base);
    expect(quote.amountIRR).toBe(2_420_000);
    expect(quote.amountTomanRounded).toBe(242_000);
    expect(quote.breakdownIRR).toEqual({
      gold: 2_000_000,
      makingFee: 100_000,
      gemstone: 100_000,
      margin: 220_000,
      discount: 0,
      configuredTax: 0,
      shipping: 0,
    });
    expect(quote.rateSource).toBe("Business-approved source");
    expect(quote.quoteExpiresAt).toBe("2026-11-23T12:05:00.000Z");
  });

  it("does not quote an unverified or stale gold rate", () => {
    expect(() => calculatePriceQuote({ ...base, goldRate: { ...base.goldRate, verified: false } })).toThrow(PricingConfigurationError);
    expect(() => calculatePriceQuote({ ...base, goldRate: { ...base.goldRate, capturedAt: "2026-11-23T11:00:00.000Z" } })).toThrow(/stale/);
  });

  it("rejects missing real-product weight instead of manufacturing a quote", () => {
    expect(() => calculatePriceQuote({ ...base, weightGrams: 0 })).toThrow(/weight/);
  });

  it("keeps discounts within the pre-tax configured amount", () => {
    const quote = calculatePriceQuote({ ...base, discountIRR: 99_000_000 });
    expect(quote.breakdownIRR.discount).toBe(2_420_000);
    expect(quote.amountIRR).toBe(0);
  });
});
