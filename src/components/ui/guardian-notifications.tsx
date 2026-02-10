"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useSession } from "@/lib/session-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GuardianNotifications() {
  type Notification = { id: string; message: string; created_at: string };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [show, setShow] = useState(false);
  const { user } = useSession();

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("notifications")
        .select("id, message, created_at")
        .eq("guardian_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
    }
    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <Button className="variant-ghost" onClick={() => setShow((s) => !s)}>
        Notifications
        {notifications.length > 0 && (
          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </Button>
      {show && (
        <Card className="absolute right-0 mt-2 w-80 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 font-semibold border-b">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No notifications.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 border-b last:border-b-0">
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
