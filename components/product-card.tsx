import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatVerifiedPrice } from "@/lib/format";
import type { Product } from "@/lib/products";
import { ProductArtwork } from "@/components/product-artwork";

export function ProductCard({ product, locale, index = 0 }: { product: Product; locale: Locale; index?: number }) {
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <article className="product-card" style={{ "--card-index": index } as React.CSSProperties}>
      <Link className="product-card__visual" href={`/${locale}/products/${product.slug}`} aria-label={`${product.name[locale]} — ${fa ? "جزئیات طرح" : "View design details"}`}>
        <ProductArtwork kind={product.artwork} label={fa ? "اتود مفهومی" : "Concept study"} />
        <span className="concept-chip">{fa ? "نمونه‌ی مفهومی" : "CONCEPT"}</span>
        <span className="product-card__arrow"><Arrow size={16} strokeWidth={1.2} /></span>
      </Link>
      <div className="product-card__details">
        <div>
          <span className="product-card__category">{product.subtitle[locale]}</span>
          <h3><Link href={`/${locale}/products/${product.slug}`}>{product.name[locale]}</Link></h3>
        </div>
        <p className="product-card__price">{formatVerifiedPrice(null, locale)}</p>
      </div>
      <p className="product-card__footnote">{fa ? "قیمت و مشخصات پس از تأیید ارائه می‌شود" : "Pricing and specifications pending verification"}</p>
    </article>
  );
}
