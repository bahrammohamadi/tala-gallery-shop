import type { Metadata } from "next";
import { MapPin, MessageCircle, Clock3 } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { InquiryForm } from "@/components/inquiry-form";
import { localeFrom } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const fa = localeFrom((await params).locale) === "fa";
  return { title: fa ? "تماس و شوروم" : "Contact & showroom", description: fa ? "برای گفت‌وگو با خانه‌ی TALA از فرم استعلام استفاده کنید؛ اطلاعات شوروم پس از تأیید منتشر می‌شود." : "Contact the TALA house by enquiry; showroom details will be published once confirmed." };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFrom((await params).locale);
  const fa = locale === "fa";
  return (
    <div className="page-shell contact-page">
      <div className="page-container">
        <PageIntro locale={locale} index="01 / 02" eyebrow={fa ? "گفت‌وگو با TALA" : "SPEAK WITH TALA"} title={fa ? <>هر گفت‌وگو،<br /><em>از یک پرسش آغاز می‌شود.</em></> : <>Every conversation<br /><em>begins with a question.</em></>} description={fa ? "برای دریافت اطلاعات تکمیلی درباره‌ی طرح‌ها، آمادگی فروش یا همکاری با ما در تماس باشید." : "For information about the designs, a future release or working together, send us a note."} />
        <div className="contact-layout">
          <div className="contact-details">
            <div className="contact-detail"><span className="contact-detail__icon"><MessageCircle size={17} strokeWidth={1.25}/></span><div><span className="micro-label">{fa ? "مشاوره و استعلام" : "ENQUIRIES"}</span><p>{fa ? "برای شروع، فرم پیام را پر کنید." : "Use the enquiry form to begin."}</p></div></div>
            <div className="contact-detail"><span className="contact-detail__icon"><MapPin size={17} strokeWidth={1.25}/></span><div><span className="micro-label">{fa ? "نشانی شوروم" : "SHOWROOM"}</span><p>{fa ? "نشانی پس از تأیید رسمی اعلام می‌شود." : "Location to be announced after confirmation."}</p></div></div>
            <div className="contact-detail"><span className="contact-detail__icon"><Clock3 size={17} strokeWidth={1.25}/></span><div><span className="micro-label">{fa ? "ساعات پاسخ‌گویی" : "HOURS"}</span><p>{fa ? "ساعات کاری هنوز منتشر نشده است." : "Opening hours have not been published."}</p></div></div>
            <div className="contact-footnote">{fa ? "برای حفظ حریم خصوصی، اطلاعات تماس فقط در صورت فعال‌شدن اتصال امن ذخیره می‌شود." : "For privacy, contact details are only stored once a secure connection is enabled."}</div>
          </div>
          <div className="contact-form-wrap"><div className="contact-form-head"><span className="micro-label">{fa ? "فرم استعلام" : "ENQUIRY FORM"}</span><span>01 / 01</span></div><InquiryForm locale={locale}/></div>
        </div>
      </div>
    </div>
  );
}
