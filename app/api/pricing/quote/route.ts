import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { calculatePriceQuote, PricingConfigurationError } from "@/lib/pricing-engine";
import { createAdminSupabase } from "@/lib/supabase/admin";

const requestSchema = z.object({ productVariantId: z.string().uuid() });

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

  const admin = createAdminSupabase();
  if (!admin) return NextResponse.json({ error: "PRICE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });

  const { data: variant, error: variantError } = await admin
    .from("product_variants")
    .select("id, product_id, weight_grams, purity_per_mille, gemstone_value_irr")
    .eq("id", parsed.data.productVariantId)
    .eq("is_active", true)
    .maybeSingle();
  if (variantError || !variant) return NextResponse.json({ error: "PRODUCT_UNAVAILABLE" }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const [productResult, rateResult, rulesResult] = await Promise.all([
    admin.from("products").select("id, is_published").eq("id", variant.product_id).maybeSingle(),
    admin.from("gold_rate_snapshots").select("rate_per_gram_irr, reference_purity_per_mille, source, captured_at, is_verified").eq("is_verified", true).order("captured_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("pricing_rules").select("making_fee_mode, making_fee_value, merchant_margin_percent, tax_percent, shipping_irr, quote_ttl_seconds, max_rate_age_seconds").eq("is_active", true).limit(1).maybeSingle(),
  ]);

  if (productResult.error || !productResult.data?.is_published) return NextResponse.json({ error: "PRODUCT_UNAVAILABLE" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (rateResult.error || rulesResult.error || !rateResult.data || !rulesResult.data) {
    return NextResponse.json({ error: "PRICE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const quote = calculatePriceQuote({
      productId: String(variant.product_id),
      variantId: String(variant.id),
      weightGrams: Number(variant.weight_grams),
      purityPerMille: Number(variant.purity_per_mille),
      gemstoneValueIRR: Number(variant.gemstone_value_irr ?? 0),
      goldRate: {
        ratePerGramIRR: Number(rateResult.data.rate_per_gram_irr),
        referencePurityPerMille: Number(rateResult.data.reference_purity_per_mille),
        source: String(rateResult.data.source),
        capturedAt: String(rateResult.data.captured_at),
        verified: Boolean(rateResult.data.is_verified),
      },
      rules: {
        makingFeeMode: rulesResult.data.making_fee_mode as "per_gram_irr" | "percent_of_gold",
        makingFeeValue: Number(rulesResult.data.making_fee_value),
        merchantMarginPercent: Number(rulesResult.data.merchant_margin_percent),
        taxPercent: Number(rulesResult.data.tax_percent),
        shippingIRR: Number(rulesResult.data.shipping_irr),
        quoteTtlSeconds: Number(rulesResult.data.quote_ttl_seconds),
        maxRateAgeSeconds: Number(rulesResult.data.max_rate_age_seconds),
      },
    });

    const snapshot = {
      formulaVersion: quote.formulaVersion,
      currency: quote.currency,
      amountIRR: quote.amountIRR,
      amountTomanRounded: quote.amountTomanRounded,
      breakdownIRR: quote.breakdownIRR,
      productId: quote.productId,
      variantId: quote.variantId,
      rateSource: quote.rateSource,
      rateCapturedAt: quote.rateCapturedAt,
      quoteCreatedAt: quote.quoteCreatedAt,
      quoteExpiresAt: quote.quoteExpiresAt,
    };
    const { data: saved, error: saveError } = await admin.from("price_quotes").insert({
      product_variant_id: quote.variantId,
      amount_irr: quote.amountIRR,
      amount_toman_rounded: quote.amountTomanRounded,
      rate_source: quote.rateSource,
      rate_captured_at: quote.rateCapturedAt,
      expires_at: quote.quoteExpiresAt,
      snapshot,
    }).select("id").single();
    if (saveError || !saved) return NextResponse.json({ error: "PRICE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });

    return NextResponse.json({ quoteId: saved.id, ...snapshot }, { status: 200, headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    if (error instanceof PricingConfigurationError) {
      return NextResponse.json({ error: "PRICE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "PRICE_UNAVAILABLE" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
