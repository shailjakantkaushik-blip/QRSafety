import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getOrderStatsForIndividuals(individualIds: string[]) {
  if (individualIds.length === 0) return {};
  const supabase = supabaseAdmin();
  // Try to fetch all orders for these individuals
  const { data, error } = await supabase
    .from("orders")
    .select("individual_id, status")
    .in("individual_id", individualIds);
  if (error) return {};
  // Aggregate counts
  const stats: Record<string, { ordered: number; delivered: number }> = {};
  for (const id of individualIds) {
    stats[id] = { ordered: 0, delivered: 0 };
  }
  for (const order of data ?? []) {
    stats[order.individual_id].ordered++;
    if (order.status === "delivered") stats[order.individual_id].delivered++;
  }
  return stats;
}
