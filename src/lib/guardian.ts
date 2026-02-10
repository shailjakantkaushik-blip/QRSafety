import { supabaseServer } from "@/lib/supabase/server";

export async function upsertGuardianPhone({ userId, phone }: { userId: string, phone: string }) {
  const supabase = await supabaseServer();
  // Try to update, if not exists, insert
  const { error } = await supabase
    .from("guardians")
    .upsert({ id: userId, phone }, { onConflict: "id" });
  return { error };
}
