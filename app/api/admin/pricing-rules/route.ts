import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";

const ruleSchema = z.object({
  makingFeeMode: z.enum(["per_gram_irr", "percent_of_gold"]),
  makingFeeValue: z.number().finite().min(0),
  merchantMarginPercent: z.number().finite().min(0).max(1000),
  taxPercent: z.number().finite().min(0).max(1000),
  shippingIRR: z.number().int().safe().min(0),
  quoteTtlSeconds: z.number().int().min(1).max(86_400),
  maxRateAgeSeconds: z.number().int().min(1).max(604_800),
}).refine((value) => value.makingFeeMode !== "per_gram_irr" || Number.isSafeInteger(value.makingFeeValue), {
  path: ["makingFeeValue"], message: "Per-gram manufacturing fee must be a whole-rial amount.",
});

export async function GET() {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  const { data, error } = await access.supabase.from("pricing_rules").select("id, making_fee_mode, making_fee_value, merchant_margin_percent, tax_percent, shipping_irr, quote_ttl_seconds, max_rate_age_seconds, updated_at").eq("id", "default").maybeSingle();
  if (error) return NextResponse.json({ error: "PRICING_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ rules: data ?? null }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function PUT(request: NextRequest) {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const parsed = ruleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const values = parsed.data;
  const { data, error } = await access.supabase.rpc("admin_save_pricing_rules", {
    p_making_fee_mode: values.makingFeeMode,
    p_making_fee_value: values.makingFeeValue,
    p_merchant_margin_percent: values.merchantMarginPercent,
    p_tax_percent: values.taxPercent,
    p_shipping_irr: values.shippingIRR,
    p_quote_ttl_seconds: values.quoteTtlSeconds,
    p_max_rate_age_seconds: values.maxRateAgeSeconds,
  });
  if (error) return NextResponse.json({ error: "PRICING_SAVE_FAILED" }, { status: 400 });
  return NextResponse.json({ rules: data }, { headers: { "Cache-Control": "no-store, private" } });
}
