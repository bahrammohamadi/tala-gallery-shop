import { createServerSupabase } from "@/lib/supabase/server";

export type AdminSession =
  | { configured: false; user: null; role: null }
  | { configured: true; user: null; role: null }
  | { configured: true; user: { id: string; email: string | null }; role: string | null };

export async function readAdminSession(): Promise<AdminSession> {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!configured) return { configured: false, user: null, role: null };
  const supabase = await createServerSupabase();
  if (!supabase) return { configured: false, user: null, role: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { configured: true, user: null, role: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { configured: true, user: { id: user.id, email: user.email ?? null }, role: profile?.role ? String(profile.role) : null };
}

export function canManageStore(role: string | null) {
  return role === "admin" || role === "manager";
}
