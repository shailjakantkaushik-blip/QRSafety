import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request) {
  const url = new URL(request.url);
  const guardianId = url.searchParams.get("guardian_id");
  if (!guardianId) {
    return NextResponse.json({ notifications: [] }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("notification_reads")
    .select("notification_id, read, notifications(id, message, created_at)")
    .eq("guardian_id", guardianId)
    .limit(50); // fetch more to sort in JS
  if (error) {
    console.error("Supabase error in all-notifications:", error);
    return NextResponse.json({ notifications: [], error: error.message }, { status: 500 });
  }
  // Map to flat notification objects
  let notifications = (data || []).map((row: any) => ({
    id: row.notification_id,
    message: row.notifications?.message,
    created_at: row.notifications?.created_at,
    read: row.read,
  }));
  // Log notifications for debugging
  console.log("Fetched notifications:", notifications);
  // Sort by created_at descending
  notifications = notifications.filter(n => n.created_at).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  return NextResponse.json({ notifications });
}
