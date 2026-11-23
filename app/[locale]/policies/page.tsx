import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "پرسش‌های متداول و سیاست‌ها" : "FAQ & policies", description: fa ? "وضعیت فعلی استعلام قیمت، پرداخت، ارسال و اصالت کالا در پیش‌نمایش TALA." : "Current preview status for enquiries, payments, shipping and product authenticity at TALA." };
}

export default async function PoliciesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const rows = fa ? [
    ["آیا قیمت‌ها به نرخ زنده‌ی طلا متصل هستند؟", "خیر. در حال حاضر هیچ منبع نرخ زنده یا تأییدشده‌ای پیکربندی نشده است. قیمت محصولات «استعلام قیمت» نمایش داده می‌شود و از عدد تخمینی استفاده نمی‌کنیم."],
    ["آیا می‌توانم در این نسخه سفارش بدهم یا پرداخت کنم؟", "خیر. این پیش‌نمایش برای ثبت سفارش یا دریافت وجه فعال نیست و درگاه پرداختی متصل نشده است. افزودن یک طرح به فهرست استعلام، خرید یا رزرو موجودی محسوب نمی‌شود."],
    ["هزینه‌ی ساخت، مالیات و تخفیف چگونه محاسبه می‌شوند؟", "فرمول‌ها و نرخ‌ها باید از سوی مدیر فروشگاه و مشاور مربوطه تأیید و پیکربندی شوند. تا آن زمان هیچ نرخ مالیاتی یا فرمول محلی فرض یا سخت‌کد نشده است."],
    ["زمان ارسال و شرایط بازگشت چیست؟", "بازه‌ی ارسال، بیمه، مرجوعی و تعویض هنوز از سوی کسب‌وکار تأیید نشده‌اند. شرایط نهایی پیش از شروع فروش در همین صفحه منتشر خواهند شد."],
    ["آیا گواهی اصالت همراه محصول است؟", "برای هیچ‌یک از طرح‌های مفهومی این سایت گواهی یا مشخصه‌ی اصالت ادعا نمی‌شود. مستندات فقط پس از تأیید واقعی برای همان محصول اعلام خواهند شد."],
    ["آیا فرم تماس در حال حاضر پیام می‌فرستد؟", "تا زمانی که اتصال امن پایگاه داده پیکربندی نشده باشد، فرم آنلاین درخواست را ارسال یا ذخیره نمی‌کند و این موضوع را پیش از استفاده به شما نشان می‌دهد."],
  ] : [
    ["Are prices linked to a live gold rate?", "No. A live, verified rate source has not been configured. Products show “Price on request”; we do not display an estimated figure."],
    ["Can I place or pay for an order in this preview?", "No. This preview does not accept orders or payments, and no payment provider is connected. Adding a design to the enquiry list is not a purchase or stock reservation."],
    ["How are making fees, taxes and discounts calculated?", "Formulas and rates must be approved and configured by the retailer and its advisers. No tax rate or local formula is assumed or hardcoded here."],
    ["What are the delivery and returns terms?", "Shipping estimates, insurance, returns and exchanges have not been approved by the business. Final terms will be published before sales begin."],
    ["Does a piece come with an authenticity certificate?", "No certification or authenticity claim is made for any concept design on this site. Documentation will only be stated once verified for an actual piece."],
    ["Does the contact form send a message?", "Until a secure database connection is configured, the online form will not send or store an enquiry; the form tells you before use."],
  ];
  return (
    <div className="page-shell info-page policies-page">
      <div className="page-container">
        <PageIntro locale={locale} index="04 / 04" eyebrow={fa ? "پرسش‌های متداول" : "COMMON QUESTIONS"} title={fa ? <>پاسخ‌های روشن،<br /><em>پیش از هر تصمیم.</em></> : <>Clear answers,<br /><em>before you decide.</em></>} description={fa ? "در خرید جواهر، شفافیت بخشی از کیفیت است. این صفحه وضعیت واقعیِ امکانات این پیش‌نمایش را توضیح می‌دهد." : "In jewellery, clarity is part of quality. This page describes what this preview can and cannot do today."} />
        <div className="policy-alert"><span className="eyebrow__dot"/><div><strong>{fa ? "پیش‌نمایش فروشگاه" : "STORE PREVIEW"}</strong><p>{fa ? "قیمت، پرداخت، ارسال و سفارش هنوز در محیط عملیاتی فعال نیستند." : "Prices, payments, shipping and order placement are not live yet."}</p></div></div>
        <div className="faq-list">
          {rows.map(([question, answer], index) => <details className="faq-row" key={question} open={index === 0}><summary><span className="faq-row__number">0{index + 1}</span><span>{question}</span><i aria-hidden="true" /></summary><p>{answer}</p></details>)}
        </div>
        <div className="policies-bottom"><span className="micro-label">TALA · TRANSPARENCY FIRST</span><p>{fa ? "اگر قرار است درباره‌ی ماده، قیمت یا شرایط خرید ادعایی مطرح شود، باید پشتوانه‌ی واقعی و قابل بررسی داشته باشد." : "Any claim about materials, price or purchase terms should have a real, verifiable basis."}</p></div>
      </div>
    </div>
  );
}
