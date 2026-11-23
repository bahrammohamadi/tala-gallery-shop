import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";

const productSchema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameFa: z.string().trim().min(2).max(160),
  nameEn: z.string().trim().min(2).max(160),
  descriptionFa: z.string().trim().max(3000).default(""),
  descriptionEn: z.string().trim().max(3000).default(""),
  categorySlug: z.enum(["rings", "necklaces", "bracelets", "earrings", "sets"]),
});

export async function GET() {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  const { data, error } = await access.supabase
    .from("products")
    .select("id, slug, name_fa, name_en, is_published, is_archived, updated_at, collections(slug, name_fa, name_en), product_variants(id, sku, is_active, stock_quantity)")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "CATALOG_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ products: data ?? [] }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: NextRequest) {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

  const { data: collection, error: collectionError } = await access.supabase
    .from("collections").select("id").eq("slug", parsed.data.categorySlug).maybeSingle();
  if (collectionError || !collection) return NextResponse.json({ error: "COLLECTION_NOT_FOUND" }, { status: 400 });

  const { data, error } = await access.supabase.from("products").insert({
    slug: parsed.data.slug,
    name_fa: parsed.data.nameFa,
    name_en: parsed.data.nameEn,
    description_fa: parsed.data.descriptionFa,
    description_en: parsed.data.descriptionEn,
    collection_id: collection.id,
    is_published: false,
    is_archived: false,
  }).select("id, slug, name_fa, name_en, is_published, updated_at").single();
  if (error || !data) return NextResponse.json({ error: "PRODUCT_SAVE_FAILED" }, { status: 400 });
  return NextResponse.json({ product: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
