import type { Locale } from "@/lib/i18n";

export function SectionHeading({
  locale,
  index,
  eyebrow,
  title,
  description,
  align = "start",
}: {
  locale: Locale;
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={`section-heading section-heading--${align}`} lang={locale}>
      <div className="section-heading__eyebrow"><span className="eyebrow__dot" /><span>{eyebrow}</span><span className="section-heading__number">{index}</span></div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
