import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { SignInForm, SignOutButton } from "@/components/sign-in-form";
import { createServerSupabase } from "@/lib/supabase/server";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "حساب کاربری" : "Your account", robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const supabase = await createServerSupabase();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;

  return (
    <div className="page-shell account-page">
      <div className="page-container">
        <PageIntro locale={locale} index="01 / 01" eyebrow={fa ? "حساب امن" : "SECURE ACCOUNT"} title={fa ? <>حسابِ <em>شما.</em></> : <>Your <em>account.</em></>} description={fa ? "ورود مشتریان، سفارش‌ها و وضعیت حساب فقط پس از پیکربندی امن سرویس هویت فعال می‌شود." : "Customer sign-in, orders and account details are available only after secure identity services are configured."} />
        {!configured ? (
          <div className="auth-state"><span className="auth-state__icon"><ShieldCheck size={20} strokeWidth={1.2}/></span><span className="micro-label">{fa ? "پیکربندی لازم است" : "SETUP REQUIRED"}</span><h2>{fa ? "ورود فعلاً فعال نیست." : "Sign-in is not active yet."}</h2><p>{fa ? "برای جلوگیری از ساخت حساب نمایشی یا ناامن، ورود تا زمان افزودن تنظیمات Supabase غیرفعال مانده است." : "To avoid a fake or insecure account flow, sign-in remains disabled until Supabase settings are supplied."}</p><Link className="text-link" href={`/${locale}/policies`}><span>{fa ? "وضعیت فعلی فروشگاه" : "Current store status"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>
        ) : user ? (
          <div className="account-session"><span className="micro-label">{fa ? "نشست فعال" : "ACTIVE SESSION"}</span><h2>{user.email ?? (fa ? "حساب مشتری" : "Customer account")}</h2><p>{fa ? "نشست شما از طریق احراز هویت Supabase بررسی شده است." : "Your session has been verified by Supabase Auth."}</p><div className="account-actions"><Link className="button button--line" href={`/${locale}/tracking`}>{fa ? "پیگیری سفارش" : "Track an order"}<Arrow size={15}/></Link><SignOutButton locale={locale}/></div></div>
        ) : (
          <div className="auth-layout"><div className="auth-aside"><span className="micro-label">TALA / ACCOUNT</span><h2>{fa ? "خوش آمدید." : "Welcome back."}</h2><p>{fa ? "برای مشاهده‌ی سفارش‌های خود، با حساب کاربری‌تان وارد شوید." : "Sign in to view your account and orders."}</p></div><div className="auth-form-wrap"><SignInForm locale={locale}/><p className="auth-privacy-note">{fa ? "ثبت‌نام عمومی تا زمان آماده‌شدن شرایط فروش فعال نیست." : "Public registration remains closed until the store is ready to sell."}</p></div></div>
        )}
      </div>
    </div>
  );
}
