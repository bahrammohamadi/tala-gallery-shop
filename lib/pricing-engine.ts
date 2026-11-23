export type GoldRateSnapshot = {
  ratePerGramIRR: number;
  referencePurityPerMille: number;
  source: string;
  capturedAt: string;
  verified: boolean;
};

export type PricingRules = {
  makingFeeMode: "per_gram_irr" | "percent_of_gold";
  makingFeeValue: number;
  merchantMarginPercent: number;
  taxPercent: number;
  shippingIRR: number;
  quoteTtlSeconds: number;
  maxRateAgeSeconds: number;
};

export type PriceQuoteInput = {
  productId: string;
  variantId: string;
  weightGrams: number;
  purityPerMille: number;
  gemstoneValueIRR: number;
  goldRate: GoldRateSnapshot;
  rules: PricingRules;
  discountIRR?: number;
  now?: Date;
};

export type PriceQuote = {
  currency: "IRR";
  amountIRR: number;
  amountTomanRounded: number;
  breakdownIRR: {
    gold: number;
    makingFee: number;
    gemstone: number;
    margin: number;
    discount: number;
    configuredTax: number;
    shipping: number;
  };
  productId: string;
  variantId: string;
  rateSource: string;
  rateCapturedAt: string;
  quoteCreatedAt: string;
  quoteExpiresAt: string;
  formulaVersion: "tala-v1";
};

export class PricingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingConfigurationError";
  }
}

const roundRial = (amount: number) => Math.round(amount);

function requireFiniteNonNegative(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new PricingConfigurationError(`${name} must be a finite, non-negative number`);
  }
}

function assertSafeRial(name: string, value: number) {
  requireFiniteNonNegative(name, value);
  if (!Number.isSafeInteger(value)) throw new PricingConfigurationError(`${name} must be a safe whole-rial amount`);
}

export function calculatePriceQuote(input: PriceQuoteInput): PriceQuote {
  const { goldRate, rules } = input;
  if (!goldRate.verified) throw new PricingConfigurationError("The gold rate is not verified");
  if (!goldRate.source.trim()) throw new PricingConfigurationError("A named gold-rate source is required");
  if (!Number.isFinite(input.weightGrams) || input.weightGrams <= 0) throw new PricingConfigurationError("A verified positive product weight is required");
  if (!Number.isInteger(input.purityPerMille) || input.purityPerMille <= 0 || input.purityPerMille > 1000) throw new PricingConfigurationError("Product purity must be specified in per-mille units");
  if (!Number.isInteger(goldRate.referencePurityPerMille) || goldRate.referencePurityPerMille <= 0 || goldRate.referencePurityPerMille > 1000) throw new PricingConfigurationError("The reference purity is invalid");
  if (!Number.isInteger(rules.quoteTtlSeconds) || rules.quoteTtlSeconds <= 0) throw new PricingConfigurationError("A positive quote expiry is required");
  if (!Number.isInteger(rules.maxRateAgeSeconds) || rules.maxRateAgeSeconds <= 0) throw new PricingConfigurationError("A positive rate freshness window is required");

  assertSafeRial("ratePerGramIRR", goldRate.ratePerGramIRR);
  requireFiniteNonNegative("makingFeeValue", rules.makingFeeValue);
  if (rules.makingFeeMode === "per_gram_irr") assertSafeRial("makingFeeValue", rules.makingFeeValue);
  if (rules.makingFeeMode === "percent_of_gold" && rules.makingFeeValue > 1000) throw new PricingConfigurationError("Configured making-fee percentage exceeds the supported bound");
  assertSafeRial("gemstoneValueIRR", input.gemstoneValueIRR);
  assertSafeRial("shippingIRR", rules.shippingIRR);
  assertSafeRial("discountIRR", input.discountIRR ?? 0);
  requireFiniteNonNegative("merchantMarginPercent", rules.merchantMarginPercent);
  requireFiniteNonNegative("taxPercent", rules.taxPercent);
  if (rules.merchantMarginPercent > 1000 || rules.taxPercent > 1000) throw new PricingConfigurationError("Configured percentage exceeds the supported bound");

  const now = input.now ?? new Date();
  const capturedAtMs = Date.parse(goldRate.capturedAt);
  if (!Number.isFinite(capturedAtMs)) throw new PricingConfigurationError("The gold-rate timestamp is invalid");
  const ageSeconds = (now.getTime() - capturedAtMs) / 1000;
  if (ageSeconds < 0 || ageSeconds > rules.maxRateAgeSeconds) throw new PricingConfigurationError("The verified gold rate is stale");

  const gold = roundRial(
    goldRate.ratePerGramIRR * input.weightGrams * (input.purityPerMille / goldRate.referencePurityPerMille),
  );
  const makingFee = rules.makingFeeMode === "per_gram_irr"
    ? roundRial(rules.makingFeeValue * input.weightGrams)
    : rules.makingFeeMode === "percent_of_gold"
      ? roundRial(gold * rules.makingFeeValue / 100)
      : (() => { throw new PricingConfigurationError("Unknown manufacturing-fee mode"); })();
  const materialAndWork = gold + makingFee + input.gemstoneValueIRR;
  const margin = roundRial(materialAndWork * rules.merchantMarginPercent / 100);
  const beforeDiscount = materialAndWork + margin;
  const discount = Math.min(input.discountIRR ?? 0, beforeDiscount);
  const configuredTax = roundRial((beforeDiscount - discount) * rules.taxPercent / 100);
  const amountIRR = beforeDiscount - discount + configuredTax + rules.shippingIRR;

  if (!Number.isSafeInteger(amountIRR) || amountIRR < 0) throw new PricingConfigurationError("Calculated amount exceeds the supported range");
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + rules.quoteTtlSeconds * 1000).toISOString();

  return {
    currency: "IRR",
    amountIRR,
    amountTomanRounded: Math.round(amountIRR / 10),
    breakdownIRR: { gold, makingFee, gemstone: input.gemstoneValueIRR, margin, discount, configuredTax, shipping: rules.shippingIRR },
    productId: input.productId,
    variantId: input.variantId,
    rateSource: goldRate.source,
    rateCapturedAt: new Date(capturedAtMs).toISOString(),
    quoteCreatedAt: createdAt,
    quoteExpiresAt: expiresAt,
    formulaVersion: "tala-v1",
  };
}
