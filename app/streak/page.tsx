import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ensureAppUser } from "@/lib/ensure-user";
import { getStreakData } from "@/lib/streak-data";

function pct(active: number, window: number) {
  return `${Math.round((active / window) * 100)}%`;
}

export default async function StreakPage() {
  const user = await ensureAppUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl p-8">
        <EmptyState title="Not signed in" description="Sign in to view your streak analytics." />
      </div>
    );
  }

  const data = await getStreakData(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mega Streak
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Daily consistency across all goals, calculated by UTC day.
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Last active day: {data.latestActiveDate ?? "No activity yet"}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Current streak"
          hint="Consecutive active UTC days"
          value={data.currentStreak}
          sub={data.currentStreak > 0 ? "Keep it alive today" : "Start a new streak today"}
        />
        <KpiCard
          title="Longest streak"
          hint="Best run in your account history"
          value={data.longestStreak}
          sub="All-time record"
        />
        <KpiCard
          title="Active days (30d)"
          hint="Days with at least one entry"
          value={data.activeDaysLast30d}
          sub={`${pct(data.activeDaysLast30d, 30)} consistency`}
        />
        <KpiCard
          title="Break days (30d)"
          hint="Days without any entry"
          value={data.breakDaysLast30d}
          sub={data.breakDaysLast30d === 0 ? "Perfect month" : "Opportunities to recover"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Streak heatmap</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Last 14 weeks of progress activity
            </p>
          </div>
          <div className="p-4">
            {data.heatmapRows.length ? (
              <ActivityHeatmap rows={data.heatmapRows} />
            ) : (
              <EmptyState
                title="No activity yet"
                description="Log progress on a goal to start building your streak."
              />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Window coverage</h2>
          </div>
          <div className="space-y-2 p-4">
            {(
              [
                ["7d", 7],
                ["30d", 30],
                ["90d", 90],
                ["365d", 365],
              ] as const
            ).map(([key, days]) => (
              <div
                key={key}
                className="rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{key}</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-50">
                    {data.activeByRange[key]}/{days}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {pct(data.activeByRange[key], days)} active-day rate
                </p>
              </div>
            ))}
            <div className="rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">Entries (30d):</span>{" "}
                <span className="font-mono text-zinc-900 dark:text-zinc-50">{data.entriesLast30d}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">Entries (all-time):</span>{" "}
                <span className="font-mono text-zinc-900 dark:text-zinc-50">{data.totalEntries}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top active goals (365d)</h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Ranked by active days, then total points
          </p>
        </div>
        <div className="p-4">
          {data.goalActivity.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-2 py-2 font-medium">Goal</th>
                    <th className="px-2 py-2 font-medium">Active days</th>
                    <th className="px-2 py-2 font-medium">Entries</th>
                    <th className="px-2 py-2 font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.goalActivity.map((goal) => (
                    <tr key={goal.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-2 py-2 text-zinc-900 dark:text-zinc-50">{goal.title}</td>
                      <td className="px-2 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                        {goal.activeDays}
                      </td>
                      <td className="px-2 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                        {goal.entries}
                      </td>
                      <td className="px-2 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                        {goal.totalPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No goal activity yet"
              description="Once you log entries, this view will show your most consistent goals."
            />
          )}
        </div>
      </div>
    </div>
  );
}
