import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { CinematicExperience } from "@/components/cinematic-experience";
import { CategoryStrip } from "@/components/category-strip";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { products } from "@/lib/products";
import { localeFrom } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const locale = localeFrom(value);
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  const featured = products.slice(0, 3);

  return (
    <>
      <CinematicExperience locale={locale} />
      <section className="content-section featured-section" id="featured-selection">
        <div className="section-container">
          <div className="featured-intro">
            <SectionHeading
              locale={locale}
              index="02"
              eyebrow={fa ? "از دفترِ طراحی" : "FROM THE DESIGN ATELIER"}
              title={fa ? <>فرم‌هایی برای<br /><em>ماندن.</em></> : <>Forms made<br /><em>to remain.</em></>}
              description={fa ? "این مجموعه، اتودی برای زبان بصری خانه‌ی TALA است. اطلاعات محصول تا زمان تأیید کارگاه، عمداً باز گذاشته شده‌اند." : "An early study of the TALA visual language. Product details remain intentionally open until verified by the workshop."}
            />
            <Link className="text-link text-link--underlined" href={`/${locale}/collections`}>
              <span>{fa ? "دیدن همه‌ی مجموعه‌ها" : "Explore all collections"}</span><Arrow size={16} strokeWidth={1.25} />
            </Link>
          </div>
          <div className="product-grid product-grid--home">
            {featured.map((product, index) => <ProductCard key={product.slug} product={product} locale={locale} index={index} />)}
          </div>
        </div>
      </section>

      <section className="content-section collections-section">
        <div className="section-container">
          <div className="collections-heading-row">
            <SectionHeading
              locale={locale}
              index="03"
              eyebrow={fa ? "آرشیوِ فرم‌ها" : "THE FORM ARCHIVE"}
              title={fa ? <>برای هر <em>روایت.</em></> : <>For every<br /><em>story.</em></>}
              description={fa ? "از یک حلقه‌ی مینیمال تا ترکیبی از قطعات هم‌زبان؛ هر دسته، مطالعه‌ای مستقل است." : "From a minimal band to a considered pairing; each category is its own study."}
            />
            <p className="collection-side-note">{fa ? "پنج مسیرِ طراحی" : "FIVE DESIGN DIRECTIONS"}<span>05</span></p>
          </div>
          <CategoryStrip locale={locale} />
        </div>
      </section>

      <section className="editorial-feature">
        <div className="editorial-feature__visual" aria-hidden="true">
          <div className="editorial-feature__orbit editorial-feature__orbit--outer" />
          <div className="editorial-feature__orbit editorial-feature__orbit--inner" />
          <div className="editorial-feature__spark">✳</div>
          <span className="editorial-feature__vertical">TALA · THE QUIET ART OF LIGHT</span>
        </div>
        <div className="editorial-feature__copy">
          <p className="eyebrow"><span className="eyebrow__dot" />{fa ? "اندیشه‌ی ما" : "OUR POINT OF VIEW"}</p>
          <span className="editorial-feature__chapter">04 / 05</span>
          <h2>{fa ? <>سادگی،<br />یک <em>انتخابِ دقیق</em> است.</> : <>Simplicity<br />is a <em>considered choice.</em></>}</h2>
          <p>{fa ? "ما به جای زرق‌وبرقِ بیشتر، از تناسب، لمس و نوری که روی یک لبه می‌نشیند حرف می‌زنیم. TALA در حال ساختن خانه‌ای است که هر قطعه در آن، با صداقت روایت شود." : "Rather than adding spectacle, we look to proportion, touch and the light resting on an edge. TALA is building a house where every piece can be described with care and honesty."}</p>
          <Link className="button button--line" href={`/${locale}/about`}>
            <span>{fa ? "آشنایی با خانه‌ی TALA" : "Discover the TALA house"}</span><Arrow size={15} strokeWidth={1.2} />
          </Link>
        </div>
      </section>

      <section className="promise-section content-section">
        <div className="section-container promise-grid">
          <div>
            <p className="eyebrow"><span className="eyebrow__dot" />{fa ? "اعتماد، پیش از خرید" : "CLARITY BEFORE COMMITMENT"}</p>
            <h2>{fa ? <>قیمت را<br /><em>با شفافیت</em> می‌سازیم.</> : <>A price, built<br /><em>with clarity.</em></>}</h2>
          </div>
          <div className="promise-detail">
            <p>{fa ? "قیمت طلا، دستمزد ساخت و مالیات هرگز حدس زده نمی‌شوند. تا زمانی که منبع معتبر، زمان به‌روزرسانی و مشخصات نهایی محصول تأیید نشده باشد، قیمت فقط با استعلام ارائه می‌شود." : "Gold reference prices, workshop fees and taxes are never guessed. Until a verified source, timestamp and final product specification are available, every price is by enquiry."}</p>
            <div className="promise-detail__meta"><span>{fa ? "منبع نرخ" : "RATE SOURCE"}</span><b>{fa ? "هنوز پیکربندی نشده" : "Not configured yet"}</b><i /></div>
            <Link className="text-link" href={`/${locale}/policies`}><span>{fa ? "آشنایی با فرایند سفارش" : "How enquiries work"}</span><Arrow size={16} strokeWidth={1.25} /></Link>
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-cta__line" />
        <span className="micro-label">TALA · EST. IN DETAIL</span>
        <h2>{fa ? <>چیزی آرام،<br /><em>برای همیشه.</em></> : <>Something quiet,<br /><em>for always.</em></>}</h2>
        <Link href={`/${locale}/contact`} className="button button--gold">
          <span>{fa ? "با ما در تماس باشید" : "Begin a conversation"}</span><Arrow size={16} strokeWidth={1.2} />
        </Link>
        <p>{fa ? "مشاوره‌ی حضوری و اطلاعات عرضه، پس از تکمیل مجموعه اعلام می‌شود." : "Appointments and release information will be shared when the collection is ready."}</p>
      </section>
    </>
  );
}
