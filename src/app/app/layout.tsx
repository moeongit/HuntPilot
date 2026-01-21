import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { HuntPilotLogo } from "@/components/branding/huntpilot-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Sidebar } from "@/components/app/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/app" className="flex items-center gap-3 lg:hidden">
                <HuntPilotLogo />
              </Link>

              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-foreground">HuntPilot</div>
                <div className="text-xs text-muted-foreground">Job application pipeline</div>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle className="hidden sm:inline-flex" />
                <div className="hidden text-sm text-muted-foreground sm:block">
                  {session?.user?.name ?? session?.user?.email ?? "Signed in"}
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>

          <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

