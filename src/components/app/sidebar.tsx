"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { appNav } from "@/components/app/nav";
import { HuntPilotLogo } from "@/components/branding/huntpilot-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <Link href="/app" className="min-w-0">
            <HuntPilotLogo subtitle="Pipeline Dashboard" />
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {appNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">Tip</div>
          <div className="mt-1 leading-relaxed">
            Keep applications fresh by logging activity and completing follow-ups on time.
          </div>
        </div>
      </div>
    </aside>
  );
}

