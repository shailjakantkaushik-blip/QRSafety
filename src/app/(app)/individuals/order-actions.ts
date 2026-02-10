"use server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const orderSchema = z.object({
  productType: z.enum(["wristband", "chesttag", "belthook"]),
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export async function createOrder(data: {
  productType: string;
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}) {
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("orders").insert({
    ...parsed.data,
    status: "pending",
    created_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
