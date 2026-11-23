"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpLeft, ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { useCart } from "@/components/cart-provider";
import { localizedPath, siteCopy, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname() ?? `/${locale}`;
  const copy = siteCopy[locale];
  const otherLocale = locale === "fa" ? "en" : "fa";
  const { count } = useCart();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuToggleRef.current?.focus());
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const Arrow = locale === "fa" ? ArrowUpLeft : ArrowUpRight;
  const menuLinks = [
    { href: `/${locale}/collections`, label: copy.nav.collections },
    { href: `/${locale}/about`, label: copy.nav.story },
    { href: `/${locale}/care`, label: copy.nav.care },
    { href: `/${locale}/ring-size`, label: copy.nav.size },
    { href: `/${locale}/contact`, label: copy.nav.contact },
  ];

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="site-header__inner">
          <button ref={menuToggleRef} className="icon-button menu-toggle" type="button" aria-label={open ? copy.close : copy.menu} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={19} strokeWidth={1.4} /> : <Menu size={19} strokeWidth={1.4} />}
          </button>
          <nav className="primary-nav" aria-label={locale === "fa" ? "ناوبری اصلی" : "Main navigation"}>
            <Link href={menuLinks[0].href}>{menuLinks[0].label}<span className="nav-mark" /></Link>
            <div className="nav-dropdown">
              <Link href={menuLinks[0].href}>{locale === "fa" ? "دسته‌بندی‌ها" : "Explore"}</Link>
              <div className="nav-dropdown__panel">
                {[
                  ["rings", locale === "fa" ? "انگشترها" : "Rings"],
                  ["necklaces", locale === "fa" ? "گردنبندها" : "Necklaces"],
                  ["bracelets", locale === "fa" ? "دستبندها" : "Bracelets"],
                  ["earrings", locale === "fa" ? "گوشواره‌ها" : "Earrings"],
                  ["sets", locale === "fa" ? "نیم‌ست‌ها" : "Sets"],
                ].map(([slug, label]) => <Link key={slug} href={`/${locale}/collections/${slug}`}>{label}</Link>)}
              </div>
            </div>
            <Link href={menuLinks[1].href}>{menuLinks[1].label}</Link>
            <Link href={menuLinks[2].href}>{menuLinks[2].label}</Link>
          </nav>
          <BrandMark locale={locale} />
          <div className="header-actions">
            <Link className="language-switch" href={localizedPath(otherLocale, pathname)} aria-label={locale === "fa" ? "Switch to English" : "تغییر زبان به فارسی"}>
              <span className="language-switch__globe" aria-hidden="true">◎</span>
              <span>{copy.language}</span>
            </Link>
            <Link className="bag-link" href={`/${locale}/cart`} aria-label={`${copy.cart}${count ? `, ${count}` : ""}`}>
              <ShoppingBag size={18} strokeWidth={1.35} />
              <span className="bag-link__label">{copy.cart}</span>
              <span className="bag-count" aria-live="polite">{count > 0 ? count : "—"}</span>
            </Link>
          </div>
        </div>
      </header>
      <div id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu__head">
          <span className="micro-label">TALA · {locale === "fa" ? "فهرست" : "MENU"}</span>
          <button className="icon-button" type="button" aria-label={copy.close} onClick={() => setOpen(false)}><X size={19} /></button>
        </div>
        <nav aria-label={locale === "fa" ? "ناوبری موبایل" : "Mobile navigation"}>
          {menuLinks.map((item, index) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
              <span className="mobile-menu__index">0{index + 1}</span><span>{item.label}</span><Arrow size={18} strokeWidth={1.2} />
            </Link>
          ))}
          <Link href={`/${locale}/cart`} onClick={() => setOpen(false)}>
            <span className="mobile-menu__index">06</span><span>{copy.cart}</span><Arrow size={18} strokeWidth={1.2} />
          </Link>
        </nav>
        <p className="mobile-menu__note">{locale === "fa" ? "روایتی آرام از طلا و جزئیات" : "A quiet study of gold and detail"}</p>
      </div>
      {open && <button className="menu-backdrop" type="button" aria-label={copy.close} onClick={() => setOpen(false)} />}
    </>
  );
}
