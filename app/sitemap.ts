import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const paths = [
    "fa", "en", "fa/collections", "en/collections",
    "fa/about", "en/about", "fa/care", "en/care",
    "fa/ring-size", "en/ring-size", "fa/contact", "en/contact",
    "fa/policies", "en/policies",
    "fa/collections/rings", "en/collections/rings",
    "fa/collections/necklaces", "en/collections/necklaces",
    "fa/collections/bracelets", "en/collections/bracelets",
    "fa/collections/earrings", "en/collections/earrings",
    "fa/collections/sets", "en/collections/sets",
  ];
  return paths.map((path) => ({ url: `${base}/${path}`, changeFrequency: "weekly", priority: path.endsWith("collections") ? 0.8 : path === "fa" || path === "en" ? 1 : 0.5 }));
}
