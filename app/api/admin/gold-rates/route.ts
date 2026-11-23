import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";

const rateSchema = z.object({
  ratePerGramIRR: z.number().int().safe().positive(),
  referencePurityPerMille: z.number().int().min(1).max(1000),
  source: z.string().trim().min(3).max(200),
  capturedAt: z.string().datetime(),
  confirmVerified: z.literal(true),
});

export async function GET() {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  const { data, error } = await access.supabase.from("gold_rate_snapshots").select("id, rate_per_gram_irr, reference_purity_per_mille, source, captured_at, is_verified").order("captured_at", { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: "RATE_HISTORY_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ rates: data ?? [] }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: NextRequest) {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const parsed = rateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const capturedAt = new Date(parsed.data.capturedAt);
  if (capturedAt.getTime() > Date.now()) return NextResponse.json({ error: "FUTURE_RATE_NOT_ALLOWED" }, { status: 400 });

  const { data, error } = await access.supabase.from("gold_rate_snapshots").insert({
    rate_per_gram_irr: parsed.data.ratePerGramIRR,
    reference_purity_per_mille: parsed.data.referencePurityPerMille,
    source: parsed.data.source,
    captured_at: capturedAt.toISOString(),
    is_verified: true,
    verified_by: access.userId,
  }).select("id, rate_per_gram_irr, reference_purity_per_mille, source, captured_at, is_verified").single();
  if (error || !data) return NextResponse.json({ error: "RATE_SAVE_FAILED" }, { status: 400 });
  return NextResponse.json({ rate: data }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
}
