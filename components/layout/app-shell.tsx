import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  title: string;
  children: ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Dailies</span>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
