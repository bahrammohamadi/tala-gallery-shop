import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { SectionHeading } from "@/components/section-heading";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = localeFrom((await params).locale);
  return { title: locale === "fa" ? "داستان TALA" : "The TALA story", description: locale === "fa" ? "نگاهی به دیدگاه طراحی و اصول شفافیت خانه‌ی TALA." : "Discover the design point of view and transparency principles of TALA." };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <div className="page-shell editorial-page">
      <div className="page-container">
        <PageIntro
          locale={locale}
          index="01 / 04"
          eyebrow={fa ? "درباره‌ی خانه‌ی TALA" : "THE TALA HOUSE"}
          title={fa ? <>خانه‌ای برای<br /><em>دیدنِ دقیق‌تر.</em></> : <>A house for<br /><em>looking closer.</em></>}
          description={fa ? "TALA در آغازِ مسیرِ ساخت یک خانه‌ی معاصر برای زیورآلات است؛ خانه‌ای که کیفیت را در تناسب، جزئیات و صداقتِ روایت می‌بیند." : "TALA is at the beginning of building a contemporary house for jewellery—one that finds quality in proportion, detail and an honest telling."}
        />
        <div className="about-opening">
          <div className="about-opening__visual" aria-hidden="true"><span className="about-opening__halo"/><span className="about-opening__letter">T</span><span className="about-opening__rule"/><span className="about-opening__caption">TALA / OBJECTS OF LIGHT</span></div>
          <div className="about-opening__copy"><p className="micro-label">{fa ? "یادداشتِ خانه" : "A NOTE FROM THE HOUSE"}</p><p className="about-opening__lead">{fa ? "زیبایی، با سکوت آغاز می‌شود." : "Beauty begins in the quiet."}</p><p>{fa ? "از فاصله‌ی میان دو فرم، از ردّی که دست روی سطح می‌گذارد، و از نوری که بی‌شتاب روی طلا حرکت می‌کند. این‌ها نقطه‌های شروعِ گفت‌وگوی ما هستند." : "In the space between two forms. In the trace a hand leaves on a surface. In light moving unhurriedly across gold. These are the beginnings of our conversation."}</p></div>
        </div>
        <section className="about-values">
          <div><SectionHeading locale={locale} index="02" eyebrow={fa ? "اصولِ طراحی" : "DESIGN PRINCIPLES"} title={fa ? <>کمتر، اما<br /><em>دقیق‌تر.</em></> : <>Less, but<br /><em>considered.</em></>} /></div>
          <div className="value-list">
            <article><span>01</span><h3>{fa ? "تناسب" : "Proportion"}</h3><p>{fa ? "هر خط باید دلیلِ خودش را داشته باشد." : "Every line should have a reason to be there."}</p></article>
            <article><span>02</span><h3>{fa ? "لمس" : "Touch"}</h3><p>{fa ? "زیور، پیش از آن‌که دیده شود، زندگی می‌شود." : "Jewellery is lived in before it is looked at."}</p></article>
            <article><span>03</span><h3>{fa ? "شفافیت" : "Clarity"}</h3><p>{fa ? "آن‌چه تأیید نشده، به‌عنوان واقعیت عرضه نمی‌شود." : "What has not been verified is never presented as fact."}</p></article>
          </div>
        </section>
        <section className="about-now">
          <span className="micro-label">{fa ? "امروز، در کجای مسیر هستیم؟" : "WHERE WE ARE TODAY"}</span>
          <div><h2>{fa ? "در حال شکل‌دادن به خانه‌ایم." : "The house is taking shape."}</h2><p>{fa ? "طرح‌ها و مدل‌های این وب‌سایت، نمونه‌های مفهومی برای نمایشِ تجربه‌ی دیجیتال هستند. تا زمان معرفیِ رسمی مجموعه، تصویر واقعی، مشخصات فنی، عیار، وزن، قیمت و موجودی هر قطعه باید از سوی کارگاه و تیم فروش تأیید شوند." : "The designs and 3D models on this website are concept studies for a digital experience. Before an official collection release, product photography, specifications, purity, weight, price and availability must be verified by the workshop and retail team."}</p></div>
        </section>
        <div className="page-cta-line"><Link className="text-link" href={`/${locale}/contact`}><span>{fa ? "با ما گفت‌وگو کنید" : "Start a conversation"}</span><Arrow size={16} strokeWidth={1.2}/></Link></div>
      </div>
    </div>
  );
}
