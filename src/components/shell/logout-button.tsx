"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-2"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
