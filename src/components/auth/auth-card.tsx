"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  fullName: z.string().min(2, "Enter your full name").optional(),
  phone: z.string().min(8, "Enter a valid phone number").optional(),
});

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = supabaseBrowser();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const fullName = String(formData.get("fullName") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();

      const parsed = schema.safeParse({
        email,
        password,
        fullName: mode === "signup" ? fullName : undefined,
        phone: mode === "signup" ? phone : undefined,
      });

      if (!parsed.success) {
        // Notification logic removed
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/dashboard`
                : undefined,
          },
        });

        if (error) throw error;

        // Notification logic removed
        router.push("/login");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Notification logic removed
        // Use full reload to ensure server sees new cookie
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      // Notification logic removed
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form action={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="e.g. +1234567890" required />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            required
          />
        </div>

        <Button className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
