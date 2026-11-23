import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TALA — طلا، در روایتِ جزئیات",
    template: "%s — TALA",
  },
  description:
    "خانه‌ی طلا؛ روایتی معاصر از طراحی، نور و جزئیات. مجموعه‌ی مفهومی TALA تا زمان تأیید مشخصات واقعی، صرفاً برای نمایش تجربه‌ی دیجیتال است.",
  applicationName: "TALA",
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
