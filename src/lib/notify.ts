import { createClient } from "@supabase/supabase-js";

// Example: Use Twilio for SMS and SendGrid for email (or any email API)
// You must set up your own API keys and environment variables

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFrom = process.env.SENDGRID_FROM;

export async function notifyGuardian({
  guardianPhone,
  guardianEmail,
  individualName,
  latitude,
  longitude,
  scannedAt,
}) {
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const message = `Alert: ${individualName} was scanned at ${scannedAt}. Location: ${mapsUrl}`;

  // Send SMS via Twilio
  if (twilioAccountSid && twilioAuthToken && guardianPhone) {
    const twilio = require("twilio")(twilioAccountSid, twilioAuthToken);
    await twilio.messages.create({
      body: message,
      from: twilioFrom,
      to: guardianPhone,
    });
  }

  // Send Email via SendGrid
  if (sendgridApiKey && guardianEmail) {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(sendgridApiKey);
    await sgMail.send({
      to: guardianEmail,
      from: sendgridFrom,
      subject: `QR Safety Alert: ${individualName}`,
      text: message,
      html: `<p>${message}</p><a href="${mapsUrl}">View on Google Maps</a>`
    });
  }
}
