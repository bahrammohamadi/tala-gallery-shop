import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ProductCard } from "@/components/product-card";
import { ProductArtwork } from "@/components/product-artwork";
import { getCategory, productsForCategory, categories } from "@/lib/products";
import { localeFrom } from "@/lib/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: value, slug } = await params;
  const locale = localeFrom(value);
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.name[locale],
    description: category.intro[locale],
  };
}

export default async function CollectionCategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: value, slug } = await params;
  const locale = localeFrom(value);
  const category = getCategory(slug);
  if (!category) notFound();
  const fa = locale === "fa";
  const list = productsForCategory(category.slug);
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="breadcrumb-line">
          <Link href={`/${locale}/collections`}>{fa ? "همه‌ی مجموعه‌ها" : "All collections"}</Link><span>/</span><span>{category.name[locale]}</span>
        </div>
        <div className="category-hero">
          <div className="category-hero__art"><ProductArtwork kind={category.artwork} label={fa ? "اتود مفهومی" : "Concept study"} large /></div>
          <PageIntro
            locale={locale}
            index="01 / 05"
            eyebrow={fa ? "آرشیوِ فرم‌ها" : "FORM ARCHIVE"}
            title={<>{category.name[locale]}<br /><em>{fa ? "به روایت TALA" : "by TALA"}</em></>}
            description={category.intro[locale]}
          />
        </div>
        <div className="category-intro-note">
          <p>{fa ? "برای این صفحه، تصویر و مشخصات تولیدیِ تأییدشده هنوز دریافت نشده است. طرح‌ها اتودهای مفهومی‌اند و قیمت در دسترس نیست." : "Approved production photography and specifications are not yet available for this page. These are concept studies and no prices are published."}</p>
          <span>{fa ? "اطلاعات قیمت" : "PRICE STATUS"}<b>{fa ? "استعلام قیمت" : "ON REQUEST"}</b></span>
        </div>
        {list.length ? (
          <div className="product-grid product-grid--collection">
            {list.map((product, index) => <ProductCard product={product} locale={locale} index={index} key={product.slug} />)}
          </div>
        ) : (
          <div className="empty-collection"><span>01 / 00</span><p>{fa ? "طرحی در این دسته ثبت نشده است." : "There are no designs in this collection yet."}</p></div>
        )}
        <div className="category-footer-link"><Link className="text-link" href={`/${locale}/collections`}><span>{fa ? "بازگشت به مجموعه‌ها" : "Back to all collections"}</span><Arrow size={16} strokeWidth={1.25} /></Link></div>
      </div>
    </div>
  );
}
