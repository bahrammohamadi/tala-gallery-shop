import Link from "next/link";

export const metadata = {
  title: "TALA — A house of gold",
  description: "A bilingual concept preview from TALA. Explore the visual study in Persian or English.",
};

export default function LocaleEntryPage() {
  return (
    <main className="locale-entry" dir="rtl">
      <div className="locale-entry__top"><span>TALA</span><i /> <span>OBJECTS OF LIGHT</span><span className="locale-entry__index">01 / 02</span></div>
      <div className="locale-entry__content">
        <p className="eyebrow"><span className="eyebrow__dot" />خانه‌ی طلا · پیش‌نمایش مفهومی</p>
        <h1>زیبایی، در<br /><em>جزئیات</em> ماندگار می‌شود.</h1>
        <p className="locale-entry__description">روایتی معاصر از طراحی، نور و فرم. این تجربه به فارسی و انگلیسی در دسترس است.</p>
        <nav className="locale-entry__actions" aria-label="انتخاب زبان">
          <Link className="button button--gold" href="/fa"><span>ورود به فارسی</span><span aria-hidden="true">↗</span></Link>
          <Link className="button button--line" href="/en" lang="en" dir="ltr"><span>Explore in English</span><span aria-hidden="true">↗</span></Link>
        </nav>
        <p className="locale-entry__note">مدل‌ها و اطلاعات محصول در این پیش‌نمایش، مفهومی و تأییدنشده‌اند.</p>
      </div>
      <div className="locale-entry__foot"><span>TEHRAN · DESIGN IN PROGRESS</span><span>© TALA</span></div>
      <div className="locale-entry__orb" aria-hidden="true" />
    </main>
  );
}
