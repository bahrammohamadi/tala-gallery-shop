"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, CircleDollarSign, FilePlus2, LayoutDashboard, Package, Settings2, ShieldAlert, ShoppingBag, ScrollText, Store, Tags, Users, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type ProductRow = { id: string; slug: string; name_fa: string; name_en: string; is_published: boolean; is_archived: boolean; updated_at: string; product_variants?: Array<{ id: string; sku: string; is_active: boolean; stock_quantity: number }> };
type RuleRow = { making_fee_mode: string; making_fee_value: number | string; merchant_margin_percent: number | string; tax_percent: number | string; shipping_irr: number | string; quote_ttl_seconds: number; max_rate_age_seconds: number; updated_at: string };
type RateRow = { rate_per_gram_irr: number | string; reference_purity_per_mille: number; source: string; captured_at: string; is_verified: boolean };
type OrderRow = { id: string; order_number: string; status: string; created_at: string; amount_irr: number | string };
type AuditRow = { id: string; action: string; created_at: string; subject_type: string; actor_id: string };

const tabs = [
  { id: "overview", fa: "نمای کلی", en: "Overview", Icon: LayoutDashboard },
  { id: "products", fa: "محصولات", en: "Products", Icon: Package },
  { id: "pricing", fa: "قیمت و نرخ طلا", en: "Pricing & gold", Icon: CircleDollarSign },
  { id: "orders", fa: "سفارش‌ها", en: "Orders", Icon: ShoppingBag },
  { id: "content", fa: "محتوای سایت", en: "Site content", Icon: Store },
  { id: "operations", fa: "موجودی و تخفیف", en: "Stock & promotions", Icon: Tags },
  { id: "customers", fa: "مشتریان", en: "Customers", Icon: Users },
  { id: "audit", fa: "گزارش تغییرات", en: "Audit log", Icon: ScrollText },
  { id: "settings", fa: "تنظیمات", en: "Settings", Icon: Settings2 },
];

