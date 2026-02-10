"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function GuardianPhoneEdit({ initialPhone, userId }: { initialPhone: string, userId: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/guardian-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to update phone");
      toast.success("Phone updated");
    } catch (e) {
      toast.error("Could not update phone");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 mb-4">
      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <label htmlFor="guardian-phone" className="font-medium">Your Phone Number</label>
        <Input
          id="guardian-phone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="e.g. +1234567890"
          required
        />
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </form>
    </Card>
  );
}
