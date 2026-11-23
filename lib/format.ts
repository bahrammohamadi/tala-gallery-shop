import type { Locale } from "@/lib/i18n";

export function formatNumber(value: number, locale: Locale, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatWeight(weightGrams: number | null, locale: Locale) {
  if (weightGrams === null) return locale === "fa" ? "پس از تأیید" : "To be confirmed";
  return `${formatNumber(weightGrams, locale, 2)} ${locale === "fa" ? "گرم" : "g"}`;
}

export function formatVerifiedPrice(priceIRR: number | null, locale: Locale) {
  if (priceIRR === null) return locale === "fa" ? "استعلام قیمت" : "Price on request";
  const toman = Math.round(priceIRR / 10);
  return locale === "fa"
    ? `${formatNumber(toman, locale)} تومان`
    : `${formatNumber(toman, locale)} toman`;
}
