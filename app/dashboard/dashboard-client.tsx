"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { DashboardPayload } from "@/lib/dashboard-data";
import { quickLogManualActivity, quickLogProgress } from "./actions";
import { SubmitButton } from "./submit-button";

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
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Streak"
          hint="Consecutive days with progress (UTC)"
          value={data.megaStreak}
          sub="Goal logs + synced GitHub days"
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

      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard
          title="Entries (30d)"
          hint="Recent monthly volume"
          value={data.entriesLast30d}
          sub="Includes last 30 UTC days"
        />
        <KpiCard
          title="Monthly momentum"
          hint="Share of active days in last 30"
          value={`${Math.round(data.monthlyMomentum * 100)}%`}
          sub="Longer-window consistency"
        />
        <KpiCard
          title="Trend vs monthly"
          hint="7-day minus 30-day momentum"
          value={`${data.momentumDelta >= 0 ? "+" : ""}${Math.round(data.momentumDelta * 100)}pp`}
          sub={data.momentumDelta >= 0 ? "Pacing above monthly baseline" : "Pacing below monthly baseline"}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm xl:col-span-8 dark:border-zinc-800 dark:bg-zinc-950">
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

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm xl:col-span-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Quick log</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Log goal progress or manual activity for today
            </p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <form className="space-y-3" action={quickLogProgress}>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Goal activity
                </p>
                {data.goalsForSelect.length === 0 ? (
                  <EmptyState
                    title="Create a goal first"
                    description="You need at least one goal to use goal quick log."
                    className="py-3"
                  />
                ) : null}
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
                    required={data.goalsForSelect.length > 0}
                    disabled={data.goalsForSelect.length === 0}
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
                {data.goalsForSelect.length > 0 ? (
                  <SubmitButton
                    idleLabel="Log today"
                    pendingLabel="Logging..."
                    className="rounded-md border border-zinc-300 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  />
                ) : null}
              </form>

              <form className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800" action={quickLogManualActivity}>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Manual activity
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="manualPoints"
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Points
                    </label>
                    <input
                      id="manualPoints"
                      name="manualPoints"
                      type="number"
                      min={0.1}
                      max={5}
                      step={0.1}
                      defaultValue={1}
                      className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="manualNote"
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Note (optional)
                    </label>
                    <input
                      id="manualNote"
                      name="manualNote"
                      type="text"
                      maxLength={200}
                      placeholder="What did you work on?"
                      className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                </div>
                <SubmitButton
                  idleLabel="Log manual activity"
                  pendingLabel="Logging..."
                  className="rounded-md border border-zinc-300 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                />
              </form>
            </div>
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
