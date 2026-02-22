import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, type, description, price, is_active")
    .eq("is_active", true);
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("products").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}
