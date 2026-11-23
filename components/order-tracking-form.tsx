"use client";

import { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type Result = { orderNumber: string; status: string; createdAt: string };

export function OrderTrackingForm({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const staticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("orderId");
    const orderId = String(value ?? "").trim();
    setPending(true);
    setStatus(null);
    setResult(null);
    try {
      const response = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "TRACKING_UNAVAILABLE");
      setResult(body as Result);
    } catch (error) {
      const code = error instanceof Error ? error.message : "TRACKING_UNAVAILABLE";
      setStatus(code === "AUTH_REQUIRED"
        ? (fa ? "برای پیگیری، ابتدا وارد حساب کاربری شوید." : "Sign in to track an order.")
        : code === "ORDER_NOT_FOUND"
          ? (fa ? "سفارشی با این شناسه در حساب شما پیدا نشد." : "No order with this ID was found in your account.")
          : (fa ? "پیگیری سفارش در این پیش‌نمایش فعال نیست." : "Order tracking is not active in this preview."));
    } finally {
      setPending(false);
    }
  }

  const statusLabels: Record<string, { fa: string; en: string }> = {
    inquiry: { fa: "درخواست دریافت شد", en: "Enquiry received" },
    confirmed: { fa: "تأیید شده", en: "Confirmed" },
    processing: { fa: "در حال آماده‌سازی", en: "In preparation" },
    shipped: { fa: "ارسال شده", en: "Shipped" },
    delivered: { fa: "تحویل شده", en: "Delivered" },
    cancelled: { fa: "لغو شده", en: "Cancelled" },
  };
  const createdAt = result ? new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", { dateStyle: "long" }).format(new Date(result.createdAt)) : "";

  return (
    <div className="tracking-widget">
      {staticPreview ? (
        <p className="notice" role="status">{fa ? "پیگیری سفارش در نسخه‌ی GitHub Pages فعال نیست. لطفاً شناسه‌ی سفارش یا اطلاعات شخصی وارد نکنید." : "Order tracking is unavailable in this GitHub Pages preview. Please do not enter an order ID or personal information."}</p>
      ) : (
        <>
          <form className="tracking-form" onSubmit={submit}>
            <label><span>{fa ? "شناسه‌ی سفارش" : "Order ID"}</span><input name="orderId" required minLength={36} maxLength={36} pattern="[0-9a-fA-F-]{36}" placeholder="00000000-0000-0000-0000-000000000000" /></label>
            <button className="button button--gold" type="submit" disabled={pending}>{pending ? <LoaderCircle size={16} className="spin"/> : <><span>{fa ? "پیگیری" : "Track"}</span><Search size={15}/></>}</button>
          </form>
          {status && <p className="form-status form-status--error" role="status">{status}</p>}
          {result && <div className="tracking-result" role="status"><span className="eyebrow__dot"/><div><span className="micro-label">{result.orderNumber}</span><h2>{statusLabels[result.status]?.[locale] ?? result.status}</h2><p>{fa ? "ثبت‌شده در" : "Created"} · {createdAt}</p></div></div>}
        </>
      )}
    </div>
  );
}
