import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { CheckoutPanel } from "@/components/checkout-panel";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "ثبت درخواست استعلام" : "Request an enquiry", robots: { index: false, follow: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  return (
    <div className="page-shell checkout-page">
      <div className="page-container">
        <PageIntro locale={locale} index="02 / 02" eyebrow={fa ? "گام پایانیِ استعلام" : "ENQUIRY DETAILS"} title={fa ? <>پیش از هر تصمیم،<br /><em>گفت‌وگو می‌کنیم.</em></> : <>A conversation,<br /><em>before a commitment.</em></>} description={fa ? "جزئیات طرح را برای تیم TALA بفرستید. قیمت، مشخصات و شرایط فروش باید پیش از هر سفارش توسط فروشگاه تأیید شوند." : "Share your selected designs with the TALA team. Price, specifications and sale terms must be verified before any order."} />
        <CheckoutPanel locale={locale}/>
      </div>
    </div>
  );
}
