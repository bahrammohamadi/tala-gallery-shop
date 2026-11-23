import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";

const updateSchema = z.object({
  nameFa: z.string().trim().min(2).max(160).optional(),
  nameEn: z.string().trim().min(2).max(160).optional(),
  descriptionFa: z.string().trim().max(3000).optional(),
  descriptionEn: z.string().trim().max(3000).optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
}).refine((input) => Object.keys(input).length > 0);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdminApi();
  if (!access.ok) return access.response;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const values = {
    ...(parsed.data.nameFa !== undefined ? { name_fa: parsed.data.nameFa } : {}),
    ...(parsed.data.nameEn !== undefined ? { name_en: parsed.data.nameEn } : {}),
    ...(parsed.data.descriptionFa !== undefined ? { description_fa: parsed.data.descriptionFa } : {}),
    ...(parsed.data.descriptionEn !== undefined ? { description_en: parsed.data.descriptionEn } : {}),
    ...(parsed.data.isPublished !== undefined ? { is_published: parsed.data.isPublished } : {}),
    ...(parsed.data.isArchived !== undefined ? { is_archived: parsed.data.isArchived } : {}),
  };
  const { data, error } = await access.supabase.from("products").update(values).eq("id", id).select("id, slug, name_fa, name_en, is_published, is_archived, updated_at").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "PRODUCT_UPDATE_FAILED" }, { status: 400 });
  return NextResponse.json({ product: data }, { headers: { "Cache-Control": "no-store" } });
}
