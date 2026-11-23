import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, DatabaseZap, ShieldAlert } from "lucide-react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { PageIntro } from "@/components/page-intro";
import { SignInForm } from "@/components/sign-in-form";
import { canManageStore, readAdminSession } from "@/lib/admin-auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "مدیریت فروشگاه" : "Store administration", robots: { index: false, follow: false } };
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const session = await readAdminSession();
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;

  if (!session.configured) {
    return (
      <div className="page-shell admin-gate-page">
        <div className="page-container">
          <PageIntro locale={locale} index="01 / 01" eyebrow={fa ? "دسترسی مدیریت" : "ADMIN ACCESS"} title={fa ? <>مدیریت،<br /><em>با دسترسیِ درست.</em></> : <>Operations,<br /><em>with the right access.</em></>} description={fa ? "ابزار مدیریت تنها پس از اتصال پروژه‌ی Supabase و فعال‌سازی احراز هویت در دسترس مدیران مجاز خواهد بود." : "The admin workspace becomes available after a Supabase project and authenticated roles are configured."} />
          <div className="admin-gate"><span className="admin-gate__icon"><DatabaseZap size={23} strokeWidth={1.2}/></span><span className="micro-label">{fa ? "پیکربندی لازم است" : "SETUP REQUIRED"}</span><h2>{fa ? "هیچ پایگاه‌داده‌ای به TALA متصل نیست." : "No database is connected to TALA."}</h2><p>{fa ? "پروژه‌های Supabase موجود در حساب شما به این فروشگاه تعلق ندارند؛ برای جلوگیری از تغییر در پروژه‌ای نامرتبط، اتصال انجام نشده است." : "The available Supabase projects are not identified as belonging to this store, so none has been linked."}</p><div className="admin-gate__steps"><span>01</span><p>{fa ? "پروژه‌ی فروشگاه را بسازید یا تأیید کنید." : "Create or explicitly approve the store's Supabase project."}</p><span>02</span><p>{fa ? "کلیدهای محیطی را در استقرار امن وارد کنید." : "Add the project keys to the secure deployment environment."}</p><span>03</span><p>{fa ? "مهاجرت SQL را اجرا و نقش مدیر را از مسیر امن تخصیص دهید." : "Run the SQL migration and assign an admin role through a trusted path."}</p></div><Link href={`/${locale}/policies`} className="text-link"><span>{fa ? "وضعیت عملیاتی فروشگاه" : "Store readiness status"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return (
      <div className="page-shell admin-gate-page">
        <div className="page-container">
          <PageIntro locale={locale} index="01 / 01" eyebrow={fa ? "ورود مدیر" : "ADMIN SIGN IN"} title={fa ? <>فقط برای<br /><em>تیم مجاز.</em></> : <>For the<br /><em>authorised team.</em></>} description={fa ? "برای ورود به ابزارهای قیمت‌گذاری و سفارش، با حسابی که نقش مدیر دارد وارد شوید." : "Sign in with an account assigned an administrator or manager role."} />
          <div className="admin-auth-card"><span className="admin-gate__icon"><ShieldAlert size={22} strokeWidth={1.2}/></span><SignInForm locale={locale}/><p>{fa ? "ثبت‌نام عمومی و ارتقای نقش از این صفحه امکان‌پذیر نیست." : "Public sign-up and role elevation are disabled here."}</p></div>
        </div>
      </div>
    );
  }

  if (!canManageStore(session.role)) {
    return (
      <div className="page-shell admin-gate-page"><div className="page-container"><div className="admin-gate admin-gate--denied"><span className="admin-gate__icon"><ShieldAlert size={23}/></span><h2>{fa ? "این حساب به مدیریت دسترسی ندارد." : "This account cannot access administration."}</h2><p>{fa ? "برای ادامه، از مالک فروشگاه بخواهید نقش مدیر یا مدیر فروشگاه را از مسیر امن Supabase تخصیص دهد." : "Ask the store owner to assign the manager or admin role through a trusted Supabase path."}</p><Link href={`/${locale}/account`} className="text-link"><span>{fa ? "بازگشت به حساب" : "Back to account"}</span><Arrow size={15}/></Link></div></div></div>
    );
  }

  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const [productsResult, rulesResult, rateResult, ordersResult, auditResult] = await Promise.all([
    supabase.from("products").select("id, slug, name_fa, name_en, is_published, is_archived, updated_at, product_variants(id, sku, is_active, stock_quantity)").order("updated_at", { ascending: false }).limit(100),
    supabase.from("pricing_rules").select("making_fee_mode, making_fee_value, merchant_margin_percent, tax_percent, shipping_irr, quote_ttl_seconds, max_rate_age_seconds, updated_at").eq("id", "default").maybeSingle(),
    supabase.from("gold_rate_snapshots").select("rate_per_gram_irr, reference_purity_per_mille, source, captured_at, is_verified").eq("is_verified", true).order("captured_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("orders").select("id, order_number, status, created_at, amount_irr").order("created_at", { ascending: false }).limit(20),
    supabase.from("audit_logs").select("id, action, created_at, subject_type, actor_id").order("created_at", { ascending: false }).limit(30),
  ]);

  return <div className="page-shell admin-live-page"><div className="page-container admin-container"><AdminDashboard locale={locale} products={(productsResult.data ?? []) as never} rules={(rulesResult.data ?? null) as never} latestRate={(rateResult.data ?? null) as never} orders={(ordersResult.data ?? []) as never} audit={(auditResult.data ?? []) as never}/></div></div>;
}
