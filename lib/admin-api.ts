import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

export async function requireAdminApi() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false as const, response: NextResponse.json({ error: "ADMIN_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } }) };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401, headers: { "Cache-Control": "no-store" } }) };
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ? String(profile.role) : null;
  if (role !== "admin" && role !== "manager") {
    return { ok: false as const, response: NextResponse.json({ error: "FORBIDDEN" }, { status: 403, headers: { "Cache-Control": "no-store" } }) };
  }
  return { ok: true as const, supabase: supabase as SupabaseClient, userId: user.id, role };
}