export function AdminDashboard({ locale, products, rules, latestRate, orders, audit }: {
  locale: Locale;
  products: ProductRow[];
  rules: RuleRow | null;
  latestRate: RateRow | null;
  orders: OrderRow[];
  audit: AuditRow[];
}) {
  const fa = locale === "fa";
  const [tab, setTab] = useState("overview");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function send(path: string, method: string, body: Record<string, unknown>, success: string) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "SAVE_FAILED");
      setNotice({ ok: true, message: success });
      router.refresh();
    } catch {
      setNotice({ ok: false, message: fa ? "ذخیره انجام نشد؛ دسترسی، اتصال و فیلدها را بررسی کنید." : "Save failed. Check access, connection and form values." });
    } finally {
      setBusy(false);
    }
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    await send("/api/admin/products", "POST", {
      slug: form.get("slug"), nameFa: form.get("nameFa"), nameEn: form.get("nameEn"),
      descriptionFa: form.get("descriptionFa"), descriptionEn: form.get("descriptionEn"), categorySlug: form.get("categorySlug"),
    }, fa ? "محصول به‌صورت پیش‌نویس ذخیره شد." : "Product saved as a draft.");
    formElement.reset();
  }

  async function submitRules(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await send("/api/admin/pricing-rules", "PUT", {
      makingFeeMode: form.get("makingFeeMode"), makingFeeValue: Number(form.get("makingFeeValue")),
      merchantMarginPercent: Number(form.get("merchantMarginPercent")), taxPercent: Number(form.get("taxPercent")),
      shippingIRR: Number(form.get("shippingIRR")), quoteTtlSeconds: Number(form.get("quoteTtlSeconds")), maxRateAgeSeconds: Number(form.get("maxRateAgeSeconds")),
    }, fa ? "قواعد قیمت‌گذاری ذخیره شد؛ تا ثبت نرخ معتبر، قیمت منتشر نمی‌شود." : "Pricing rules saved. No price is published until a verified rate is entered.");
  }

  async function submitRate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const localTime = String(form.get("capturedAt") ?? "");
    await send("/api/admin/gold-rates", "POST", {
      ratePerGramIRR: Number(form.get("ratePerGramIRR")), referencePurityPerMille: Number(form.get("referencePurityPerMille")),
      source: form.get("source"), capturedAt: new Date(localTime).toISOString(), confirmVerified: form.get("confirmVerified") === "on",
    }, fa ? "نرخ تأییدشده ثبت شد." : "Verified gold rate recorded.");
    formElement.reset();
  }

  const countPublished = products.filter((product) => product.is_published && !product.is_archived).length;
  const inStock = products.reduce((total, product) => total + (product.product_variants ?? []).filter((variant) => variant.is_active).reduce((sum, variant) => sum + variant.stock_quantity, 0), 0);
  const money = (value: number | string | null | undefined) => {
    if (value === undefined || value === null) return fa ? "تنظیم نشده" : "Not configured";
    return new Intl.NumberFormat(fa ? "fa-IR" : "en-US", { maximumFractionDigits: 0 }).format(Number(value));
  };
  const date = (value: string) => new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  return (
    <div className="admin-workspace" dir={fa ? "rtl" : "ltr"}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><span>T</span><div><b>TALA</b><small>{fa ? "مدیریت فروشگاه" : "STORE ADMIN"}</small></div></div>
        <nav aria-label={fa ? "ماژول‌های مدیریت" : "Admin modules"}>
          {tabs.map(({ id, fa: labelFa, en, Icon }) => <button className={tab === id ? "is-active" : ""} key={id} onClick={() => { setTab(id); setNotice(null); }} type="button"><Icon size={16} strokeWidth={1.4}/><span>{fa ? labelFa : en}</span>{tab === id && <i/>}</button>)}
        </nav>
        <div className="admin-sidebar__bottom"><span className="status-dot"/><span>{fa ? "اتصال زنده به پایگاه داده" : "Live database connection"}</span></div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar"><div><span className="micro-label">TALA / {fa ? "فضای کاری" : "WORKSPACE"}</span><h1>{tabs.find((item) => item.id === tab)?.[fa ? "fa" : "en"]}</h1></div><span className="admin-role-chip"><ShieldAlert size={13}/>{fa ? "مدیر مجاز" : "AUTHORISED ADMIN"}</span></header>
        {notice && <div className={`admin-notice${notice.ok ? " is-success" : " is-error"}`} role="status">{notice.ok ? <Check size={15}/> : <X size={15}/>}<span>{notice.message}</span><button type="button" aria-label={fa ? "بستن پیام" : "Dismiss"} onClick={() => setNotice(null)}><X size={14}/></button></div>}

        {tab === "overview" && <section className="admin-overview">
          <div className="admin-welcome"><span className="micro-label">{fa ? "وضعیت امروز" : "TODAY AT A GLANCE"}</span><h2>{fa ? "از جزئیات، تا تصمیم." : "Details, before decisions."}</h2><p>{fa ? "هیچ نرخ، قیمت یا موجودی بدون منبع و زمان ثبت معتبر به خریدار نمایش داده نمی‌شود." : "No rate, price or stock figure is shown to a customer without a verified source and timestamp."}</p></div>
          <div className="admin-stats">
            <div><span>{fa ? "محصول منتشرشده" : "PUBLISHED PRODUCTS"}</span><strong>{money(countPublished)}</strong><small>{fa ? `از ${products.length} محصول` : `of ${products.length} products`}</small></div>
            <div><span>{fa ? "موجودی فعال" : "ACTIVE STOCK"}</span><strong>{money(inStock)}</strong><small>{fa ? "واحد ثبت‌شده در واریانت‌ها" : "units across variants"}</small></div>
            <div><span>{fa ? "نرخ طلا" : "GOLD RATE"}</span><strong>{latestRate ? money(latestRate.rate_per_gram_irr) : "—"}</strong><small>{latestRate ? latestRate.source : fa ? "منبعی ثبت نشده" : "No source recorded"}</small></div>
            <div><span>{fa ? "قواعد قیمت" : "PRICING RULES"}</span><strong>{rules ? (fa ? "فعال" : "SET") : "—"}</strong><small>{rules ? date(rules.updated_at) : fa ? "هنوز پیکربندی نشده" : "Not configured"}</small></div>
          </div>
          <div className="admin-columns"><div className="admin-module-list"><div className="admin-panel-head"><h3>{fa ? "ماژول‌های عملیاتی" : "OPERATIONS"}</h3><span>09</span></div>{tabs.slice(1).map(({ id, fa: labelFa, en, Icon }, i) => <button key={id} type="button" onClick={() => setTab(id)}><span className="admin-module-list__index">0{i + 1}</span><Icon size={15}/><span>{fa ? labelFa : en}</span><ArrowUpRight size={14}/></button>)}</div><div className="admin-latest"><div className="admin-panel-head"><h3>{fa ? "آخرین تغییرها" : "RECENT CHANGES"}</h3><button type="button" onClick={() => setTab("audit")}>{fa ? "همه" : "All"}</button></div>{audit.length ? audit.slice(0, 5).map((entry) => <div className="audit-entry" key={entry.id}><span className="audit-entry__dot"/><div><b>{entry.action}</b><small>{entry.subject_type} · {date(entry.created_at)}</small></div></div>) : <p className="admin-muted">{fa ? "هنوز تغییری ثبت نشده است." : "No changes have been recorded yet."}</p>}</div></div>
        </section>}

        {tab === "products" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">CATALOG / 01</span><h2>{fa ? "محصولات و مجموعه‌ها" : "Products & collections"}</h2><p>{fa ? "محصول تازه ابتدا به‌صورت پیش‌نویس ذخیره می‌شود. انتشار، به وجود مشخصات و واریانت واقعی نیاز دارد." : "New products are saved as drafts. Publishing requires real specifications and a variant."}</p></div><div className="admin-panel admin-product-panel"><div className="admin-panel-head"><h3>{fa ? "فهرست محصولات" : "PRODUCT LIST"}</h3><span>{String(products.length).padStart(2, "0")}</span></div><div className="admin-table-wrap"><table><thead><tr><th>{fa ? "نام" : "NAME"}</th><th>{fa ? "دسته" : "CATEGORY"}</th><th>{fa ? "وضعیت" : "STATUS"}</th><th>{fa ? "واریانت" : "VARIANTS"}</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><b>{fa ? product.name_fa : product.name_en}</b><small>{product.slug}</small></td><td>—</td><td><span className={`admin-status ${product.is_published ? "admin-status--live" : ""}`}>{product.is_archived ? (fa ? "بایگانی" : "Archived") : product.is_published ? (fa ? "منتشرشده" : "Published") : (fa ? "پیش‌نویس" : "Draft")}</span></td><td>{product.product_variants?.length ?? 0}</td></tr>)}</tbody></table></div></div><div className="admin-panel admin-create-panel"><div className="admin-panel-head"><h3>{fa ? "ساخت محصول جدید" : "CREATE A PRODUCT"}</h3><FilePlus2 size={16}/></div><form className="admin-form" onSubmit={submitProduct}><div className="form-row"><label><span>Slug</span><input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required maxLength={80} /></label><label><span>{fa ? "مجموعه" : "Collection"}</span><select name="categorySlug" required><option value="rings">{fa ? "انگشترها" : "Rings"}</option><option value="necklaces">{fa ? "گردنبندها" : "Necklaces"}</option><option value="bracelets">{fa ? "دستبندها" : "Bracelets"}</option><option value="earrings">{fa ? "گوشواره‌ها" : "Earrings"}</option><option value="sets">{fa ? "نیم‌ست‌ها" : "Sets"}</option></select></label></div><div className="form-row"><label><span>نام فارسی</span><input name="nameFa" required minLength={2} maxLength={160}/></label><label><span>English name</span><input name="nameEn" required minLength={2} maxLength={160} dir="ltr"/></label></div><div className="form-row"><label><span>{fa ? "توضیح فارسی" : "Persian description"}</span><textarea name="descriptionFa" rows={3} maxLength={3000}/></label><label><span>{fa ? "توضیح انگلیسی" : "English description"}</span><textarea name="descriptionEn" rows={3} maxLength={3000} dir="ltr"/></label></div><button className="button button--gold" type="submit" disabled={busy}>{fa ? "ذخیره به‌عنوان پیش‌نویس" : "Save as draft"}</button></form></div></section>}

        {tab === "pricing" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">PRICING / 02</span><h2>{fa ? "نرخ طلا و قواعد قیمت" : "Gold rate & pricing rules"}</h2><p>{fa ? "این ورودی‌ها تنها منبع قیمت‌گذاری سمت سرور هستند. نرخ باید دستی از منبع مورد تأیید کسب‌وکار و با زمان ثبت شود." : "These inputs feed the server-side price engine. Rates must be entered from a business-approved source with a timestamp."}</p></div><div className="pricing-admin-grid"><form className="admin-panel admin-form" onSubmit={submitRules}><div className="admin-panel-head"><h3>{fa ? "قواعد محاسبه" : "PRICING RULES"}</h3><span>{rules ? (fa ? "ذخیره‌شده" : "SAVED") : (fa ? "تنظیم نشده" : "NOT SET")}</span></div><label><span>{fa ? "روش اجرت" : "MAKING FEE MODE"}</span><select name="makingFeeMode" defaultValue={rules?.making_fee_mode ?? "per_gram_irr"}><option value="per_gram_irr">{fa ? "مبلغ ریالی به‌ازای هر گرم" : "IRR per gram"}</option><option value="percent_of_gold">{fa ? "درصدی از ارزش طلا" : "Percentage of gold value"}</option></select></label><label><span>{fa ? "مقدار اجرت" : "MAKING FEE VALUE"}</span><input name="makingFeeValue" type="number" min="0" step={rules?.making_fee_mode === "percent_of_gold" ? "0.01" : "1"} defaultValue={rules?.making_fee_value ?? ""} required/></label><div className="form-row"><label><span>{fa ? "حاشیه‌ی فروشگاه (%)" : "MERCHANT MARGIN (%)"}</span><input name="merchantMarginPercent" type="number" min="0" max="1000" step="0.01" defaultValue={rules?.merchant_margin_percent ?? ""} required/></label><label><span>{fa ? "مالیاتِ پیکربندی‌شده (%)" : "CONFIGURED TAX (%)"}</span><input name="taxPercent" type="number" min="0" max="1000" step="0.01" defaultValue={rules?.tax_percent ?? ""} required/></label></div><label><span>{fa ? "هزینه‌ی ارسال (ریال)" : "SHIPPING (IRR)"}</span><input name="shippingIRR" type="number" min="0" step="1" defaultValue={rules?.shipping_irr ?? ""} required/></label><div className="form-row"><label><span>{fa ? "اعتبار پیش‌فاکتور (ثانیه)" : "QUOTE VALIDITY (SECONDS)"}</span><input name="quoteTtlSeconds" type="number" min="1" max="86400" defaultValue={rules?.quote_ttl_seconds ?? ""} required/></label><label><span>{fa ? "حداکثر عمر نرخ (ثانیه)" : "MAX RATE AGE (SECONDS)"}</span><input name="maxRateAgeSeconds" type="number" min="1" max="604800" defaultValue={rules?.max_rate_age_seconds ?? ""} required/></label></div><button className="button button--gold" type="submit" disabled={busy}>{fa ? "ذخیره‌ی قواعد" : "Save rules"}</button><p className="admin-form-note">{fa ? "فرمول و پایه‌ی مالیات باید پیش از فعال‌سازی توسط کسب‌وکار تأیید شود." : "The tax formula and base must be approved by the business before activation."}</p></form>
          <div className="pricing-admin-side"><div className="admin-panel"><div className="admin-panel-head"><h3>{fa ? "آخرین نرخ ثبت‌شده" : "LATEST GOLD RATE"}</h3><CircleDollarSign size={15}/></div>{latestRate ? <><strong className="rate-figure">{money(latestRate.rate_per_gram_irr)} <small>{fa ? "ریال / گرم" : "IRR / g"}</small></strong><p>{latestRate.source} · {date(latestRate.captured_at)}</p><span className="admin-status admin-status--live">{fa ? "تأییدشده" : "VERIFIED"}</span></> : <p className="admin-muted">{fa ? "هیچ نرخ تأییدشده‌ای ثبت نشده؛ قیمت‌گذاری غیرفعال است." : "No verified rate is recorded; customer pricing remains unavailable."}</p>}</div><form className="admin-panel admin-form" onSubmit={submitRate}><div className="admin-panel-head"><h3>{fa ? "ثبت نرخ تأییدشده" : "RECORD A VERIFIED RATE"}</h3></div><label><span>{fa ? "نرخ هر گرم (ریال)" : "RATE PER GRAM (IRR)"}</span><input name="ratePerGramIRR" type="number" min="1" step="1" required/></label><label><span>{fa ? "عیار مرجع (در هزار)" : "REFERENCE PURITY (‰)"}</span><input name="referencePurityPerMille" type="number" min="1" max="1000" defaultValue="750" required/></label><label><span>{fa ? "منبع مورد تأیید" : "APPROVED SOURCE"}</span><input name="source" required maxLength={200} placeholder={fa ? "نام منبع و مرجع داخلی" : "Source name and internal reference"}/></label><label><span>{fa ? "زمان ثبت نرخ" : "RATE TIMESTAMP"}</span><input name="capturedAt" type="datetime-local" required/></label><label className="admin-check-label"><input name="confirmVerified" type="checkbox" required/><span>{fa ? "تأیید می‌کنم این عدد از منبع معتبر کسب‌وکار بررسی شده است." : "I confirm this value has been checked against a business-approved source."}</span></label><button className="button button--line" type="submit" disabled={busy}>{fa ? "ثبت نرخ" : "Record rate"}</button></form></div></div></section>}

        {tab === "orders" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">ORDERS / 03</span><h2>{fa ? "سفارش و انجام" : "Orders & fulfilment"}</h2><p>{fa ? "هیچ سفارش واقعی از این پیش‌نمایش ایجاد نشده است. سفارش تنها پس از تأیید قیمت و راه‌اندازی پرداخت قابل ثبت است." : "No real orders have been created from this preview. Orders require confirmed prices and an approved payment integration."}</p></div><div className="admin-panel"><div className="admin-panel-head"><h3>{fa ? "سفارش‌های ثبت‌شده" : "RECENT ORDERS"}</h3><span>{orders.length}</span></div>{orders.length ? <div className="admin-table-wrap"><table><thead><tr><th>{fa ? "شناسه" : "ORDER"}</th><th>{fa ? "وضعیت" : "STATUS"}</th><th>{fa ? "مبلغ نهایی (ریال)" : "TOTAL (IRR)"}</th><th>{fa ? "تاریخ" : "CREATED"}</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.order_number}</td><td>{order.status}</td><td>{money(order.amount_irr)}</td><td>{date(order.created_at)}</td></tr>)}</tbody></table></div> : <p className="admin-empty">{fa ? "سفارشی برای نمایش وجود ندارد." : "There are no orders to display."}</p>}</div></section>}

        {tab === "content" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">CMS / 04</span><h2>{fa ? "محتوای سایت و رسانه" : "Site content & media"}</h2><p>{fa ? "ساختار محتوای قابل مدیریت آماده است؛ برای فعال‌سازی، پروژه‌ی Supabase باید ساخته و Storage پیکربندی شود." : "The content schema is prepared. Connect a Supabase project and configure Storage to activate this module."}</p></div><div className="admin-module-grid"><ModuleCard title={fa ? "مجموعه‌ها" : "Collections"} detail={fa ? "نام و ترتیب نمایش در دو زبان" : "Bilingual names and display order"} status={fa ? "فهرست زنده" : "LIVE LIST"}/><ModuleCard title={fa ? "رسانه‌ی محصول" : "Product media"} detail={fa ? "نیازمند اتصال فضای ذخیره‌سازی" : "Storage connection required"} status={fa ? "در انتظار Storage" : "STORAGE PENDING"}/><ModuleCard title={fa ? "صفحه‌ی نخست" : "Homepage"} detail={fa ? "روایت‌ها و محتوای تصویری»" : "Story and editorial content"} status={fa ? "نیازمند CMS" : "CMS PENDING"}/></div></section>}

        {tab === "operations" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">OPERATIONS / 05</span><h2>{fa ? "موجودی، واریانت و تخفیف" : "Variants, stock & promotions"}</h2><p>{fa ? "موجودی به هر واریانت وابسته است. ایجاد تخفیف نیازمند قواعد محدودیت، زمان انقضا و ثبت تغییرات است." : "Stock belongs to each variant. Promotions require limits, expiry rules and auditable changes."}</p></div><div className="admin-module-grid"><ModuleCard title={fa ? "واریانت‌ها" : "Variants"} detail={fa ? "عیار، وزن، سایز، رنگ و کد SKU" : "Purity, weight, size, colour and SKU"} status={fa ? "پایگاه داده آماده" : "SCHEMA READY"}/><ModuleCard title={fa ? "موجودی" : "Inventory"} detail={fa ? "موجودی هر واریانت، با بازبینی سفارش" : "Per-variant quantities and revalidation"} status={fa ? "پایگاه داده آماده" : "SCHEMA READY"}/><ModuleCard title={fa ? "کدهای تخفیف" : "Discount codes"} detail={fa ? "محدوده و تاریخ اعتبارِ قابل تنظیم" : "Configurable scope and expiry"} status={fa ? "پایگاه داده آماده" : "SCHEMA READY"}/></div><div className="admin-warning"><ShieldAlert size={15}/><p>{fa ? "ابزار ویرایش این سه ماژول هنوز به رابط کاربری متصل نشده است؛ برای تغییر داده‌ها، تا پیش از تکمیل API از Supabase Studio و با کنترل دسترسی استفاده کنید." : "The UI for these modules is not wired yet. Until completion, edit through Supabase Studio with approved access controls."}</p></div></section>}

        {tab === "customers" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">CUSTOMERS / 06</span><h2>{fa ? "مشتریان و حریم خصوصی" : "Customers & privacy"}</h2><p>{fa ? "اطلاعات مشتری فقط از نشست احرازشده یا استعلام ذخیره‌شده خوانده می‌شود و نباید در مرورگر عمومی نگهداری شود." : "Customer data is read only from an authenticated session or a stored enquiry; it is never held in public browser state."}</p></div><div className="admin-empty admin-empty--large"><Users size={22} strokeWidth={1.2}/><p>{fa ? "برای حفظ حریم خصوصی، اطلاعات مشتریان تنها پس از اتصال و پیکربندی RLS نمایش داده خواهد شد." : "Customer records appear only after a database is connected and row-level security is configured."}</p></div></section>}

        {tab === "audit" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">AUDIT / 07</span><h2>{fa ? "گزارش تغییرات" : "Audit log"}</h2><p>{fa ? "تغییرات حساس قیمت، محصول و سفارش به‌صورت رویدادهای غیرقابل‌ویرایش ثبت می‌شوند." : "Sensitive price, product and order changes are recorded as append-only events."}</p></div><div className="admin-panel"><div className="admin-panel-head"><h3>{fa ? "رویدادهای اخیر" : "RECENT EVENTS"}</h3><span>{audit.length}</span></div>{audit.length ? audit.map((entry) => <div className="audit-entry audit-entry--full" key={entry.id}><span className="audit-entry__dot"/><div><b>{entry.action}</b><small>{entry.subject_type} · {entry.actor_id} · {date(entry.created_at)}</small></div></div>) : <p className="admin-empty">{fa ? "هنوز رویدادی ثبت نشده است." : "No audit events recorded yet."}</p>}</div></section>}

        {tab === "settings" && <section className="admin-tab-content"><div className="admin-section-intro"><span className="micro-label">SETTINGS / 08</span><h2>{fa ? "تنظیمات فروشگاه" : "Store settings"}</h2><p>{fa ? "ارز داخلی ریال (IRR) است؛ نمایش تومان، فقط پس از تبدیل صریح با نسبت ۱۰ ریال به ۱ تومان انجام می‌شود." : "Internal amounts are stored in Iranian rial (IRR); toman display uses an explicit 10 IRR to 1 toman conversion."}</p></div><div className="admin-module-grid"><ModuleCard title={fa ? "محدوده‌ی قیمت" : "Pricing freshness"} detail={rules ? `${rules.max_rate_age_seconds} ${fa ? "ثانیه" : "seconds"}` : (fa ? "پیکربندی نشده" : "Not configured")} status={rules ? (fa ? "فعال" : "SET") : (fa ? "غیرفعال" : "OFF")}/><ModuleCard title={fa ? "دسترسی" : "Access control"} detail={fa ? "مدیر و مدیر فروشگاه با نقش‌های جداگانه" : "Admin and manager roles"} status={fa ? "RLS" : "RLS"}/><ModuleCard title={fa ? "درگاه پرداخت" : "Payment gateway"} detail={fa ? "متصل نشده؛ هیچ پرداختی پذیرفته نمی‌شود" : "Not connected; no payments accepted"} status={fa ? "غیرفعال" : "NOT CONNECTED"}/></div></section>}
      </div>
    </div>
  );
}

function ModuleCard({ title, detail, status }: { title: string; detail: string; status: string }) {
  return <article className="admin-module-card"><span className="admin-module-card__status"><i/>{status}</span><h3>{title}</h3><p>{detail}</p></article>;
}
