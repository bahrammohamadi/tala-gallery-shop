"use client";

import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { Locale } from "@/lib/i18n";

export function AddToCartButton({ locale, slug, wide = false }: { locale: Locale; slug: string; wide?: boolean }) {
  const { add } = useCart();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowUpLeft : ArrowUpRight;
  return (
    <button className={`button button--gold${wide ? " button--wide" : ""}`} type="button" onClick={() => add(slug)}>
      <span>{fa ? "افزودن به لیست استعلام" : "Add to enquiry list"}</span><Arrow size={16} strokeWidth={1.25} />
    </button>
  );
}
