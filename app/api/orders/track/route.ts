import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.object({ orderId: z.string().uuid() });

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "TRACKING_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at")
    .eq("id", parsed.data.orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ orderNumber: data.order_number, status: data.status, createdAt: data.created_at }, { headers: { "Cache-Control": "no-store, private" } });
}
