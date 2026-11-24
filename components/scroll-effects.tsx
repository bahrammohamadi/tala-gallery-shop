"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "main > section:not(.cinematic-story)",
  "main .page-shell .page-intro",
  "main .page-shell .breadcrumb-line",
  "main .section-heading",
  "main .product-card",
  "main .category-tile",
  "main .collection-overview-card",
  "main .category-hero__art",
  "main .product-detail-visual",
  "main .product-detail-info",
  "main .product-story-section > *",
  "main .product-spec-note",
  "main .guide-row",
  "main .faq-row",
  "main .guide-note",
  "main .policy-alert",
  "main .about-opening__visual",
  "main .about-opening__copy",
  "main .value-list article",
  "main .about-now > *",
  "main .contact-detail",
  "main .contact-form-wrap",
  "main .auth-form-wrap",
  "main .auth-aside",
  "main .auth-state",
  "main .admin-gate",
  "main .tracking-widget",
  "main .cart-line",
  "main .cart-summary",
  "main .checkout-form-column",
  "main .checkout-summary",
  "main .experience-product-label",
  "main .experience-viewer-wrap",
  "main .experience-footnote",
  "main .experience-static-art",
  "main .admin-section-intro",
  "main .admin-topbar",
  "main .admin-stats > *",
  "main .admin-panel",
  "main .admin-module-card",
  ".site-footer .footer-top > *",
  ".site-footer .footer-bottom",
].join(",");

export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".locale-shell");
    if (!shell || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const observed: HTMLElement[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" },
    );

    const register = (element: HTMLElement) => {
      if (!element.matches(REVEAL_SELECTOR) || element.classList.contains("scroll-reveal")) return;
      element.classList.add("scroll-reveal");
      element.style.setProperty("--motion-delay", `${Math.min(observed.length % 4, 3) * 70}ms`);
      observed.push(element);
      observer.observe(element);
    };

    const scan = (root: HTMLElement) => {
      register(root);
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(register);
    };

    scan(shell);
    shell.classList.add("has-scroll-motion");

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      });
    });
    mutations.observe(shell, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      shell.classList.remove("has-scroll-motion");
      observed.forEach((element) => {
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--motion-delay");
      });
    };
  }, [pathname]);

  return null;
}
