import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "راهنمای نگهداری از جواهرات" : "Jewellery care", description: fa ? "راهنمایی عمومی و محتاطانه برای نگهداری؛ دستور نهایی باید با جنس واقعی قطعه تطبیق داده شود." : "General, cautious jewellery care. Final instructions must be matched to the verified materials of each piece." };
}

export default async function CarePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  const steps = fa ? [
    ["01", "آخرین چیزی که می‌پوشید، اولین چیزی که درمی‌آورید.", "زیورآلات را پس از آرایش، عطر، کرم و مواد شوینده به تن کنید و پیش از استحمام یا فعالیت سنگین درآورید. برای دستور دقیق‌تر، راهنمای سازنده‌ی همان قطعه را دنبال کنید."],
    ["02", "هر قطعه، جای خودش.", "برای کاهش خراش و گره‌خوردن، هر قطعه را جداگانه و در محفظه‌ای نرم نگهداری کنید. زنجیرها را پیش از نگهداری ببندید و صاف قرار دهید."],
    ["03", "تمیزکردن، با احتیاط.", "روش تمیزکردن به جنس فلز، سنگ و نوع اتصال بستگی دارد. از شوینده‌ی خانگی، حمام اولتراسونیک یا مواد شیمیایی استفاده نکنید مگر آن‌که سازنده برای همان قطعه تأیید کرده باشد."],
    ["04", "بررسی دوره‌ای.", "اگر قفل، چنگ یا اتصال لق شده است، استفاده را متوقف کنید و از متخصص بخواهید قطعه را بررسی کند. از تعمیر خانگیِ سنگ یا اجزای ظریف پرهیز کنید."],
  ] : [
    ["01", "Last on, first off.", "Put jewellery on after cosmetics, fragrance, creams and household products; remove it before bathing or strenuous activity. Follow the maker's care instructions for the specific piece."],
    ["02", "Give each piece its own space.", "Store pieces separately in a soft compartment to reduce scratching and tangling. Fasten chains and lay them flat before storing."],
    ["03", "Clean with care.", "Care depends on the verified metal, stone and setting. Avoid household cleaners, ultrasonic baths and chemicals unless the maker has approved them for that exact piece."],
    ["04", "Check it from time to time.", "If a clasp, prong or join feels loose, stop wearing the piece and ask a qualified specialist to inspect it. Avoid home repairs to stones and delicate parts."],
  ];
  return (
    <div className="page-shell info-page">
      <div className="page-container">
        <PageIntro locale={locale} index="02 / 04" eyebrow={fa ? "راهنمای مراقبت" : "CARE NOTES"} title={fa ? <>ماندگاری، با<br /><em>نگهداریِ آرام.</em></> : <>Keep it close,<br /><em>care for it gently.</em></>} description={fa ? "این توصیه‌ها عمومی‌اند. دستور نگهداری هر قطعه باید بر پایه‌ی عیار، سنگ و روش ساختِ تأییدشده‌ی همان محصول ارائه شود." : "These notes are general. Care instructions for a specific piece must follow its verified purity, stones and construction."} />
        <div className="guide-list">
          {steps.map(([number, title, body]) => <article className="guide-row" key={number}><span className="guide-row__number">{number}</span><div><h2>{title}</h2><p>{body}</p></div><span className="guide-row__cross" aria-hidden="true">+</span></article>)}
        </div>
        <div className="guide-note"><span className="eyebrow__dot"/><p>{fa ? "این راهنما جایگزین توصیه‌ی تخصصی نیست. برای قطعه‌ای با سنگ، روکش یا ساختار خاص، پیش از تمیزکردن از سازنده راهنمایی بگیرید." : "This guide is not a substitute for specialist advice. Before cleaning a piece with a stone, coating or particular construction, ask its maker for instructions."}</p></div>
        <div className="page-cta-line"><Link className="text-link" href={`/${locale}/contact`}><span>{fa ? "پرسشی درباره‌ی نگهداری دارید؟" : "Have a care question?"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>
      </div>
    </div>
  );
}
