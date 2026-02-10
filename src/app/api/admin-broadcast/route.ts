import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createPlatformNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// Notification logic removed

export async function POST(req: NextRequest) {
  try {
    const { message, sendSMS, sendWeb } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const supabase = await supabaseServer();
    // Get all guardians
    const { data: guardians, error } = await supabase
      .from("guardians")
      .select("id, phone");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!guardians || guardians.length === 0) {
      return NextResponse.json({ error: "No guardians found." }, { status: 500 });
    }

    // Send SMS to all guardians if enabled
    if (sendSMS) {
      try {
        const twilioModule = await import("twilio");
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_FROM_NUMBER;
        if (accountSid && authToken && fromNumber) {
          const client = twilioModule.default(accountSid, authToken);
          for (const guardian of guardians) {
            if (guardian.phone) {
              await client.messages.create({
                body: message,
                from: fromNumber,
                to: guardian.phone,
              });
            }
          }
        }
      } catch (twilioErr) {
        // Log but don't fail
        console.error("Twilio error:", twilioErr);
      }
    }

    // Create notification for all guardians if enabled
    if (sendWeb) {
      for (const guardian of guardians) {
        await supabase.from("notifications").insert({ guardian_id: guardian.id, message });
      }
    }

    return NextResponse.json({ ok: true, sent: guardians.length, message: 'Notification sent successfully.' });
  } catch (err) {
    return NextResponse.json({ error: err?.toString() || "Unknown error" }, { status: 500 });
  }
}
