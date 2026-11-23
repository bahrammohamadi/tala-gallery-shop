import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";

const inquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  message: z.string().trim().max(1000).optional().default(""),
  productItems: z.array(z.object({ slug: z.string().trim().regex(/^[a-z0-9-]{1,80}$/), quantity: z.number().int().min(1).max(20) })).max(20).default([]),
});

export async function POST(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin && forwardedHost) {
    try {
      if (new URL(origin).host !== forwardedHost) return NextResponse.json({ error: "REQUEST_NOT_ALLOWED" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "REQUEST_NOT_ALLOWED" }, { status: 403 });
    }
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

  const admin = createAdminSupabase();
  if (!admin) return NextResponse.json({ error: "INQUIRY_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });

  const { fullName, phone, email, message, productItems } = parsed.data;
  const { error } = await admin.from("inquiries").insert({
    full_name: fullName,
    phone,
    email: email || null,
    message,
    requested_items: productItems,
    status: "new",
  });

  if (error) {
    console.error("Inquiry persistence failed", { code: error.code });
    return NextResponse.json({ error: "INQUIRY_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ received: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
