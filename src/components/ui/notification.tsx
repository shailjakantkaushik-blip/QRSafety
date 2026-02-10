"use client";
import React, { useState, useCallback, createContext, useContext } from "react";

export type Notification = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
};

const NotificationContext = createContext<{
  notifications: Notification[];
  addNotification: (message: string, type?: Notification["type"]) => void;
  removeNotification: (id: string) => void;
} | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type?: Notification["type"]) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              marginBottom: 8,
              padding: "12px 20px",
              borderRadius: 6,
              background: n.type === "error" ? "#fee" : n.type === "success" ? "#e6ffe6" : "#eef",
              color: n.type === "error" ? "#900" : n.type === "success" ? "#090" : "#333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              minWidth: 200,
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx.addNotification;
}
