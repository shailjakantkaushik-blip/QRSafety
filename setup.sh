set -euo pipefail

# ---- sanity check ----
if [ ! -f "package.json" ]; then
  echo "❌ Run this inside your Next.js project root (qr-safety)."
  exit 1
fi

# ---- deps ----
echo "📦 Installing required dependencies..."
npm i @supabase/supabase-js @supabase/ssr zod qrcode lucide-react next-themes clsx tailwind-merge sonner >/dev/null

# ---- folders ----
echo "📁 Creating folders..."
mkdir -p \
  src/lib/supabase src/lib/qr src/components/auth src/components/shell src/components/individuals \
  src/components/ui \
  "src/app/(app)/dashboard" "src/app/(app)/individuals" "src/app/(app)/individuals/[id]" "src/app/(app)/admin" \
  "src/app/p/[publicId]" "src/app/login" "src/app/signup" "src/app/pricing"

# ---- UI components (so you don't depend on shadcn CLI) ----
echo "🎨 Writing UI components..."
cat > src/components/ui/button.tsx <<'EOF'
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "lg";
};

export function Button({ className, variant="default", size="default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        size === "lg" ? "h-11 px-5" : "h-10 px-4",
        variant === "default" && "bg-foreground text-background hover:opacity-90",
        variant === "outline" && "border border-border bg-background hover:bg-muted/30",
        variant === "ghost" && "hover:bg-muted/40",
        className
      )}
      {...props}
    />
  );
}
EOF

cat > src/components/ui/card.tsx <<'EOF'
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-background shadow-sm", className)}
      {...props}
    />
  );
}
EOF

cat > src/components/ui/badge.tsx <<'EOF'
import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant="default", ...props }: React.HTMLAttributes<HTMLSpanElement> & {variant?: "default" | "secondary" | "outline"}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-foreground text-background",
        variant === "secondary" && "bg-muted text-foreground",
        variant === "outline" && "border border-border text-foreground",
        className
      )}
      {...props}
    />
  );
}
EOF

cat > src/components/ui/input.tsx <<'EOF'
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
EOF

cat > src/components/ui/label.tsx <<'EOF'
import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
EOF

cat > src/components/ui/textarea.tsx <<'EOF'
import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[90px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
EOF

cat > src/components/ui/separator.tsx <<'EOF'
import { cn } from "@/lib/utils";

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}
EOF

cat > src/components/ui/sonner.tsx <<'EOF'
"use client";
import { Toaster as Sonner } from "sonner";
export function Toaster(props: any) {
  return <Sonner {...props} />;
}
EOF

# ---- utils ----
echo "🧠 Writing lib files..."
cat > src/lib/utils.ts <<'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

cat > src/lib/ids.ts <<'EOF'
import crypto from "crypto";
export function makePublicId() {
  return crypto.randomBytes(16).toString("hex"); // 32 hex chars
}
EOF

cat > src/lib/qr/generate.ts <<'EOF'
import QRCode from "qrcode";

export async function generateQrPngDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}

export function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Buffer.from(base64, "base64");
}
EOF

# ---- supabase clients ----
cat > src/lib/supabase/server.ts <<'EOF'
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
EOF

cat > src/lib/supabase/client.ts <<'EOF'
import { createBrowserClient } from "@supabase/ssr";
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF

cat > src/lib/supabase/admin.ts <<'EOF'
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
EOF

# ---- auth helper ----
cat > src/lib/auth.ts <<'EOF'
import { supabaseServer } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
EOF

# ---- root layout ----
echo "🧱 Writing app layouts & pages..."
cat > src/app/layout.tsx <<'EOF'
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SafeQR — Emergency QR Profiles",
  description: "Emergency-ready QR profiles for kids, seniors, and families.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF

