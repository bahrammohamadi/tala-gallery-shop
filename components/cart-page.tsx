"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductArtwork } from "@/components/product-artwork";
import { products } from "@/lib/products";
import { formatVerifiedPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function CartPage({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const { items, ready, remove, setQuantity, clear } = useCart();
  const validItems = items.map((line) => ({ ...line, product: products.find((product) => product.slug === line.slug) })).filter((line) => line.product);
  const ContinueArrow = fa ? ArrowUpLeft : ArrowUpRight;
  const DownArrow = fa ? ArrowDownLeft : ArrowDownRight;

  if (!ready) return <div className="page-shell cart-page"><div className="page-container"><div className="cart-loading" aria-label={fa ? "در حال بارگذاری فهرست" : "Loading enquiry list"}/></div></div>;

  return (
    <div className="page-shell cart-page">
      <div className="page-container">
        <div className="cart-head"><div><p className="eyebrow"><span className="eyebrow__dot"/>{fa ? "پیش از خرید" : "BEFORE A PURCHASE"}</p><h1>{fa ? <>فهرستِ <em>استعلام.</em></> : <>Your <em>enquiry list.</em></>}</h1><p>{fa ? "طرح‌هایی را که درباره‌ی آن‌ها پرسش دارید یک‌جا ببینید." : "Keep the designs you would like to ask about in one place."}</p></div><span className="cart-count-large">{String(validItems.reduce((n, item) => n + item.quantity, 0)).padStart(2, "0")}</span></div>
        {validItems.length === 0 ? (
          <div className="cart-empty"><span className="cart-empty__mark">T</span><h2>{fa ? "هنوز طرحی انتخاب نشده است." : "No designs added yet."}</h2><p>{fa ? "از مجموعه‌های مفهومی دیدن کنید و هر طرح را برای استعلام به این فهرست اضافه کنید." : "Explore the concept collections and add a design here to enquire about it."}</p><Link className="button button--gold" href={`/${locale}/collections`}><span>{fa ? "دیدن مجموعه‌ها" : "Explore collections"}</span><ContinueArrow size={16} strokeWidth={1.2}/></Link></div>
        ) : (
          <div className="cart-layout">
            <div className="cart-lines">
              <div className="cart-lines__head"><span>{fa ? "طرح انتخاب‌شده" : "SELECTED DESIGN"}</span><span>{fa ? "وضعیت قیمت" : "PRICE STATUS"}</span></div>
              {validItems.map(({ product, quantity }) => product && (
                <article className="cart-line" key={product.slug}>
                  <Link href={`/${locale}/products/${product.slug}`} className="cart-line__art"><ProductArtwork kind={product.artwork} label={fa ? "طرح مفهومی" : "Concept study"}/></Link>
                  <div className="cart-line__info"><span className="micro-label">{product.modelCode}</span><h2><Link href={`/${locale}/products/${product.slug}`}>{product.name[locale]}</Link></h2><p>{product.subtitle[locale]}</p><button className="cart-remove" type="button" onClick={() => remove(product.slug)}><Trash2 size={14}/>{fa ? "حذف از فهرست" : "Remove"}</button></div>
                  <div className="cart-line__right"><span className="cart-line__price">{formatVerifiedPrice(null, locale)}</span><div className="quantity-control" aria-label={fa ? "تعداد برای استعلام" : "Quantity for enquiry"}><button type="button" aria-label={fa ? "کم‌کردن تعداد" : "Decrease quantity"} onClick={() => setQuantity(product.slug, quantity - 1)}><Minus size={13}/></button><span>{quantity}</span><button type="button" aria-label={fa ? "زیادکردن تعداد" : "Increase quantity"} onClick={() => setQuantity(product.slug, quantity + 1)}><Plus size={13}/></button></div></div>
                </article>
              ))}
              <button type="button" className="clear-cart" onClick={clear}>{fa ? "پاک‌کردن فهرست" : "Clear list"}<DownArrow size={14}/></button>
            </div>
            <aside className="cart-summary">
              <p className="micro-label">{fa ? "پیش از ارسال درخواست" : "BEFORE YOU ENQUIRE"}</p>
              <h2>{fa ? "جزئیات نهایی، پس از بررسی." : "Final details, after review."}</h2>
              <div className="cart-summary__row"><span>{fa ? "قیمت فعلی" : "Current price"}</span><b>{fa ? "استعلام قیمت" : "On request"}</b></div>
              <div className="cart-summary__row"><span>{fa ? "عیار و وزن" : "Purity & weight"}</span><b>{fa ? "نیازمند تأیید" : "To be confirmed"}</b></div>
              <p>{fa ? "این فهرست، خرید یا رزرو موجودی نیست. تیم فروش پس از تأیید محصول واقعی، قیمت و شرایط را اعلام می‌کند." : "This list is not a purchase or inventory reservation. The sales team will confirm the actual piece, price and terms."}</p>
              <Link className="button button--gold button--wide" href={`/${locale}/checkout`}><span>{fa ? "ادامه به فرم استعلام" : "Continue to enquiry"}</span><ContinueArrow size={16} strokeWidth={1.2}/></Link>
              <span className="cart-summary__secure">{fa ? "پرداختی در این مرحله انجام نمی‌شود." : "No payment is collected at this step."}</span>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
