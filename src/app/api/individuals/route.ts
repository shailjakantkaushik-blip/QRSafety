import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // For demo, get all individuals. In production, filter by guardian/user.
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("individuals")
    .select("id, display_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ individuals: data });
}
