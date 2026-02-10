import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function PATCH(request: NextRequest) {
  const { guardian_id } = await request.json();
  if (!guardian_id) return NextResponse.json({ error: "guardian_id required" }, { status: 400 });
  const { error } = await supabase
    .from("notification_reads")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("guardian_id", guardian_id)
    .eq("read", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
