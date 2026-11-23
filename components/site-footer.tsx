import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import type { Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-block">
          <BrandMark locale={locale} />
          <p>{fa ? "زیبایی، در جزئیات ماندگار می‌شود." : "Beauty, made lasting in the details."}</p>
        </div>
        <div className="footer-links-grid">
          <div className="footer-column">
            <span className="micro-label">{fa ? "کاوش" : "EXPLORE"}</span>
            <Link href={`/${locale}/collections`}>{fa ? "همه‌ی مجموعه‌ها" : "All collections"}</Link>
            <Link href={`/${locale}/about`}>{fa ? "داستان ما" : "Our story"}</Link>
            <Link href={`/${locale}/contact`}>{fa ? "تماس و شوروم" : "Contact & showroom"}</Link>
          </div>
          <div className="footer-column">
            <span className="micro-label">{fa ? "راهنما" : "CARE"}</span>
            <Link href={`/${locale}/care`}>{fa ? "نگهداری از طلا" : "Jewellery care"}</Link>
            <Link href={`/${locale}/ring-size`}>{fa ? "راهنمای سایز انگشتر" : "Ring size guide"}</Link>
            <Link href={`/${locale}/policies`}>{fa ? "پرسش‌های متداول و سیاست‌ها" : "FAQ & policies"}</Link>
          </div>
        </div>
        <Link href={`/${locale}/contact`} className="footer-contact-link">
          <span>{fa ? "برای مشاوره، با ما در ارتباط باشید" : "Speak with our team"}</span><Arrow size={17} strokeWidth={1.3} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} TALA</span>
        <span className="footer-demo-note">{fa ? "نمونه‌ی مفهومی · اطلاعات محصول و قیمت نیازمند تأیید" : "Concept preview · product data and pricing require verification"}</span>
        <Link href={`/${locale}/admin`}>{fa ? "مدیریت" : "Admin"}</Link>
      </div>
    </footer>
  );
}
