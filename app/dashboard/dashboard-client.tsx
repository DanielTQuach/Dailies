"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { DashboardPayload } from "@/lib/dashboard-data";
import { quickLogProgress } from "./actions";

type DashboardClientProps = {
  displayName: string;
  email: string | null;
  data: DashboardPayload;
};

export function DashboardClient({ displayName, email, data }: DashboardClientProps) {
  const exportPayload = useMemo(
    () => ({
      generatedAt: new Date().toISOString(),
      displayName,
      email,
      summary: data,
    }),
    [data, displayName, email]
  );

  const exportReport = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailies-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{displayName}</span>
            {email ? <span className="text-zinc-500"> ({email})</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/goals"
            className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            Goals
          </Link>
          <Link
            href="/"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Streak"
          hint="Consecutive days with progress (UTC)"
          value={data.megaStreak}
          sub="Based on your progress log"
        />
        <KpiCard
          title="Weekly momentum"
          hint="Share of last 7 days with any log"
          value={`${Math.round(data.weeklyMomentum * 100)}%`}
          sub="Higher is steadier cadence"
        />
        <KpiCard
          title="Progress points"
          hint="Sum of all entry amounts"
          value={data.totalProgressPoints}
          sub="Across every goal"
        />
        <KpiCard
          title="Active goals"
          hint="Goals you are tracking"
          value={data.goalCount}
          sub="Open Goals to edit"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">Next:</span>{" "}
          {data.nextAction}
        </p>
        <button
          type="button"
          onClick={exportReport}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Export report (JSON)
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Activity</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Progress entries · heatmap (last ~14 weeks)
            </p>
          </div>
          <div className="p-4">
            {data.heatmapRows.length ? (
              <ActivityHeatmap rows={data.heatmapRows} />
            ) : (
              <EmptyState
                title="No activity yet"
                description="Log progress from Goals, or use Quick log here once you have at least one goal."
              />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Quick log</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              +1 progress point on a chosen goal
            </p>
          </div>
          <div className="p-4">
            {data.goalsForSelect.length === 0 ? (
              <EmptyState
                title="Create a goal first"
                description="You need at least one goal before quick logging from the dashboard."
                className="py-6"
              />
            ) : (
              <form className="space-y-3" action={quickLogProgress}>
                <div className="space-y-1.5">
                  <label
                    htmlFor="goalId"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Goal
                  </label>
                  <select
                    id="goalId"
                    name="goalId"
                    required
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    defaultValue={data.goalsForSelect[0]?.id}
                  >
                    {data.goalsForSelect.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="note"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Note (optional)
                  </label>
                  <input
                    id="note"
                    name="note"
                    type="text"
                    placeholder="Deep work, study block…"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Log today
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Goals snapshot
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 text-[11px]">
            <div className="rounded-md border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">Goals</p>
              <p className="font-mono text-lg text-zinc-900 dark:text-zinc-50">{data.goalCount}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">Entries (7d)</p>
              <p className="font-mono text-lg text-zinc-900 dark:text-zinc-50">
                {data.entriesLast7d}
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">Progress pts</p>
              <p className="font-mono text-lg text-zinc-900 dark:text-zinc-50">
                {data.totalProgressPoints}
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">Weekly %</p>
              <p className="font-mono text-lg text-zinc-900 dark:text-zinc-50">
                {Math.round(data.weeklyMomentum * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tracking</h2>
          </div>
          <div className="p-4 text-[11px] text-zinc-600 dark:text-zinc-400">
            <p>
              You have{" "}
              <span className="font-mono text-zinc-900 dark:text-zinc-50">{data.goalCount}</span>{" "}
              goals and{" "}
              <span className="font-mono text-zinc-900 dark:text-zinc-50">
                {data.totalProgressPoints}
              </span>{" "}
              total progress points. Open{" "}
              <Link
                className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                href="/goals"
              >
                Goals
              </Link>{" "}
              to add titles, descriptions, and richer logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