# ---- landing + pricing ----
cat > src/app/page.tsx <<'EOF'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, QrCode, Users, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 to-background" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
            <QrCode className="h-5 w-5" />
          </span>
          SafeQR
          <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
            Phase 1 — QR Profiles
          </Badge>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login"><Button variant="ghost">Log in</Button></Link>
          <Link href="/signup"><Button>Get started</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-10">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              Built for emergencies • Fast • Private by default
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              One scan. Instant help.
              <span className="block text-muted-foreground">
                Emergency contacts & allergies — always accessible.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Create profiles for kids or seniors. Download QR for printing.
              Later: wearable ordering + tracking devices + mobile app.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup"><Button size="lg">Create a guardian account</Button></Link>
              <Link href="/pricing"><Button size="lg" variant="outline">See pricing</Button></Link>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4" /> Secure</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> Multiple profiles</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Tracking ready</span>
            </div>
          </div>

          <Card className="p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Example emergency profile</div>
                  <div className="text-xl font-semibold">“Aarav K.”</div>
                </div>
                <Badge>Public</Badge>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-sm font-medium">Allergies</div>
                <div className="text-sm text-muted-foreground">Peanuts • Penicillin</div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-sm font-medium">Emergency contacts</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Mom</span><span className="text-muted-foreground">+61 xxx xxx xxx</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dad</span><span className="text-muted-foreground">+61 xxx xxx xxx</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                QR points to a safe public page. Guardian account stays private.
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} SafeQR • Privacy-first • Built for emergencies
        </div>
      </footer>
    </main>
  );
}
EOF

cat > src/app/pricing/page.tsx <<'EOF'
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">Pricing</div>
          <div className="text-muted-foreground">Subscription per individual profile (Phase 1).</div>
        </div>
        <Link href="/"><Button variant="outline">Back</Button></Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <Badge className="w-fit" variant="secondary">Monthly</Badge>
          <div className="mt-3 text-4xl font-bold">$8</div>
          <div className="text-sm text-muted-foreground">per individual / month</div>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Public emergency profile</li>
            <li>• Allergies & medical notes</li>
            <li>• Multiple emergency contacts</li>
            <li>• QR generation + download</li>
          </ul>
          <Link href="/signup"><Button className="mt-6 w-full">Get started</Button></Link>
        </Card>

        <Card className="p-6">
          <Badge className="w-fit" variant="secondary">Yearly</Badge>
          <div className="mt-3 text-4xl font-bold">$50</div>
          <div className="text-sm text-muted-foreground">per individual / year</div>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Everything in Monthly</li>
            <li>• Best value for families</li>
          </ul>
          <Link href="/signup"><Button className="mt-6 w-full" variant="outline">Choose yearly</Button></Link>
        </Card>
      </div>
    </main>
  );
}
EOF

# ---- auth pages + component ----
cat > src/app/login/page.tsx <<'EOF'
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <div className="text-2xl font-bold">Welcome back</div>
          <div className="text-muted-foreground">Log in to manage your profiles.</div>
        </div>
        <AuthCard mode="login" />
        <div className="text-sm text-muted-foreground">
          New here? <Link className="underline" href="/signup">Create an account</Link>
        </div>
      </div>
    </main>
  );
}
EOF

cat > src/app/signup/page.tsx <<'EOF'
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <div className="text-2xl font-bold">Create your guardian account</div>
          <div className="text-muted-foreground">Manage profiles and generate QR codes.</div>
        </div>
        <AuthCard mode="signup" />
        <div className="text-sm text-muted-foreground">
          Already have an account? <Link className="underline" href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}
EOF

cat > src/components/auth/auth-card.tsx <<'EOF'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { z } from "zod";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters"),
  fullName: z.string().min(2).optional(),
});

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = supabaseBrowser();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const fullName = String(formData.get("fullName") ?? "");

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        const userId = data.user?.id;
        if (userId) {
          const { error: gErr } = await supabase.from("guardians").insert({
            id: userId,
            full_name: fullName,
            is_admin: false,
          });
          if (gErr) throw gErr;
        }

        toast.success("Account created. Check email verification if enabled.");
        router.push("/dashboard");
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
            <Input id="fullName" name="fullName" placeholder="Your name" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" required />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
EOF

# ---- app shell / protected area ----
cat > src/app/'(app)'/layout.tsx <<'EOF'
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
EOF

cat > src/components/shell/logout-button.tsx <<'EOF'
"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-2"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
EOF

cat > src/components/shell/app-shell.tsx <<'EOF'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, LayoutDashboard, Users, Shield } from "lucide-react";
import { LogoutButton } from "@/components/shell/logout-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-r bg-muted/10 p-4 md:min-h-screen">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <QrCode className="h-5 w-5" />
            </span>
            SafeQR
          </Link>

          <Separator className="my-4" />

          <nav className="space-y-2">
            <Link href="/dashboard" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/individuals" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Individuals
              </Button>
            </Link>
            <Link href="/admin" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </nav>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
