import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpLeft, ArrowUpRight, MoveUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductArtwork } from "@/components/product-artwork";
import { ProductCard } from "@/components/product-card";
import { ProductViewer } from "@/components/product-viewer";
import { SectionHeading } from "@/components/section-heading";
import { getProduct, products } from "@/lib/products";
import { localeFrom } from "@/lib/i18n";
import { formatWeight } from "@/lib/format";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: value, slug } = await params;
  const locale = localeFrom(value);
  const product = getProduct(slug);
  if (!product) return {};
  const title = product.name[locale];
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return {
    title,
    description: product.description[locale],
    robots: { index: false, follow: true },
    ...(base ? {
      alternates: {
        canonical: `${base}/${locale}/products/${slug}`,
        languages: {
          fa: `${base}/fa/products/${slug}`,
          en: `${base}/en/products/${slug}`,
        },
      },
    } : {}),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: value, slug } = await params;
  const locale = localeFrom(value);
  const product = getProduct(slug);
  if (!product) notFound();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  const related = products.filter((item) => item.slug !== product.slug).slice(0, 3);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: product.description[locale],
    category: product.category,
    brand: { "@type": "Brand", name: "TALA" },
    additionalProperty: [
      { "@type": "PropertyValue", name: fa ? "مدل" : "Model status", value: fa ? "مفهومی و تأییدنشده" : "Concept, unverified" },
    ],
  };

  return (
    <div className="page-shell product-detail-page">
      <div className="page-container">
        <div className="breadcrumb-line">
          <Link href={`/${locale}/collections`}>{fa ? "مجموعه‌ها" : "Collections"}</Link><span>/</span>
          <Link href={`/${locale}/collections/${product.category}`}>{fa ? "دسته‌بندی" : product.category}</Link><span>/</span><span>{product.name[locale]}</span>
        </div>
        <div className="product-detail-grid">
          <div className="product-detail-visual">
            {product.slug === "solitaire-01" ? <ProductViewer locale={locale} /> : <ProductArtwork kind={product.artwork} label={fa ? "اتود مفهومی محصول" : "Concept product study"} large />}
            <div className="product-visual-caption"><span>01 / 03</span><span>{fa ? "مدل مفهومی · برای نمایش" : "CONCEPT MODEL · FOR PRESENTATION"}</span></div>
          </div>
          <div className="product-detail-info">
            <p className="eyebrow"><span className="eyebrow__dot" />{product.subtitle[locale]}</p>
            <span className="product-detail-code">{fa ? "کد اتود" : "STUDY CODE"} / {product.modelCode}</span>
            <h1>{product.name[locale]}</h1>
            <p className="product-detail-lede">{product.description[locale]}</p>
            <div className="product-price-block">
              <span>{fa ? "قیمت" : "PRICE"}</span>
              <strong>{fa ? "استعلام قیمت" : "Price on request"}</strong>
              <small>{fa ? "قیمت زنده یا تأییدشده‌ای در دسترس نیست." : "No live or verified price is available."}</small>
            </div>
            <div className="product-spec-table">
              <div><span>{fa ? "عیار طلا" : "GOLD PURITY"}</span><b>{product.specs.purityPerMille ? `${product.specs.purityPerMille}‰` : fa ? "پس از تأیید" : "To be confirmed"}</b></div>
              <div><span>{fa ? "وزن" : "WEIGHT"}</span><b>{formatWeight(product.specs.weightGrams, locale)}</b></div>
              <div><span>{fa ? "سنگ" : "STONE"}</span><b>{product.specs.stone?.[locale] ?? (fa ? "مشخصات تأیید نشده" : "Not specified")}</b></div>
              <div><span>{fa ? "سایز و موجودی" : "SIZE & AVAILABILITY"}</span><b>{product.inventoryVerified ? (fa ? "موجودی محدود" : "Limited availability") : fa ? "نیازمند استعلام" : "Please enquire"}</b></div>
            </div>
            <div className="product-detail-actions">
              <AddToCartButton locale={locale} slug={product.slug} wide />
              <Link className="button button--line" href={`/${locale}/contact`}>{fa ? "گفت‌وگو با مشاور" : "Speak with a specialist"}<Arrow size={15} strokeWidth={1.2} /></Link>
            </div>
            <p className="product-purchase-note">{fa ? "افزودن به فهرست، خرید یا ثبت سفارش قطعی نیست. قیمت، موجودی و مشخصات باید از سوی فروشگاه تأیید شوند." : "Adding to the enquiry list is not a purchase or confirmed order. Price, availability and specifications must be verified by the store."}</p>
            <Link className="product-3d-link" href={`/${locale}/experience/${product.slug}`}><MoveUpRight size={15} strokeWidth={1.2} />{fa ? "بازکردن تجربه‌ی سه‌بعدی" : "Open the 3D experience"}</Link>
          </div>
        </div>

        <section className="product-story-section">
          <div className="product-story-section__index">TALA / 01</div>
          <div><p className="eyebrow"><span className="eyebrow__dot" />{fa ? "یادداشتِ طراحی" : "DESIGN NOTE"}</p><h2>{fa ? <>فرم، پیش از آن‌که<br /><em>نام بگیرد.</em></> : <>A form, before<br /><em>it takes a name.</em></>}</h2></div>
          <p>{product.story[locale]}</p>
        </section>

        <section className="product-spec-note">
          <div><span className="eyebrow__dot" /><span>{fa ? "درباره‌ی اطلاعات محصول" : "ABOUT PRODUCT DATA"}</span></div>
          <p>{fa ? "این صفحه، نمونه‌ی تجربه‌ی دیجیتال برند است. اطلاعات عیار، وزن، سنگ، سایز و موجودی عمداً ارائه نشده‌اند؛ تا زمانی که با محصول واقعی تطبیق داده و تأیید شوند." : "This page demonstrates the digital brand experience. Purity, weight, stone, size and inventory details are intentionally withheld until verified against a real product."}</p>
        </section>

        <section className="related-products">
          <div className="related-products__heading"><SectionHeading locale={locale} index="02" eyebrow={fa ? "از دفترِ طراحی" : "FROM THE DESIGN BOOK"} title={fa ? <>فرم‌های <em>دیگر.</em></> : <>Other <em>studies.</em></>} /></div>
          <div className="product-grid product-grid--related">{related.map((item, index) => <ProductCard key={item.slug} product={item} locale={locale} index={index} />)}</div>
        </section>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      </div>
    </div>
  );
}
