import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET() {
  const { data, error } = await supabase
    .from("notifications")
    .select("message")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ message: "Error fetching notification." }, { status: 500 });
  }

  return NextResponse.json({ message: data?.message || "No notifications found." });
}
