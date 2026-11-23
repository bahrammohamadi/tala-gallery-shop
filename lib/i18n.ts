export type Locale = "fa" | "en";

export function isLocale(value: string): value is Locale {
  return value === "fa" || value === "en";
}

export function localeFrom(value: string): Locale {
  return value === "en" ? "en" : "fa";
}

export function isPersian(locale: Locale) {
  return locale === "fa";
}

export function localizedPath(locale: Locale, pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "fa" || segments[0] === "en") segments.shift();
  return `/${locale}${segments.length ? `/${segments.join("/")}` : ""}`;
}

export const siteCopy = {
  fa: {
    brand: "خانه‌ی طلا",
    nav: {
      collections: "مجموعه‌ها",
      story: "درباره‌ی ما",
      care: "نگهداری",
      size: "راهنمای سایز",
      contact: "تماس با ما",
    },
    cart: "لیست استعلام",
    menu: "باز کردن منو",
    close: "بستن",
    language: "English",
    footerNote: "زیبایی، در جزئیات ماندگار می‌شود.",
  },
  en: {
    brand: "A house of gold",
    nav: {
      collections: "Collections",
      story: "Our story",
      care: "Jewellery care",
      size: "Ring sizing",
      contact: "Contact",
    },
    cart: "Enquiry list",
    menu: "Open menu",
    close: "Close",
    language: "فارسی",
    footerNote: "Beauty, made lasting in the details.",
  },
} as const;
