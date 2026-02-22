import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { items, shipping } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!shipping || !shipping.name || !shipping.email) {
    return NextResponse.json({ error: "Shipping info required." }, { status: 400 });
  }
  const supabase = supabaseAdmin();
  const results = [];
  for (const item of items) {
    const { error, data } = await supabase.from("orders").insert({
      product_id: item.productId,
      individual_id: item.individual_id,
      name: shipping.name,
      email: shipping.email,
      address: shipping.address,
      city: shipping.city,
      zip: shipping.zip,
      country: shipping.country,
      status: "pending",
      created_at: new Date().toISOString(),
    }).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    results.push(data?.[0]);
  }
  return NextResponse.json({ ok: true, orders: results });
}
