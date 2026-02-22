import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductCrud from "@/components/admin/product-crud";
import ProductCrudTabs from "@/components/admin/product-crud-tabs";

export default async function AdminProductsPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  // Fetch guardian info to check admin
  const supabase = await import("@/lib/supabase/server").then(m => m.supabaseServer());
  const { data: guardian } = await supabase
    .from("guardians")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!guardian?.is_admin) {
    redirect("/login");
  }
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-10 px-2 md:px-0">
      <h1 className="text-2xl font-bold mb-6 w-full text-center">Product Management</h1>
      <div className="w-full">
        <ProductCrudTabs />
      </div>
    </div>
  );
}
