import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ProductArtwork } from "@/components/product-artwork";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, products } from "@/lib/products";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = localeFrom((await params).locale);
  return {
    title: locale === "fa" ? "مجموعه‌ها" : "Collections",
    description: locale === "fa" ? "مجموعه‌ی مفهومی جواهرات TALA؛ پنج مسیر برای کشف فرم و جزئیات." : "Explore five concept directions in the TALA jewellery archive.",
  };
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <div className="page-shell page-shell--collections">
      <div className="page-container">
        <PageIntro
          locale={locale}
          index="01 / 05"
          eyebrow={fa ? "آرشیوِ TALA" : "THE TALA ARCHIVE"}
          title={fa ? <>مجموعه‌ها،<br /><em>در ادامه‌ی یک نگاه.</em></> : <>Collections,<br /><em>in one quiet language.</em></>}
          description={fa ? "هر دسته، نقطه‌ی شروعی برای یک گفت‌وگوست. این طرح‌ها در حال حاضر مفهومی‌اند و اطلاعات ساخت و قیمت نهایی نشده است." : "Each collection is a starting point for a conversation. These designs are concept studies; production details and prices are not finalized."}
        />
        <div className="collection-overview-grid">
          {categories.map((category, index) => (
            <Link href={`/${locale}/collections/${category.slug}`} className="collection-overview-card" key={category.slug}>
              <span className="collection-overview-card__number">0{index + 1} / 05</span>
              <div className="collection-overview-card__image"><CategoryStripArtwork category={category} locale={locale} /></div>
              <div className="collection-overview-card__caption"><h2>{category.name[locale]}</h2><Arrow size={17} strokeWidth={1.2} /></div>
              <p>{category.intro[locale]}</p>
            </Link>
          ))}
        </div>
        <section className="all-designs-block">
          <div className="all-designs-block__header">
            <SectionHeading locale={locale} index="06" eyebrow={fa ? "طرح‌های مفهومی" : "CONCEPT DESIGNS"} title={fa ? <>از دفترِ <em>طراحی.</em></> : <>From the <em>design book.</em></>} />
          </div>
          <div className="product-grid">
            {products.map((product, index) => <ProductCard key={product.slug} product={product} locale={locale} index={index} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

function CategoryStripArtwork({ category, locale }: { category: (typeof categories)[number]; locale: ReturnType<typeof localeFrom> }) {
  return <ProductArtwork kind={category.artwork} label={locale === "fa" ? "طرح مفهومی" : "Concept study"} />;
}
