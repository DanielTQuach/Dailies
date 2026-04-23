"use client";

import { useMemo, useState } from "react";
import type { HeatmapRowSerializable } from "@/lib/dashboard-data";
import { cn } from "@/lib/cn";

type ActivityRow = {
  date: Date;
  provider: string;
  points: number;
  completed: boolean;
};

type DaySummary = {
  date: string;
  points: number;
  completedProviders: number;
  providers: Record<string, number>;
};

function buildDayMap(rows: ActivityRow[]): Map<string, DaySummary> {
  const map = new Map<string, DaySummary>();
  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 10);
    const bucket = map.get(key) ?? {
      date: key,
      points: 0,
      completedProviders: 0,
      providers: {},
    };
    const providerPoints = row.completed || row.points > 0 ? 1 : 0;
    bucket.points += row.points;
    bucket.completedProviders += providerPoints;
    bucket.providers[row.provider] = (bucket.providers[row.provider] ?? 0) + providerPoints;
    map.set(key, bucket);
  }
  return map;
}

function buildGrid(dayMap: Map<string, DaySummary>): DaySummary[] {
  const out: DaySummary[] = [];
  const end = new Date();
  const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  for (let i = 0; i < 98; i++) {
    const key = d.toISOString().slice(0, 10);
    out.push(dayMap.get(key) ?? { date: key, points: 0, completedProviders: 0, providers: {} });
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return out.reverse();
}

function toWeekColumns(days: DaySummary[]): DaySummary[][] {
  const columns: DaySummary[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }
  return columns;
}

function intensity(points: number): 0 | 1 | 2 | 3 | 4 {
  if (points <= 0) return 0;
  if (points < 1) return 1;
  if (points < 2) return 2;
  if (points < 3) return 3;
  return 4;
}

function prettyDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityHeatmap({ rows }: { rows: HeatmapRowSerializable[] }) {
  const parsedRows = useMemo<ActivityRow[]>(
    () => rows.map((r) => ({ ...r, date: new Date(r.date) })),
    [rows]
  );

  const dayMap = useMemo(() => buildDayMap(parsedRows), [parsedRows]);
  const grid = useMemo(() => buildGrid(dayMap), [dayMap]);
  const weekColumns = useMemo(() => toWeekColumns(grid), [grid]);
  const defaultDate = useMemo(() => {
    const latestActive = [...grid].reverse().find((d) => d.completedProviders > 0);
    return latestActive?.date ?? grid[grid.length - 1]?.date;
  }, [grid]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(defaultDate);
  const selected = selectedDate ? dayMap.get(selectedDate) : undefined;
  const recentActive = useMemo(
    () =>
      [...dayMap.values()]
        .filter((d) => d.completedProviders > 0)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [dayMap]
  );
  const providerRows = useMemo(
    () =>
      Object.entries(selected?.providers ?? {})
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]),
    [selected]
  );

  return (
    <div className="grid gap-4 2xl:grid-cols-[1fr_260px]">
      <div>
        <p className="mb-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Last 14 weeks · click a day for details
        </p>
        <div className="overflow-x-auto px-0.5 py-1.5">
          <div className="flex min-w-max gap-1">
            {weekColumns.map((week, weekIdx) => (
              <div key={`week-${weekIdx}`} className="grid grid-rows-7 gap-1">
                {week.map((cell) => {
                  const level = intensity(cell.points);
                  const isSelected = selectedDate === cell.date;
                  return (
                    <button
                      key={cell.date}
                      type="button"
                      title={`${cell.date} · ${cell.completedProviders} active source(s)`}
                      onClick={() => setSelectedDate(cell.date)}
                      className={cn(
                        "size-4 rounded-[3px] border border-zinc-200/80 transition dark:border-zinc-700/80",
                        level === 0 && "bg-zinc-100 dark:bg-zinc-900/60",
                        level === 1 && "bg-emerald-900/30",
                        level === 2 && "bg-emerald-700/50",
                        level === 3 && "bg-emerald-600/70",
                        level === 4 && "bg-emerald-500/90",
                        isSelected &&
                          "ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-950"
                      )}
                      aria-label={`${cell.date} activity`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
          <span>Less</span>
          <div className="flex gap-1">
            <span className="size-3 rounded-[2px] bg-zinc-100 dark:bg-zinc-900/60" />
            <span className="size-3 rounded-[2px] bg-emerald-900/30" />
            <span className="size-3 rounded-[2px] bg-emerald-700/50" />
            <span className="size-3 rounded-[2px] bg-emerald-600/70" />
            <span className="size-3 rounded-[2px] bg-emerald-500/90" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/50">
        <div>
          <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
            {selectedDate ? prettyDate(selectedDate) : "No day selected"}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {selected
              ? `${selected.completedProviders} active source(s) · ${Math.round(selected.points * 100) / 100} points`
              : "No recorded activity"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Providers</p>
          {providerRows.length ? (
            providerRows.map(([provider, value]) => (
              <div
                key={provider}
                className="flex items-center justify-between rounded border border-zinc-200/90 bg-white/80 px-2 py-1 text-xs dark:border-zinc-700/90 dark:bg-zinc-950/80"
              >
                <span className="text-zinc-800 dark:text-zinc-200">{provider}</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-50">{value}</span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              No provider activity for this day.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Recent active days
          </p>
          {recentActive.length ? (
            recentActive.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDate(d.date)}
                className="flex w-full items-center justify-between rounded border border-zinc-200/90 bg-white/80 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900"
              >
                <span className="text-zinc-800 dark:text-zinc-200">{prettyDate(d.date)}</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-50">
                  {d.completedProviders}
                </span>
              </button>
            ))
          ) : (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
