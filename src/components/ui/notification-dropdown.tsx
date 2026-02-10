"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; created_at: string; read: boolean; guardian_id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const guardianId = typeof window !== "undefined" ? localStorage.getItem("guardian_id") || "" : "";
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/mark-notifications-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardian_id: guardianId }),
      })
        .then(() => fetch(`/api/all-notifications?guardian_id=${guardianId}`))
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data.notifications || []);
          setHasUnread((data.notifications || []).some((n: any) => !n.read));
          setLoading(false);
        })
        .catch(() => {
          setNotifications([]);
          setHasUnread(false);
          setLoading(false);
        });
    }
  }, [open, guardianId]);

  return (
    <div style={{ position: "relative" }}>
      <Button onClick={() => setOpen((v) => !v)} style={{ position: "relative" }}>
        Notifications
        {hasUnread && (
          <span style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 12,
            height: 12,
            background: "#e00",
            borderRadius: "50%",
            border: "2px solid #fff",
            display: "inline-block",
          }} />
        )}
      </Button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            minWidth: 280,
            maxHeight: 320,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            zIndex: 1000,
          }}
        >
          <div style={{ padding: "12px 16px", fontWeight: 600, borderBottom: "1px solid #eee" }}>
            Notifications
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 16, color: "#888" }}>No notifications found.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ fontSize: 14 }}>{n.message}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                {!n.read && (
                  <span style={{ color: "#e00", fontWeight: 600, fontSize: 12 }}>Unread</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
