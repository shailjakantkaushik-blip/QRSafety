import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PublicProfilePage({ params }: { params: { publicId: string } }) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase.rpc("get_public_profile", {
    p_public_id: params.publicId,
  });

  if (error || !data) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile not found</div>
        <div className="mt-2 text-muted-foreground">This QR may be invalid or the profile is hidden.</div>
      </main>
    );
  }

  if (!data.is_public) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile hidden</div>
        <div className="mt-2 text-muted-foreground">The guardian disabled public visibility.</div>
      </main>
    );
  }

  const contacts: Array<{ name: string; relation?: string; phone: string; priority: number }> = data.contacts ?? [];

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Emergency profile</div>
          <div className="text-3xl font-bold">{data.display_name ?? "—"}</div>
        </div>
        <Badge variant="secondary">Public</Badge>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Allergies</div>
          <div className="mt-1 text-sm text-muted-foreground">{data.allergies || "—"}</div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Medical notes</div>
          <div className="mt-1 text-sm text-muted-foreground">{data.medical_notes || "—"}</div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Emergency contacts</div>
          <div className="mt-3 space-y-3">
            {contacts.length === 0 && <div className="text-sm text-muted-foreground">No contacts available.</div>}
            {contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.relation || "Contact"}</div>
                </div>
                <a href={`tel:${c.phone}`}><Button>Call</Button></a>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-xs text-muted-foreground">
          In a serious emergency, call local emergency services first.
        </div>
      </div>
    </main>
  );
}
