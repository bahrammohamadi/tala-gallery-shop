"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { useCart } from "@/components/cart-provider";
import { products } from "@/lib/products";
import type { Locale } from "@/lib/i18n";

export function CheckoutPanel({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const { items, ready } = useCart();
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  const selected = items.map((line) => ({ ...line, product: products.find((product) => product.slug === line.slug) })).filter((line) => line.product);

  if (!ready) return <div className="checkout-loading" aria-label={fa ? "در حال بارگذاری" : "Loading"}/>;
  if (!selected.length) return <div className="checkout-empty"><p>{fa ? "فهرست استعلام شما خالی است." : "Your enquiry list is empty."}</p><Link className="text-link" href={`/${locale}/collections`}><span>{fa ? "دیدن مجموعه‌ها" : "Explore collections"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>;

  return (
    <div className="checkout-layout">
      <div className="checkout-form-column">
        <div className="checkout-heading"><span className="micro-label">{fa ? "اطلاعات تماس" : "CONTACT DETAILS"}</span><h2>{fa ? "درخواستِ استعلام" : "Request an enquiry"}</h2><p>{fa ? "این فرم، فقط برای گفت‌وگوست؛ سفارش یا پرداختی ثبت نمی‌شود." : "This form starts a conversation; it does not create an order or take payment."}</p></div>
        <InquiryForm locale={locale} productItems={selected.map((line) => ({ slug: line.product!.slug, quantity: line.quantity }))} />
      </div>
      <aside className="checkout-summary">
        <span className="micro-label">{fa ? "طرح‌های انتخاب‌شده" : "SELECTED DESIGNS"}</span>
        {selected.map(({ product, quantity }) => product && <div className="checkout-summary__item" key={product.slug}><span className="checkout-summary__quantity">{String(quantity).padStart(2, "0")}</span><div><b>{product.name[locale]}</b><small>{product.subtitle[locale]}</small></div></div>)}
        <div className="checkout-summary__price"><span>{fa ? "قیمت نهایی" : "FINAL PRICE"}<small>{fa ? "پس از تأیید نرخ و مشخصات" : "After rate and specification verification"}</small></span><b>{fa ? "استعلام" : "On request"}</b></div>
        <p>{fa ? "تا پیش از تأیید فروشگاه، این انتخاب ذخیره‌ی موجودی یا تعهد خرید ایجاد نمی‌کند." : "Until confirmed by the retailer, this selection does not reserve stock or create a purchase commitment."}</p>
        <Link className="text-link" href={`/${locale}/cart`}><span>{fa ? "بازگشت به فهرست" : "Back to enquiry list"}</span><Arrow size={15} strokeWidth={1.2}/></Link>
      </aside>
    </div>
  );
}
