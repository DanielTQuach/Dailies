"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Boxes,
  Briefcase,
  Flame,
  LayoutDashboard,
  Plug,
  Settings,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const APP_NAV: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/streak", label: "Mega Streak", icon: Flame },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/jobs", label: "Job Tracker", icon: Briefcase },
  { href: "/prep", label: "Interview Prep", icon: BookOpen },
  { href: "/sandbox", label: "Algorithm Sandbox", icon: Boxes },
  { href: "/resources", label: "Resources", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Dailies</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Dailies preview shell</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {APP_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-2 rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-50"
              }
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
