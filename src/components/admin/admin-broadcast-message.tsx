"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export function AdminBroadcastMessage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendWeb, setSendWeb] = useState(true);
  const [confirmation, setConfirmation] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sendSMS, sendWeb }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send message");
      setConfirmation(data?.message || "Message sent to all guardians");
      setMessage("");
    } catch (e) {
      setConfirmation(e?.message || "Could not send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSend} className="flex flex-col gap-3">
        <label htmlFor="broadcast-message" className="font-medium">Send Notification to All Guardians</label>
        <Input
          id="broadcast-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
        />
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sendSMS} onChange={e => setSendSMS(e.target.checked)} />
            Send SMS
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sendWeb} onChange={e => setSendWeb(e.target.checked)} />
            Send Web Notification
          </label>
        </div>
        <Button type="submit" disabled={loading || !message}>
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>
      {confirmation && (
        <div className="mt-4 p-3 rounded bg-green-100 text-green-800 text-sm font-medium border border-green-200">
          {confirmation}
        </div>
      )}
    </Card>
  );
}
