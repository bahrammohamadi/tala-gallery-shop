import type { Locale } from "@/lib/i18n";

export type CategorySlug = "rings" | "necklaces" | "bracelets" | "earrings" | "sets";
export type ArtworkKind = "ring" | "necklace" | "bracelet" | "earrings" | "set";

export type Product = {
  slug: string;
  name: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  category: CategorySlug;
  artwork: ArtworkKind;
  modelCode: string;
  description: Record<Locale, string>;
  story: Record<Locale, string>;
  specs: {
    purityPerMille: number | null;
    weightGrams: number | null;
    stone: Record<Locale, string> | null;
    availableSizes: string[];
    colors: string[];
  };
  priceVerified: false;
  inventoryVerified: false;
  conceptAsset: true;
};

export const categories: Array<{
  slug: CategorySlug;
  name: Record<Locale, string>;
  intro: Record<Locale, string>;
  artwork: ArtworkKind;
}> = [
  {
    slug: "rings",
    name: { fa: "انگشترها", en: "Rings" },
    intro: {
      fa: "حلقه‌هایی با حضوری آرام؛ از خطِ نرمِ یک بند تا درخششِ یک نقطه.",
      en: "Quietly expressive forms, from a softened band to a single point of light.",
    },
    artwork: "ring",
  },
  {
    slug: "necklaces",
    name: { fa: "گردنبندها", en: "Necklaces" },
    intro: {
      fa: "تناسبی ظریف برای همراهی نزدیک با پوست و نور.",
      en: "Considered proportions made to sit close to the skin and catch the light.",
    },
    artwork: "necklace",
  },
  {
    slug: "bracelets",
    name: { fa: "دستبندها", en: "Bracelets" },
    intro: {
      fa: "حرکتی نرم دور مچ؛ ساخته‌شده برای هر روز و هر خاطره.",
      en: "A fluid line around the wrist, made for the everyday and the remembered.",
    },
    artwork: "bracelet",
  },
  {
    slug: "earrings",
    name: { fa: "گوشواره‌ها", en: "Earrings" },
    intro: {
      fa: "جزئیاتی کوچک که با هر حرکت، نوری تازه پیدا می‌کنند.",
      en: "Small details that find a new glint with every movement.",
    },
    artwork: "earrings",
  },
  {
    slug: "sets",
    name: { fa: "نیم‌ست‌ها", en: "Jewellery sets" },
    intro: {
      fa: "قطعه‌هایی هم‌زبان؛ بدون آن‌که یکسان باشند.",
      en: "Pieces in conversation with one another, never simply matching.",
    },
    artwork: "set",
  },
];

