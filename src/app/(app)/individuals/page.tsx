import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CreateIndividualForm } from "@/components/individuals/create-individual-form";
import Link from "next/link";

export default async function IndividualsPage() {
  const supabase = await supabaseServer();
  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Individuals</div>
        <div className="text-muted-foreground">Add and manage profiles. Each profile has its own QR code.</div>
      </div>

      <Card className="p-6">
        <div className="font-semibold">Add a new individual</div>
        <div className="text-sm text-muted-foreground">Keep it minimal for emergencies.</div>
        <div className="mt-4">
          <CreateIndividualForm />
        </div>
      </Card>

      <Card className="p-6">
        <div className="font-semibold">All individuals</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(individuals ?? []).map((i) => (
            <Link key={i.id} href={`/individuals/${i.id}`}>
              <Card className="p-4 hover:bg-muted/20 transition">
                <div className="font-medium">{i.display_name}</div>
                <div className="mt-1 text-xs text-muted-foreground">/p/{i.public_id}</div>
              </Card>
            </Link>
          ))}
          {(individuals ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">Add your first individual using the form above.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
