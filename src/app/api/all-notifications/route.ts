import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request) {
  // Optionally get guardian_id from query or session
  const url = new URL(request.url);
  const guardianId = url.searchParams.get("guardian_id");
  let query = supabase.from("notifications").select("id, message, created_at, read, guardian_id").order("created_at", { ascending: false }).limit(10);
  if (guardianId) {
    query = query.eq("guardian_id", guardianId);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
  return NextResponse.json({ notifications: data || [] });
}