EOF

# ---- dashboard ----
cat > src/app/'(app)'/dashboard/page.tsx <<'EOF'
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user!;

  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-bold">Dashboard</div>
          <div className="text-muted-foreground">Welcome back, {user.email}</div>
        </div>
        <Link href="/individuals"><Button>Manage individuals</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Phase</div>
          <div className="mt-1 text-xl font-semibold">QR Profiles</div>
          <Badge className="mt-3 w-fit" variant="secondary">Live</Badge>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Next</div>
          <div className="mt-1 text-xl font-semibold">Tracking Devices</div>
          <Badge className="mt-3 w-fit" variant="outline">Planned</Badge>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Later</div>
          <div className="mt-1 text-xl font-semibold">Mobile App</div>
          <Badge className="mt-3 w-fit" variant="outline">Planned</Badge>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Recent individuals</div>
            <div className="text-sm text-muted-foreground">Quick access to latest profiles.</div>
          </div>
          <Link href="/individuals"><Button variant="outline">View all</Button></Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(individuals ?? []).map((i) => (
            <Link key={i.id} href={`/individuals/${i.id}`}>
              <Card className="p-4 hover:bg-muted/20 transition">
                <div className="font-medium">{i.display_name}</div>
                <div className="mt-1 text-xs text-muted-foreground">/p/{i.public_id}</div>
              </Card>
            </Link>
          ))}
          {(individuals ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">No individuals yet. Add one from Individuals.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
EOF

# ---- individuals server actions ----
cat > src/app/'(app)'/individuals/actions.ts <<'EOF'
"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { makePublicId } from "@/lib/ids";
import { generateQrPngDataUrl, dataUrlToBuffer } from "@/lib/qr/generate";

const createSchema = z.object({
  display_name: z.string().min(1),
  date_of_birth: z.string().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  contact_name: z.string().min(1),
  contact_relation: z.string().optional(),
  contact_phone: z.string().min(5),
});

export async function createIndividual(formData: FormData) {
  const parsed = createSchema.safeParse({
    display_name: String(formData.get("display_name") ?? ""),
    date_of_birth: String(formData.get("date_of_birth") ?? "") || undefined,
    allergies: String(formData.get("allergies") ?? "") || undefined,
    medical_notes: String(formData.get("medical_notes") ?? "") || undefined,
    contact_name: String(formData.get("contact_name") ?? ""),
    contact_relation: String(formData.get("contact_relation") ?? "") || undefined,
    contact_phone: String(formData.get("contact_phone") ?? ""),
  });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Not authenticated" };

  // Ensure guardian row exists
  const { data: guardian } = await supabase.from("guardians").select("id").eq("id", auth.user.id).maybeSingle();
  if (!guardian) {
    const { error: gErr } = await supabase.from("guardians").insert({
      id: auth.user.id,
      full_name: (auth.user.user_metadata as any)?.full_name ?? null,
      is_admin: false,
    });
    if (gErr) return { ok: false, message: gErr.message };
  }

  const public_id = makePublicId();

  const { data: indiv, error: iErr } = await supabase
    .from("individuals")
    .insert({
      guardian_id: auth.user.id,
      display_name: parsed.data.display_name,
      date_of_birth: parsed.data.date_of_birth ?? null,
      allergies: parsed.data.allergies ?? null,
      medical_notes: parsed.data.medical_notes ?? null,
      public_id,
      is_public: true,
    })
    .select("id, public_id")
    .single();

  if (iErr) return { ok: false, message: iErr.message };

  const { error: cErr } = await supabase.from("emergency_contacts").insert({
    individual_id: indiv.id,
    name: parsed.data.contact_name,
    relation: parsed.data.contact_relation ?? null,
    phone: parsed.data.contact_phone,
    priority: 1,
  });
  if (cErr) return { ok: false, message: cErr.message };

  // Generate QR → upload using service role
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const publicUrl = `${site.replace(/\/$/, "")}/p/${indiv.public_id}`;

  const dataUrl = await generateQrPngDataUrl(publicUrl);
  const buf = dataUrlToBuffer(dataUrl);
  const path = `qr/${indiv.id}.png`;

  const admin = supabaseAdmin();
  const up = await admin.storage.from("qr").upload(path, buf, { contentType: "image/png", upsert: true });
  if (up.error) return { ok: false, message: up.error.message };

  const { error: qErr } = await supabase.from("qr_assets").upsert({
    individual_id: indiv.id,
    storage_path: path,
  });
  if (qErr) return { ok: false, message: qErr.message };

  return { ok: true, id: indiv.id };
}

export async function getQrSignedUrl(individualId: string) {
  const supabase = supabaseServer();

  const { data: qr, error } = await supabase
    .from("qr_assets")
    .select("storage_path")
    .eq("individual_id", individualId)
    .single();

  if (error) return { ok: false, message: error.message };

  const admin = supabaseAdmin();
  const signed = await admin.storage.from("qr").createSignedUrl(qr.storage_path, 60);
  if (signed.error) return { ok: false, message: signed.error.message };

  return { ok: true, url: signed.data.signedUrl };
}
EOF

# ---- individuals pages + components ----
cat > src/components/individuals/create-individual-form.tsx <<'EOF'
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createIndividual } from "@/app/(app)/individuals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateIndividualForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(fd) => {
        startTransition(async () => {
          const res = await createIndividual(fd);
          if (!res.ok) return toast.error(res.message);
          toast.success("Individual created + QR generated");
          router.push(`/individuals/${res.id}`);
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <Label>Display name</Label>
        <Input name="display_name" placeholder="e.g., Aarav K." required />
      </div>

      <div className="space-y-2">
        <Label>Date of birth (optional)</Label>
        <Input name="date_of_birth" type="date" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Allergies (optional)</Label>
        <Input name="allergies" placeholder="e.g., Peanuts, Penicillin" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Medical notes (optional)</Label>
        <Textarea name="medical_notes" placeholder="Short and emergency-relevant only." />
      </div>

      <div className="space-y-2">
        <Label>Emergency contact name</Label>
        <Input name="contact_name" placeholder="e.g., Mom" required />
      </div>

      <div className="space-y-2">
        <Label>Relation (optional)</Label>
        <Input name="contact_relation" placeholder="Mother / Father / Guardian" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Phone</Label>
        <Input name="contact_phone" placeholder="+61 ..." required />
      </div>

      <div className="md:col-span-2">
        <Button disabled={pending} className="w-full">
          {pending ? "Creating..." : "Create individual + generate QR"}
        </Button>
      </div>
    </form>
  );
}
EOF

cat > src/components/individuals/download-qr-button.tsx <<'EOF'
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getQrSignedUrl } from "@/app/(app)/individuals/actions";

