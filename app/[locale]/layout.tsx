import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartProvider } from "@/components/cart-provider";
import { LocaleDocument } from "@/components/locale-document";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return [{ locale: "fa" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const fa = value === "fa";
  return {
    title: { default: fa ? "خانه‌ی طلا" : "A house of gold", template: "%s — TALA" },
    description: fa
      ? "TALA؛ خانه‌ای برای زیورآلات معاصر و جزئیات ماندگار. تجربه‌ی نمایشی فعلی شامل مدل‌های مفهومی است؛ مشخصات و قیمت واقعی هنوز تأیید نشده‌اند."
      : "TALA is a house for contemporary jewellery and considered detail. This preview uses concept models; real product specifications and pricing are not yet verified.",
    openGraph: {
      type: "website",
      siteName: "TALA",
      locale: fa ? "fa_IR" : "en_US",
      title: fa ? "TALA — خانه‌ی طلا" : "TALA — A house of gold",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value as Locale;

  return (
    <div className={`locale-shell locale-${locale}`} dir={locale === "fa" ? "rtl" : "ltr"} lang={locale}>
      <LocaleDocument locale={locale} />
      <CartProvider locale={locale}>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
      </CartProvider>
    </div>
  );
}
