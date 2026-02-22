import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { individual_id, latitude, longitude, accuracy, city, region, country } = body;
    if (!individual_id || typeof individual_id !== "string") {
      return NextResponse.json({ error: "Missing or invalid individual_id" }, { status: 400 });
    }
    const supabase = await supabaseServer();
    // Insert scan location
    const { data, error } = await supabase.from("qr_scan_locations").insert([
      {
        individual_id,
        latitude,
        longitude,
        accuracy,
        city,
        region,
        country,
        scanned_at: new Date().toISOString(),
      },
    ]).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch guardian for this individual
    const adminClient = supabaseAdmin();
    const { data: guardianData } = await adminClient
      .from("guardians")
      .select("id, phone, email")
      .eq("individual_id", individual_id)
      .maybeSingle();

    // Fetch individual's display name
    const { data: indivData } = await adminClient
      .from("individuals")
      .select("display_name")
      .eq("id", individual_id)
      .maybeSingle();

    // Compose notification message
    const name = indivData?.display_name || "Individual";
    const locStr = latitude && longitude ? `Lat: ${latitude}, Lng: ${longitude}` : "Location unavailable";
    const timeStr = new Date().toLocaleString();
    const message = `QR code for ${name} was scanned at ${timeStr}. Location: ${locStr}`;

    // Send notification if guardian exists
    if (guardianData?.id) {
      await adminClient.from("notifications").insert({
        guardian_id: guardianData.id,
        message,
      });
    }

    return NextResponse.json({ success: true, scan: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
