import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ProductArtwork } from "@/components/product-artwork";
import { ProductViewer } from "@/components/product-viewer";
import { getProduct, products } from "@/lib/products";
import { localeFrom } from "@/lib/i18n";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: value, slug } = await params;
  const locale = localeFrom(value);
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: locale === "fa" ? `تجربه‌ی سه‌بعدی · ${product.name[locale]}` : `3D experience · ${product.name[locale]}`,
    description: locale === "fa" ? "مدل سه‌بعدی مفهومی را با لمس یا ماوس بچرخانید." : "Rotate the concept model with touch or mouse.",
    robots: { index: false, follow: true },
  };
}

export default async function ProductExperiencePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: value, slug } = await params;
  const locale = localeFrom(value);
  const product = getProduct(slug);
  if (!product) notFound();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <div className="page-shell experience-page">
      <div className="page-container">
        <div className="breadcrumb-line"><Link href={`/${locale}/products/${product.slug}`}>{fa ? "بازگشت به محصول" : "Back to design"}</Link><span>/</span><span>{fa ? "نمایش سه‌بعدی" : "3D experience"}</span></div>
        <div className="experience-heading">
          <PageIntro
            locale={locale}
            index="01 / 01"
            eyebrow={fa ? "نمایش تعاملی" : "INTERACTIVE STUDY"}
            title={fa ? <>چرخش، از هر <em>زاویه.</em></> : <>See it from<br /><em>every angle.</em></>}
            description={fa ? "برای چرخاندن مدل، با ماوس بکشید یا روی صفحه لمس کنید. این مدل سه‌بعدی، نمونه‌ای مفهومی است؛ فایل نهایی CAD هنوز ارائه نشده." : "Drag with a mouse or touch the screen to rotate. This concept model is a visual study; an approved production CAD file has not been supplied."}
          />
          <div className="experience-product-label"><span className="micro-label">TALA / {product.modelCode}</span><h2>{product.name[locale]}</h2><Link className="text-link" href={`/${locale}/products/${product.slug}`}><span>{fa ? "مشاهده‌ی اطلاعات طرح" : "View design information"}</span><Arrow size={15} strokeWidth={1.2} /></Link></div>
        </div>
        <div className="experience-viewer-wrap">
          {product.slug === "solitaire-01" ? <ProductViewer locale={locale} /> : <div className="experience-static-art"><ProductArtwork kind={product.artwork} label={fa ? "اتود مفهومی" : "Concept study"} large /><p>{fa ? "مدل سه‌بعدی این طرح هنوز ارائه نشده است." : "A 3D model for this design has not been supplied yet."}</p></div>}
        </div>
        <div className="experience-footnote"><span>01</span><p>{fa ? "این تجربه برای مشاهده‌ی مدل مفهومی ساخته شده است؛ مشخصات مادی، اندازه و قابلیت سفارش را نشان نمی‌دهد." : "This experience displays a concept model only; it does not represent verified materials, sizing or order availability."}</p><span className="micro-label">{fa ? "TALA · نمای مفهومی" : "TALA · CONCEPT VIEW"}</span></div>
      </div>
    </div>
  );
}
