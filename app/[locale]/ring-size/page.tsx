import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "راهنمای سایز انگشتر" : "Ring size guide", description: fa ? "روش‌های اولیه برای سنجش اندازه؛ سایز نهایی باید با جدول کارگاه سازنده تطبیق داده شود." : "A first guide to measuring a ring; the final size must be matched to the maker's chart." };
}

export default async function RingSizePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <div className="page-shell info-page ring-size-page">
      <div className="page-container">
        <PageIntro locale={locale} index="03 / 04" eyebrow={fa ? "راهنمای انتخاب" : "A FITTING GUIDE"} title={fa ? <>اندازه‌ای برای<br /><em>همراهیِ راحت.</em></> : <>A fit that feels<br /><em>like your own.</em></>} description={fa ? "سیستم سایزبندی میان کارگاه‌ها و کشورها یکسان نیست. اندازه‌ی نهایی هر حلقه باید با جدولِ تأییدشده‌ی همان سازنده تطبیق داده شود." : "Sizing systems vary between makers and countries. A final ring size must be matched to that maker's verified chart."} />
        <div className="size-guide-layout">
          <div className="size-guide-number"><span>01</span><div className="size-guide-number__circle"><span>Ø</span></div><p>{fa ? "اندازه‌گیریِ حلقه‌ای که به‌خوبی اندازه است" : "Measure a ring that already fits"}</p></div>
          <div className="size-guide-steps">
            <article><span>01</span><h2>{fa ? "حلقه‌ی مناسب را انتخاب کنید." : "Choose a well-fitting ring."}</h2><p>{fa ? "حلقه‌ای را انتخاب کنید که روی همان انگشت راحت است و بدون فشار از بند انگشت عبور می‌کند." : "Choose a ring that feels comfortable on the same finger and passes over the knuckle without force."}</p></article>
            <article><span>02</span><h2>{fa ? "قطر داخلی را دقیق بسنجید." : "Measure its inside diameter."}</h2><p>{fa ? "با خط‌کش دقیق یا کولیس، از یک لبه‌ی داخلی تا لبه‌ی مقابل را اندازه بگیرید. ضخامت خود حلقه را در اندازه وارد نکنید." : "Use a precise ruler or calliper to measure across the inside of the ring. Do not include the band's thickness."}</p></article>
            <article><span>03</span><h2>{fa ? "به متخصص بسپارید." : "Have the maker confirm it."}</h2><p>{fa ? "عدد را به کارگاه یا مشاور فروش بدهید تا آن را با جدول داخلیِ محصول، پهنای حلقه و شکل انگشت تطبیق دهد. تبدیل مستقیم به یک سایز جهانی، بدون جدول مرجع قابل اتکا نیست." : "Share the measurement with the workshop or a specialist, who can compare it with the product chart, band width and finger shape. A universal size conversion is not reliable without the maker's reference chart."}</p></article>
          </div>
        </div>
        <div className="size-warning"><span className="eyebrow__dot"/><p>{fa ? "در این پیش‌نمایش، سایزهای قابل سفارش برای هیچ محصولی تأیید نشده‌اند. برای سفارش واقعی، جدول سایزِ همان قطعه منتشر خواهد شد." : "No orderable sizes are confirmed in this preview. The verified size chart for each real piece will be published before release."}</p></div>
        <div className="page-cta-line"><Link className="text-link" href={`/${locale}/contact`}><span>{fa ? "برای اندازه‌گیری راهنمایی بگیرید" : "Ask for fitting help"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>
      </div>
    </div>
  );
}
