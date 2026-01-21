"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY } from "@/components/theme/theme-script";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const label = useMemo(() => (theme === "dark" ? "Switch to light mode" : "Switch to dark mode"), [theme]);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        const root = document.documentElement;
        if (next === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {}
      }}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

