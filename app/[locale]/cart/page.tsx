import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "فهرست استعلام" : "Enquiry list", robots: { index: false, follow: false } };
}

export default async function CartRoute({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  return <CartPage locale={locale} />;
}
