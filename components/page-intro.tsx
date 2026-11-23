import type { Locale } from "@/lib/i18n";

export function PageIntro({
  locale,
  eyebrow,
  title,
  description,
  index,
  centered = false,
}: {
  locale: Locale;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  index?: string;
  centered?: boolean;
}) {
  return (
    <header className={`page-intro${centered ? " page-intro--center" : ""}`} lang={locale}>
      <div className="page-intro__eyebrow"><span className="eyebrow__dot" /><span>{eyebrow}</span>{index && <i>{index}</i>}</div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}
