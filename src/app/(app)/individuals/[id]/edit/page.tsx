import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIndividualForm } from "@/components/individuals/edit-individual-form";
import { DeleteIndividualButton } from "@/components/individuals/delete-individual-button";

export default async function EditIndividualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Not found</div>
        <div className="text-muted-foreground">Invalid individual ID</div>
        <Link href="/individuals">
          <Button>Back to Individuals</Button>
        </Link>
      </div>
    );
  }

  const supabase = await supabaseServer();

  const { data: indiv, error: indivError } = await supabase
    .from("individuals")
    .select("id, display_name, date_of_birth, allergies, medical_notes, guardian_id")
    .eq("id", id)
    .single();

  const { data: contact, error: contactError } = await supabase
    .from("emergency_contacts")
    .select("id, name, relation, phone")
    .eq("individual_id", id)
    .eq("priority", 1)
    .maybeSingle();

  if (indivError || !indiv) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Not found</div>
        <div className="text-muted-foreground">{indivError?.message ?? "Individual not found"}</div>
        <Link href="/individuals">
          <Button>Back to Individuals</Button>
        </Link>
      </div>
    );
  }

  // If no contact exists, we still show the form with empty contact fields
  if (!contact) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">Edit Individual</div>
            <div className="text-sm text-muted-foreground">{indiv.display_name}</div>
          </div>
          <Link href={`/individuals/${id}`}>
            <Button>Back</Button>
          </Link>
        </div>

        <Card className="p-6">
          <EditIndividualForm 
            individual={indiv} 
            contact={{
              id: "",
              name: "",
              relation: null,
              phone: "",
            }}
          />
        </Card>

        <Card className="border-red-200 bg-red-50 p-6">
          <div className="mb-4">
            <div className="font-semibold text-red-900">Danger Zone</div>
            <div className="text-sm text-red-700">This action cannot be undone.</div>
          </div>
          <DeleteIndividualButton individualId={id} individualName={indiv.display_name} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Edit Individual</div>
          <div className="text-sm text-muted-foreground">{indiv.display_name}</div>
        </div>
        <Link href={`/individuals/${id}`}>
          <Button>Back</Button>
        </Link>
      </div>

      <Card className="p-6">
        <EditIndividualForm individual={indiv} contact={contact} />
      </Card>

      <Card className="border-red-200 bg-red-50 p-6">
        <div className="mb-4">
          <div className="font-semibold text-red-900">Danger Zone</div>
          <div className="text-sm text-red-700">This action cannot be undone.</div>
        </div>
          <DeleteIndividualButton individualId={id} individualName={indiv.display_name} />
      </Card>
    </div>
  );
}
