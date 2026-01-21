import { cn } from "@/lib/cn";

const variants = {
  neutral: "border-border bg-muted text-muted-foreground",
  accent: "border-border bg-primary text-primary-foreground",
  success: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  danger: "border-rose-300/30 bg-rose-400/10 text-rose-300",
} as const;

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

