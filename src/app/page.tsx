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
