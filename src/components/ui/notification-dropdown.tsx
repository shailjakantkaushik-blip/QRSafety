"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaBell } from "react-icons/fa";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; created_at: string; read: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const guardianId = typeof window !== "undefined" ? localStorage.getItem("guardian_id") || "" : "";
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Always check unread notifications on mount and when guardianId changes
    setLoading(true);
    fetch(`/api/all-notifications?guardian_id=${guardianId}`)
      .then((res) => res.json())
      .then((data) => {
        const notifications = data.notifications || [];
        setNotifications(notifications);
        const unread = notifications.slice(0, 10).some((n: any) => !n.read);
        setHasUnread(unread);
        if (unread) {
          console.log('DEBUG: Unread notification detected, red dot should show.');
        } else {
          console.log('DEBUG: All last 10 notifications are read, no red dot.');
        }
        setLoading(false);
      })
      .catch(() => {
        setNotifications([]);
        setHasUnread(false);
        setLoading(false);
      });
  }, [guardianId]);

  // Mark notifications as read only when dropdown is opened
  useEffect(() => {
    if (open) {
      fetch("/api/mark-notifications-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardian_id: guardianId }),
      })
        .then(() => {
          // Refetch notifications after marking as read
          return fetch(`/api/all-notifications?guardian_id=${guardianId}`);
        })
        .then((res) => res && res.json())
        .then((data) => {
          if (data && data.notifications) {
            setNotifications(data.notifications);
            const unread = data.notifications.slice(0, 10).some((n: any) => !n.read);
            setHasUnread(unread);
          }
        });
    }
  }, [open, guardianId]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <Button onClick={() => setOpen((v) => !v)} style={{ position: "relative", minWidth: 48, minHeight: 48, padding: 0 }}>
          <FaBell size={24} style={{ color: "#555" }} />
          {hasUnread && (
            <span style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 12,
              height: 12,
              background: "#e00",
              borderRadius: "50%",
              border: "2px solid #fff",
              display: "inline-block",
              zIndex: 10,
            }} />
          )}
        </Button>
      </div>
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
