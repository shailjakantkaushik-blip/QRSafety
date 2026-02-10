import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createPlatformNotification({
  guardianId,
  message,
}: {
  guardianId: string;
  message: string;
}): Promise<boolean> {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .insert({ message });
  return !error;
}
