"use client";
import { useNotification } from "@/components/ui/notification";
import { Button } from "@/components/ui/button";

export function DemoNotificationButton() {
  const notify = useNotification();

  const handleShowNotification = async () => {
    try {
      const res = await fetch("/api/latest-notification");
      const data = await res.json();
      if (data?.message) {
        notify(data.message, "info");
      } else {
        notify("No notifications found.", "info");
      }
    } catch {
      notify("Failed to fetch notification.", "error");
    }
  };

  return (
    <Button onClick={handleShowNotification}>
      Show Notification
    </Button>
  );
}
