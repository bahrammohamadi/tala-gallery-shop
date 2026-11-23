import Link from "next/link";
import { ArrowDownLeft, ArrowDownRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { categories } from "@/lib/products";
import { ProductArtwork } from "@/components/product-artwork";

export function CategoryStrip({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const Arrow = fa ? ArrowDownLeft : ArrowDownRight;
  return (
    <div className="category-strip">
      {categories.map((category, index) => (
        <Link className="category-tile" href={`/${locale}/collections/${category.slug}`} key={category.slug}>
          <div className="category-tile__art"><ProductArtwork kind={category.artwork} label={fa ? "اتود مفهومی" : "Concept study"} /></div>
          <div className="category-tile__caption">
            <span className="category-tile__index">0{index + 1}</span>
            <span className="category-tile__title">{category.name[locale]}</span>
            <Arrow size={15} strokeWidth={1.2} />
          </div>
        </Link>
      ))}
    </div>
  );
}
