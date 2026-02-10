import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GuardianPhoneEdit } from "@/components/guardian-phone-edit";

export default async function GuardianInfoPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user!;
  const fullName = user.user_metadata?.full_name || "";

  // Fetch phone from guardians table
  const { data: guardian } = await supabase
    .from("guardians")
    .select("phone")
    .eq("id", user.id)
    .single();
  const phone = guardian?.phone || "";

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <div className="text-2xl font-bold mb-6">Guardian Info</div>
      <Card className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <Input value={fullName} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input value={user.email} readOnly />
        </div>
        <GuardianPhoneEdit initialPhone={phone} userId={user.id} />
      </Card>
    </main>
  );
}
