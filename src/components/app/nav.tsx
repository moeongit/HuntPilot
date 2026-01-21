import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export const appNav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/app/timeline", label: "Timeline", icon: Clock },
  { href: "/app/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/app/interviews", label: "Interview Prep", icon: ClipboardList },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

