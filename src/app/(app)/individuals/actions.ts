"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { makePublicId } from "@/lib/ids";
import { generateQrPngDataUrl, dataUrlToBuffer } from "@/lib/qr/generate";

const createSchema = z.object({
  display_name: z.string().min(1),
  date_of_birth: z.string().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  contact_name: z.string().min(1),
  contact_relation: z.string().optional(),
  contact_phone: z.string().min(5),
});

export async function createIndividual(formData: FormData) {
  const parsed = createSchema.safeParse({
    display_name: String(formData.get("display_name") ?? ""),
    date_of_birth: String(formData.get("date_of_birth") ?? "") || undefined,
    allergies: String(formData.get("allergies") ?? "") || undefined,
    medical_notes: String(formData.get("medical_notes") ?? "") || undefined,
    contact_name: String(formData.get("contact_name") ?? ""),
    contact_relation: String(formData.get("contact_relation") ?? "") || undefined,
    contact_phone: String(formData.get("contact_phone") ?? ""),
  });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Not authenticated" };

  // Ensure guardian row exists
  const { data: guardian } = await supabase.from("guardians").select("id").eq("id", auth.user.id).maybeSingle();
  if (!guardian) {
    const { error: gErr } = await supabase.from("guardians").insert({
      id: auth.user.id,
      full_name: (auth.user.user_metadata as any)?.full_name ?? null,
      is_admin: false,
    });
    if (gErr) return { ok: false, message: gErr.message };
  }

  const public_id = makePublicId();

  const { data: indiv, error: iErr } = await supabase
    .from("individuals")
    .insert({
      guardian_id: auth.user.id,
      display_name: parsed.data.display_name,
      date_of_birth: parsed.data.date_of_birth ?? null,
      allergies: parsed.data.allergies ?? null,
      medical_notes: parsed.data.medical_notes ?? null,
      public_id,
      is_public: true,
    })
    .select("id, public_id")
    .single();

  if (iErr) return { ok: false, message: iErr.message };

  const { error: cErr } = await supabase.from("emergency_contacts").insert({
    individual_id: indiv.id,
    name: parsed.data.contact_name,
    relation: parsed.data.contact_relation ?? null,
    phone: parsed.data.contact_phone,
    priority: 1,
  });
  if (cErr) return { ok: false, message: cErr.message };

  // Generate QR → upload using service role
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const publicUrl = `${site.replace(/\/$/, "")}/p/${indiv.public_id}`;

  const dataUrl = await generateQrPngDataUrl(publicUrl);
  const buf = dataUrlToBuffer(dataUrl);
  const path = `qr/${indiv.id}.png`;

  const admin = supabaseAdmin();
  const up = await admin.storage.from("qr").upload(path, buf, { contentType: "image/png", upsert: true });
  if (up.error) return { ok: false, message: up.error.message };

  const { error: qErr } = await supabase.from("qr_assets").upsert({
    individual_id: indiv.id,
    storage_path: path,
  });
  if (qErr) return { ok: false, message: qErr.message };

  return { ok: true, id: indiv.id };
}

export async function getQrSignedUrl(individualId: string) {
  const supabase = await supabaseServer();

  const { data: qr, error } = await supabase
    .from("qr_assets")
    .select("storage_path")
    .eq("individual_id", individualId)
    .single();

  if (error) return { ok: false, message: error.message };

  const admin = supabaseAdmin();
  const signed = await admin.storage.from("qr").createSignedUrl(qr.storage_path, 60);
  if (signed.error) return { ok: false, message: signed.error.message };

  return { ok: true, url: signed.data.signedUrl };
}