export const products: Product[] = [
  {
    slug: "solitaire-01",
    name: { fa: "شکوفه‌ی نور شماره‌ی ۰۱", en: "Petal Pavé No. 01" },
    subtitle: { fa: "حلقه‌ی دو‌رنگ مفهومی · مدل سه‌بعدی", en: "Two-tone ring concept · 3D study" },
    category: "rings",
    artwork: "ring",
    modelCode: "CONCEPT-TL-01",
    description: {
      fa: "اتودی سه‌بعدی از حلقه‌ای دو‌رنگ با بندِ نقره‌ای‌نما، جزئیات داخلیِ طلایی‌نما، تاجی گلبرگی و نگین مرکزیِ نمایشی؛ روی یک شانه ردیفی از سنگ‌نما دیده می‌شود. این فرم و متریال صرفاً مفهومی‌اند و مشخصات محصول واقعی را نشان نمی‌دهند.",
      en: "A two-tone 3D concept: silver-tone shank, gold-tone inner detail, a sculpted petal gallery and demonstration center stone, with one pavé-style shoulder. These are visual studies, not verified product specifications.",
    },
    story: {
      fa: "یک شانه‌ی سنگ‌نما و شانه‌ی دیگرِ ساده، به تاجی گلبرگی و نگینی بزرگ می‌رسند؛ جزئیات داخلیِ طلایی‌نما، تضادِ دو‌رنگ را کامل می‌کند. این اتود برای کاوشِ فرم ساخته شده، نه به‌عنوان طرحِ تأییدشده‌ی کارگاه.",
      en: "One pavé-style shoulder leads to a raised petal gallery and generous center stone, while the opposite shoulder stays smooth. A gold-tone inner detail completes the contrast. This is a form study, not workshop-approved CAD.",

    },
    specs: {
      purityPerMille: null,
      weightGrams: null,
      stone: null,
      availableSizes: [],
      colors: [],
    },
    priceVerified: false,
    inventoryVerified: false,
    conceptAsset: true,
  },
  {
    slug: "line-necklace-01",
    name: { fa: "خطِ نور شماره‌ی ۰۱", en: "Line of Light No. 01" },
    subtitle: { fa: "گردنبند مفهومی", en: "Concept necklace" },
    category: "necklaces",
    artwork: "necklace",
    modelCode: "CONCEPT-TL-02",
    description: {
      fa: "اتودی تصویری از یک گردنبند با آویز مینیمال. وزن، عیار، طول زنجیر و موجودی هنوز از سوی کارگاه تأیید نشده‌اند.",
      en: "A visual study of a fine chain with a minimal pendant. Weight, purity, chain length and availability have not been confirmed by a workshop.",
    },
    story: {
      fa: "یک فرم کوچک، در امتداد خطی آرام؛ برای بررسی تناسب در کنار قطعات دیگر مجموعه.",
      en: "A small form on a quiet line, considered alongside the other pieces in the collection.",
    },
    specs: { purityPerMille: null, weightGrams: null, stone: null, availableSizes: [], colors: [] },
    priceVerified: false,
    inventoryVerified: false,
    conceptAsset: true,
  },
  {
    slug: "open-bangle-01",
    name: { fa: "حلقه‌ی باز شماره‌ی ۰۱", en: "Open Bangle No. 01" },
    subtitle: { fa: "دستبند مفهومی", en: "Concept bangle" },
    category: "bracelets",
    artwork: "bracelet",
    modelCode: "CONCEPT-TL-03",
    description: {
      fa: "فرمی مفهومی برای نمایش زبان طراحی TALA؛ اندازه، عیار، وزن و وضعیت تولید هنوز مشخص نیست.",
      en: "A concept form for the TALA design language. Size, purity, weight and production status are not yet specified.",
    },
    story: {
      fa: "فاصله‌ی کوچک میان دو سرِ دستبند، بخشی از ریتمِ بصری این اتود است.",
      en: "The small opening between the two ends gives this study its visual rhythm.",
    },
    specs: { purityPerMille: null, weightGrams: null, stone: null, availableSizes: [], colors: [] },
    priceVerified: false,
    inventoryVerified: false,
    conceptAsset: true,
  },
  {
    slug: "arc-earrings-01",
    name: { fa: "قوس شماره‌ی ۰۱", en: "Arc No. 01" },
    subtitle: { fa: "گوشواره‌ی مفهومی", en: "Concept earrings" },
    category: "earrings",
    artwork: "earrings",
    modelCode: "CONCEPT-TL-04",
    description: {
      fa: "اتودی برای بررسی یک جفت فرم قوسی. جزئیات اتصال، وزن و مشخصات ساخت هنوز تأیید نشده است.",
      en: "A study of a pair of curved forms. Fastenings, weight and manufacturing specifications are not confirmed.",
    },
    story: {
      fa: "دو منحنی هم‌خانواده، با اندکی تفاوت در زاویه و حرکت.",
      en: "Two related curves, with a slight difference in angle and movement.",
    },
    specs: { purityPerMille: null, weightGrams: null, stone: null, availableSizes: [], colors: [] },
    priceVerified: false,
    inventoryVerified: false,
    conceptAsset: true,
  },
  {
    slug: "stillness-set-01",
    name: { fa: "سکون شماره‌ی ۰۱", en: "Stillness No. 01" },
    subtitle: { fa: "نیم‌ست مفهومی", en: "Concept set" },
    category: "sets",
    artwork: "set",
    modelCode: "CONCEPT-TL-05",
    description: {
      fa: "یک ترکیب مفهومی از فرم‌های هماهنگ. اجزای نهایی، مواد و مشخصات تولید هنوز تعیین نشده‌اند.",
      en: "A concept pairing of related forms. Final components, materials and production specifications are still to be determined.",
    },
    story: {
      fa: "هم‌نشینی چند قطعه با یک زبان مشترک و فضای کافی برای تفاوت.",
      en: "Several pieces share a visual language while leaving room for difference.",
    },
    specs: { purityPerMille: null, weightGrams: null, stone: null, availableSizes: [], colors: [] },
    priceVerified: false,
    inventoryVerified: false,
    conceptAsset: true,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function productsForCategory(slug: string) {
  return products.filter((product) => product.category === slug);
}

export function formatTitle(locale: Locale, product: Product) {
  return product.name[locale];
}
