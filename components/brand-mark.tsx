import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function BrandMark({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  return (
    <Link className={`brand-mark${compact ? " brand-mark--compact" : ""}`} href={`/${locale}`} aria-label="TALA home">
      <span className="brand-mark__latin">TALA</span>
      {!compact && <span className="brand-mark__rule" aria-hidden="true" />}
      {!compact && <span className="brand-mark__sub" lang={locale}>{locale === "fa" ? "خانه‌ی طلا" : "A house of gold"}</span>}
    </Link>
  );
}
