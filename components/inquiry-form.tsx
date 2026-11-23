"use client";

import { useState } from "react";
import { ArrowUpLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function InquiryForm({ locale, productItems = [] }: { locale: Locale; productItems?: Array<{ slug: string; quantity: number }> }) {
  const fa = locale === "fa";
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus(null);
    setPending(true);
    const form = new FormData(formElement);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
      productItems,
    };

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "INQUIRY_UNAVAILABLE");
      setStatus({
        kind: "success",
        message: fa ? "درخواست شما ثبت شد. تیم TALA برای پیگیری با شما تماس می‌گیرد." : "Your enquiry has been received. The TALA team will be in touch.",
      });
      formElement.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "INQUIRY_UNAVAILABLE";
      setStatus({
        kind: "error",
        message: message === "INQUIRY_UNAVAILABLE"
          ? (fa ? "ثبت آنلاین درخواست هنوز فعال نشده است. در این نسخه، اطلاعاتی ارسال یا ذخیره نشد." : "Online enquiries are not enabled yet. No information was sent or stored in this preview.")
          : (fa ? "ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید." : "We could not send your enquiry. Please try again."),
      });
    } finally {
      setPending(false);
    }
  }

  const staticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

  if (staticPreview) {
    return (
      <div className="inquiry-preview notice" role="status">
        <span className="micro-label">{fa ? "پیش‌نمایش ایستا" : "STATIC PREVIEW"}</span>
        <p>{fa ? "در نسخه‌ی GitHub Pages فرم‌ها ارسال یا ذخیره نمی‌شوند. لطفاً اطلاعات شخصی وارد نکنید." : "Forms are disabled in this GitHub Pages preview. Do not enter personal information; nothing will be submitted or stored."}</p>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label><span>{fa ? "نام و نام خانوادگی" : "Full name"}</span><input name="fullName" type="text" autoComplete="name" minLength={2} maxLength={120} required placeholder={fa ? "نام شما" : "Your name"} /></label>
        <label><span>{fa ? "شماره‌ی تماس" : "Phone number"}</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={7} maxLength={40} required placeholder={fa ? "شماره‌ی تماس" : "Phone number"} /></label>
      </div>
      <label><span>{fa ? "ایمیل (اختیاری)" : "Email (optional)"}</span><input name="email" type="email" autoComplete="email" maxLength={254} placeholder={fa ? "name@example.com" : "name@example.com"} /></label>
      <label><span>{fa ? "پیام شما" : "Your message"}</span><textarea name="message" rows={4} maxLength={1000} placeholder={fa ? "برای ما بنویسید چه چیزی نیاز دارید…" : "Tell us how we can help…"} /></label>
      <div className="inquiry-form__foot">
        <button className="button button--gold" type="submit" disabled={pending}>
          {pending ? <LoaderCircle size={16} className="spin" /> : <><span>{fa ? "ارسال درخواست" : "Send enquiry"}</span><Arrow size={15} strokeWidth={1.2} /></>}
        </button>
        <span>{fa ? "قیمت و شرایط سفارش، پیش از هر پرداختی تأیید می‌شود." : "Pricing and order terms are confirmed before any payment."}</span>
      </div>
      {status && <p className={`form-status form-status--${status.kind}`} role="status" aria-live="polite">{status.message}</p>}
    </form>
  );
}
