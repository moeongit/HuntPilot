import { cn } from "@/lib/cn";

export function HuntPilotMark({ className }: { className?: string }) {
  // A simple "H + compass/pin" mark (SVG) that works in light/dark via currentColor.
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
      fill="none"
    >
      <defs>
        <linearGradient id="hp_grad" x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c-9.941 0-18 8.059-18 18 0 12.5 18 34 18 34s18-21.5 18-34c0-9.941-8.059-18-18-18Z"
        fill="url(#hp_grad)"
        opacity="0.98"
      />
      <path
        d="M26 24v16m12-16v16M26 32h12"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <circle cx="32" cy="24" r="3.2" fill="white" opacity="0.95" />
    </svg>
  );
}

export function HuntPilotLogo({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <HuntPilotMark className="h-9 w-9" />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight text-foreground">HuntPilot</div>
        {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
      </div>
    </div>
  );
}

