import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadQrButton } from "@/components/individuals/download-qr-button";

export default async function IndividualDetailPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServer();

  const { data: indiv, error } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, allergies, medical_notes, is_public")
    .eq("id", params.id)
    .single();

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Not found</div>
        <div className="text-muted-foreground">{error.message}</div>
        <Link href="/individuals"><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const publicUrl = `${site.replace(/\/$/, "")}/p/${indiv.public_id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-bold">{indiv.display_name}</div>
          <div className="text-sm text-muted-foreground">
            Public emergency profile:{" "}
            <a className="underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/individuals"><Button variant="outline">Back</Button></Link>
          <DownloadQrButton individualId={indiv.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Emergency visibility</div>
            <Badge variant={indiv.is_public ? "secondary" : "outline"}>
              {indiv.is_public ? "Public" : "Hidden"}
            </Badge>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Keep public info minimal and emergency-relevant.
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold">Tracking (Phase 2)</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Pair a device and view live location on a map (coming soon).
          </div>
          <Button className="mt-4" variant="outline" disabled>Enable tracking</Button>
        </Card>

        <Card className="p-6 md:col-span-2">
          <div className="font-semibold">Medical</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-sm font-medium">Allergies</div>
              <div className="text-sm text-muted-foreground">{indiv.allergies || "—"}</div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-sm font-medium">Notes</div>
              <div className="text-sm text-muted-foreground">{indiv.medical_notes || "—"}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
