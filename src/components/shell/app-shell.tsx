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
