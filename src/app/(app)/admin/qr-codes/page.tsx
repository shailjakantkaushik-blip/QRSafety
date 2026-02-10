import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminQrDownloadButton } from "@/components/admin/admin-qr-download-button";
import { RegenerateQrButton } from "@/components/admin/regenerate-qr-button";
import { AdminBroadcastMessage } from "@/components/admin/admin-broadcast-message";

export const revalidate = 0; // Always fetch fresh data, don't cache

export default async function AdminQrCodesPage() {
  const supabase = await supabaseServer();
  
  // Check if user is authenticated
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Access Denied</div>
        <div className="text-muted-foreground">You must be logged in to access this page.</div>
        <Link href="/login"><Button>Go to Login</Button></Link>
      </div>
    );
  }

  // Check if user is admin
  const { data: guardian } = await supabase
    .from("guardians")
    .select("is_admin")
    .eq("id", auth.user.id)
    .single();

  if (!guardian?.is_admin) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Access Denied</div>
        <div className="text-muted-foreground">You do not have admin privileges to access this page.</div>
        <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
      </div>
    );
  }

  // Get all individuals
  const { data: individuals, error: indivError } = await supabase
    .from("individuals")
    .select(`
      id,
      display_name,
      public_id,
      created_at,
      guardian:guardians(full_name)
    `)
    .order("created_at", { ascending: false });

  if (indivError || !individuals) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Error</div>
        <div className="text-muted-foreground">{indivError?.message || "Failed to load individuals"}</div>
      </div>
    );
  }

  // Get all QR assets
  const { data: qrAssets, error } = await supabase
    .from("qr_assets")
    .select("individual_id, storage_path");

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Error</div>
        <div className="text-muted-foreground">{error.message}</div>
      </div>
    );
  }

  // Create a map of individual_id -> qr_asset for quick lookup
  const qrMap = new Map(
    (qrAssets || []).map((qa: any) => [qa.individual_id, qa])
  );

  return (
    <div className="space-y-8">
      <AdminBroadcastMessage />
      <div>
        <div className="text-2xl font-bold">QR Code Management</div>
        <div className="text-muted-foreground">Download and manage QR codes for all individuals.</div>
      </div>

      <Card className="p-6">
        <div className="font-semibold mb-4">All Individuals & QR Codes</div>
        <div className="space-y-2">
          {(individuals ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No individuals found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Guardian</th>
                    <th className="text-left py-2 px-2">Public ID</th>
                    <th className="text-left py-2 px-2">QR Status</th>
                    <th className="text-left py-2 px-2">Download</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(individuals ?? []).map((indiv: any) => {
                    const qrAsset = qrMap.get(indiv.id);
                    const hasQr = !!qrAsset;
                    
                    return (
                      <tr key={indiv.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{indiv.display_name}</td>
                        <td className="py-2 px-2">{indiv.guardian?.full_name || "—"}</td>
                        <td className="py-2 px-2 font-mono text-xs">{indiv.public_id.slice(0, 8)}...</td>
                        <td className="py-2 px-2">
                          {hasQr ? (
                            <span className="text-green-600 font-medium">✓ Generated</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {hasQr ? (
                            <AdminQrDownloadButton individualId={indiv.id} individualName={indiv.display_name} />
                          ) : (
                            <Button disabled className="text-xs">No QR</Button>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {hasQr ? (
                            <Button disabled className="text-xs">—</Button>
                          ) : (
                            <RegenerateQrButton individualId={indiv.id} individualName={indiv.display_name} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