export function DownloadQrButton({ individualId }: { individualId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await getQrSignedUrl(individualId);
          if (!res.ok) return toast.error(res.message);
          window.open(res.url, "_blank", "noreferrer");
        });
      }}
    >
      {pending ? "Preparing..." : "Download QR"}
    </Button>
  );
}
EOF

cat > src/app/'(app)'/individuals/page.tsx <<'EOF'
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CreateIndividualForm } from "@/components/individuals/create-individual-form";
import Link from "next/link";

export default async function IndividualsPage() {
  const supabase = supabaseServer();
  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Individuals</div>
        <div className="text-muted-foreground">Add and manage profiles. Each profile has its own QR code.</div>
      </div>

      <Card className="p-6">
        <div className="font-semibold">Add a new individual</div>
        <div className="text-sm text-muted-foreground">Keep it minimal for emergencies.</div>
        <div className="mt-4">
          <CreateIndividualForm />
        </div>
      </Card>

      <Card className="p-6">
        <div className="font-semibold">All individuals</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(individuals ?? []).map((i) => (
            <Link key={i.id} href={`/individuals/${i.id}`}>
              <Card className="p-4 hover:bg-muted/20 transition">
                <div className="font-medium">{i.display_name}</div>
                <div className="mt-1 text-xs text-muted-foreground">/p/{i.public_id}</div>
              </Card>
            </Link>
          ))}
          {(individuals ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">Add your first individual using the form above.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
EOF

cat > src/app/'(app)'/individuals/'[id]'/page.tsx <<'EOF'
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadQrButton } from "@/components/individuals/download-qr-button";

export default async function IndividualDetailPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { data: indiv, error } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, allergies, medical_notes, is_public")
    .eq("id", params.id)
    .single();

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Not found</div>
        <div className="text-muted-foreground">{error.message}</div>
        <Link href="/individuals"><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const publicUrl = `${site.replace(/\/$/, "")}/p/${indiv.public_id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-bold">{indiv.display_name}</div>
          <div className="text-sm text-muted-foreground">
            Public emergency profile:{" "}
            <a className="underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/individuals"><Button variant="outline">Back</Button></Link>
          <DownloadQrButton individualId={indiv.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Emergency visibility</div>
            <Badge variant={indiv.is_public ? "secondary" : "outline"}>
              {indiv.is_public ? "Public" : "Hidden"}
            </Badge>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Keep public info minimal and emergency-relevant.
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold">Tracking (Phase 2)</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Pair a device and view live location on a map (coming soon).
          </div>
          <Button className="mt-4" variant="outline" disabled>Enable tracking</Button>
        </Card>

        <Card className="p-6 md:col-span-2">
          <div className="font-semibold">Medical</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-sm font-medium">Allergies</div>
              <div className="text-sm text-muted-foreground">{indiv.allergies || "—"}</div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-sm font-medium">Notes</div>
              <div className="text-sm text-muted-foreground">{indiv.medical_notes || "—"}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
EOF

# ---- public page (QR destination) ----
cat > src/app/p/'[publicId]'/page.tsx <<'EOF'
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PublicProfilePage({ params }: { params: { publicId: string } }) {
  const supabase = supabaseServer();

  const { data, error } = await supabase.rpc("get_public_profile", {
    p_public_id: params.publicId,
  });

  if (error || !data) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile not found</div>
        <div className="mt-2 text-muted-foreground">This QR may be invalid or the profile is hidden.</div>
      </main>
    );
  }

  if (!data.is_public) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile hidden</div>
        <div className="mt-2 text-muted-foreground">The guardian disabled public visibility.</div>
      </main>
    );
  }

  const contacts: Array<{ name: string; relation?: string; phone: string; priority: number }> = data.contacts ?? [];

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Emergency profile</div>
          <div className="text-3xl font-bold">{data.display_name ?? "—"}</div>
        </div>
        <Badge variant="secondary">Public</Badge>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Allergies</div>
          <div className="mt-1 text-sm text-muted-foreground">{data.allergies || "—"}</div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Medical notes</div>
          <div className="mt-1 text-sm text-muted-foreground">{data.medical_notes || "—"}</div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Emergency contacts</div>
          <div className="mt-3 space-y-3">
            {contacts.length === 0 && <div className="text-sm text-muted-foreground">No contacts available.</div>}
            {contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.relation || "Contact"}</div>
                </div>
                <a href={`tel:${c.phone}`}><Button>Call</Button></a>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-xs text-muted-foreground">
          In a serious emergency, call local emergency services first.
        </div>
      </div>
    </main>
  );
}
EOF

# ---- admin page ----
cat > src/app/'(app)'/admin/page.tsx <<'EOF'
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user!;

  const { data: guardian } = await supabase
    .from("guardians")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!guardian?.is_admin) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-bold">Admin</div>
        <div className="text-muted-foreground">You do not have access to this page.</div>
      </div>
    );
  }

  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Admin</div>
        <div className="text-muted-foreground">Basic admin view (expand for printing workflow).</div>
      </div>

      <Card className="p-6">
        <div className="font-semibold">Recent profiles</div>
        <div className="mt-4 space-y-2 text-sm">
          {(individuals ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between">
              <span>{i.display_name}</span>
              <span className="text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
EOF

echo ""
echo "✅ All remaining code written."

echo ""
echo "NEXT (must do):"
echo "1) Ensure .env.local exists with Supabase keys:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - NEXT_PUBLIC_SITE_URL=http://localhost:3000"
echo ""
echo "2) Supabase:"
echo "   - Create Storage bucket: qr (PRIVATE)"
echo "   - Run SQL schema + RLS + RPC get_public_profile (as shared earlier)"
echo ""
echo "3) Restart dev server:"
echo "   npm run dev"
echo ""

