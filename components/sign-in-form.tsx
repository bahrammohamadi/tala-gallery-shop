"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Locale } from "@/lib/i18n";

export function SignInForm({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError(fa ? "احراز هویت هنوز پیکربندی نشده است." : "Authentication has not been configured yet.");
      return;
    }
    setPending(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (signInError) {
      setError(fa ? "ورود انجام نشد. اطلاعات را بررسی کنید یا با پشتیبانی تماس بگیرید." : "Sign-in failed. Check your details or contact support.");
      return;
    }
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label><span>{fa ? "ایمیل" : "Email"}</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label><span>{fa ? "گذرواژه" : "Password"}</span><input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
      <button className="button button--gold" type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="spin" size={15}/> : <><span>{fa ? "ورود امن" : "Sign in securely"}</span><Arrow size={15} strokeWidth={1.2}/></>}
      </button>
      {error && <p className="form-status form-status--error" role="alert">{error}</p>}
    </form>
  );
}

export function SignOutButton({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function signOut() {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    setPending(true);
    await supabase.auth.signOut();
    router.refresh();
  }
  return <button className="button button--line" type="button" onClick={signOut} disabled={pending}>{fa ? "خروج امن" : "Sign out"}</button>;
}
