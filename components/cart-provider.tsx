"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

export type CartLine = { slug: string; quantity: number };
type CartContextValue = {
  items: CartLine[];
  count: number;
  ready: boolean;
  toast: string | null;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

const CART_KEY = "tala-inquiry-list-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (line): line is CartLine =>
                line && typeof line.slug === "string" &&
                Number.isInteger(line.quantity) && line.quantity > 0,
            ),
          );
        }
      }
    } catch {
      try { window.localStorage.removeItem(CART_KEY); } catch { /* Storage may be unavailable in a privacy-restricted context. */ }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* Enquiry-list interactions remain usable without persistence. */ }
  }, [items, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const add = useCallback((slug: string) => {
    setItems((current) => {
      const found = current.find((line) => line.slug === slug);
      if (found) {
        return current.map((line) => line.slug === slug ? { ...line, quantity: Math.min(20, line.quantity + 1) } : line);
      }
      return [...current, { slug, quantity: 1 }];
    });
    setToast(locale === "fa" ? "به فهرست استعلام اضافه شد" : "Added to your enquiry list");
  }, [locale]);

  const remove = useCallback((slug: string) => {
    setItems((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.min(20, Math.floor(quantity) || 1));
    setItems((current) => current.map((line) => line.slug === slug ? { ...line, quantity: safeQuantity } : line));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((total, line) => total + line.quantity, 0);

  const value = useMemo(
    () => ({ items, count, ready, toast, add, remove, setQuantity, clear }),
    [items, count, ready, toast, add, remove, setQuantity, clear],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && <div className="site-toast" role="status" aria-live="polite">{toast}</div>}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
