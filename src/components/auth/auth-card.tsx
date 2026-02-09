"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  fullName: z.string().min(2, "Enter your full name").optional(),
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

      const parsed = schema.safeParse({
        email,
        password,
        fullName: mode === "signup" ? fullName : undefined,
      });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            // Optional: ensures correct redirect after email verification (if enabled)
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/dashboard`
                : undefined,
          },
        });

        if (error) throw error;

        // ✅ IMPORTANT:
        // Do NOT insert into guardians here.
        // Use a DB trigger on auth.users to auto-create public.guardians rows.
        toast.success("Account created. If email confirmation is enabled, please verify your email then log in.");
        router.push("/login");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        toast.success("Logged in");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form action={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Your name" required />
          </div>
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
