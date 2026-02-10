"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function GuardianPhoneForm({ initialPhone }: { initialPhone?: string }) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");
    // TODO: Call API to save phone number to guardian profile
    setTimeout(() => setStatus("Saved!"), 1000);
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
        <Button type="submit">Save</Button>
        {status && <div className="text-xs text-muted-foreground">{status}</div>}
      </form>
    </Card>
  );
}
