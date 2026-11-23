import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, PackageSearch } from "lucide-react";
import { OrderTrackingForm } from "@/components/order-tracking-form";
import { PageIntro } from "@/components/page-intro";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "پیگیری سفارش" : "Track an order", robots: { index: false, follow: false } };
}

export default async function TrackingPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <div className="page-shell tracking-page">
      <div className="page-container">
        <PageIntro locale={locale} index="01 / 01" eyebrow={fa ? "وضعیت سفارش" : "ORDER STATUS"} title={fa ? <>ردِ سفارش را<br /><em>دنبال کنید.</em></> : <>Follow your order,<br /><em>with clarity.</em></>} description={fa ? "برای مشاهده‌ی سفارش‌های ثبت‌شده، وارد حساب شوید و شناسه‌ی سفارش را وارد کنید." : "Sign in and enter your order ID to view an order associated with your account."} />
        <div className="tracking-panel"><span className="tracking-panel__icon"><PackageSearch size={24} strokeWidth={1.15}/></span><div className="tracking-panel__heading"><span className="micro-label">{fa ? "پیگیری امن" : "SECURE TRACKING"}</span><h2>{fa ? "شناسه‌ی سفارش را وارد کنید." : "Enter your order ID."}</h2><p>{fa ? "جست‌وجو فقط در سفارش‌های متعلق به حساب واردشده انجام می‌شود." : "Search is limited to orders belonging to the signed-in account."}</p></div><OrderTrackingForm locale={locale}/><div className="tracking-panel__note">{fa ? "هیچ سفارش یا تراکنش واقعی در پیش‌نمایش ثبت نشده است." : "No real orders or transactions have been created in this preview."}</div></div>
        <div className="page-cta-line"><Link className="text-link" href={`/${locale}/account`}><span>{fa ? "ورود به حساب کاربری" : "Go to your account"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>
      </div>
    </div>
  );
}
