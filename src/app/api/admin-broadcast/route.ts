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
      // Create a single notification
      const { data: notification, error: notificationError } = await supabase.from("notifications").insert({ message }).select().single();
      if (notificationError) {
        return NextResponse.json({ error: notificationError.message }, { status: 500 });
      }
      // Insert notification_reads for each guardian
      const readsPayload = guardians.map((g) => ({ notification_id: notification.id, guardian_id: g.id, read: false }));
      const { error: readsError } = await supabase.from("notification_reads").insert(readsPayload);
      if (readsError) {
        return NextResponse.json({ error: readsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, sent: guardians.length, message: 'Notification sent successfully.' });
  } catch (err) {
    return NextResponse.json({ error: err?.toString() || "Unknown error" }, { status: 500 });
  }
}
