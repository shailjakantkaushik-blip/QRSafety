import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user!;

  const { data: guardian } = await supabase
    .from("guardians")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!guardian?.is_admin) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-bold">Admin</div>
        <div className="text-muted-foreground">You do not have access to this page.</div>
      </div>
    );
  }

  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Admin</div>
        <div className="text-muted-foreground">Basic admin view (expand for printing workflow).</div>
      </div>

      <Card className="p-6">
        <div className="font-semibold">Recent profiles</div>
        <div className="mt-4 space-y-2 text-sm">
          {(individuals ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between">
              <span>{i.display_name}</span>
              <span className="text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
