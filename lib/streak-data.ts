import { prisma } from "@/lib/prisma";
import { computeStreakUtc, uniqueUtcDayKeys } from "@/lib/streak-stats";

type RangeKey = "7d" | "30d" | "90d" | "365d";

type GoalActivity = {
  id: string;
  title: string;
  activeDays: number;
  entries: number;
  totalPoints: number;
};

export type StreakPayload = {
  currentStreak: number;
  longestStreak: number;
  activeDaysLast7d: number;
  activeDaysLast30d: number;
  activeDaysLast90d: number;
  activeDaysLast365d: number;
  entriesLast30d: number;
  totalEntries: number;
  breakDaysLast30d: number;
  latestActiveDate: string | null;
  heatmapRows: { date: string; provider: string; points: number; completed: boolean }[];
  goalActivity: GoalActivity[];
  activeByRange: Record<RangeKey, number>;
};

function daysAgoUtc(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function computeLongestStreakUtc(dayKeys: Set<string>): number {
  const sorted = [...dayKeys].sort();
  if (sorted.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00.000Z`);
    prev.setUTCDate(prev.getUTCDate() + 1);
    const expected = prev.toISOString().slice(0, 10);
    if (sorted[i] === expected) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export async function getStreakData(internalUserId: string): Promise<StreakPayload> {
  const since7d = daysAgoUtc(7);
  const since30d = daysAgoUtc(30);
  const since90d = daysAgoUtc(90);
  const since365d = daysAgoUtc(365);

  const [entriesAll, entriesYear, goals] = await Promise.all([
    prisma.progressEntry.findMany({
      where: { goal: { userId: internalUserId } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.progressEntry.findMany({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: since365d },
      },
      select: { createdAt: true, amount: true, goalId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: internalUserId },
      select: { id: true, title: true },
    }),
  ]);

  const allDayKeys = uniqueUtcDayKeys(entriesAll.map((e) => e.createdAt));
  const yearDayKeys = uniqueUtcDayKeys(entriesYear.map((e) => e.createdAt));
  const entries7dKeys = uniqueUtcDayKeys(
    entriesYear.filter((e) => e.createdAt >= since7d).map((e) => e.createdAt)
  );
  const entries30dKeys = uniqueUtcDayKeys(
    entriesYear.filter((e) => e.createdAt >= since30d).map((e) => e.createdAt)
  );
  const entries90dKeys = uniqueUtcDayKeys(
    entriesYear.filter((e) => e.createdAt >= since90d).map((e) => e.createdAt)
  );

  const currentStreak = computeStreakUtc(allDayKeys);
  const longestStreak = computeLongestStreakUtc(allDayKeys);
  const activeDaysLast30d = entries30dKeys.size;
  const breakDaysLast30d = Math.max(30 - activeDaysLast30d, 0);

  const goalMap = new Map<string, GoalActivity>();
  for (const g of goals) {
    goalMap.set(g.id, {
      id: g.id,
      title: g.title,
      activeDays: 0,
      entries: 0,
      totalPoints: 0,
    });
  }

  const goalDayKeys = new Map<string, Set<string>>();
  for (const entry of entriesYear) {
    const bucket = goalMap.get(entry.goalId);
    if (!bucket) continue;
    bucket.entries += 1;
    bucket.totalPoints += entry.amount;
    if (!goalDayKeys.has(entry.goalId)) goalDayKeys.set(entry.goalId, new Set());
    goalDayKeys.get(entry.goalId)?.add(entry.createdAt.toISOString().slice(0, 10));
  }

  for (const [goalId, dayKeys] of goalDayKeys) {
    const bucket = goalMap.get(goalId);
    if (bucket) bucket.activeDays = dayKeys.size;
  }

  const goalActivity = [...goalMap.values()]
    .filter((g) => g.entries > 0)
    .sort((a, b) => b.activeDays - a.activeDays || b.totalPoints - a.totalPoints)
    .slice(0, 6);

  return {
    currentStreak,
    longestStreak,
    activeDaysLast7d: entries7dKeys.size,
    activeDaysLast30d,
    activeDaysLast90d: entries90dKeys.size,
    activeDaysLast365d: yearDayKeys.size,
    entriesLast30d: entriesYear.filter((e) => e.createdAt >= since30d).length,
    totalEntries: entriesAll.length,
    breakDaysLast30d,
    latestActiveDate: entriesAll.length
      ? entriesAll[entriesAll.length - 1].createdAt.toISOString().slice(0, 10)
      : null,
    heatmapRows: entriesYear.map((e) => ({
      date: e.createdAt.toISOString(),
      provider: "Progress",
      points: e.amount,
      completed: true,
    })),
    goalActivity,
    activeByRange: {
      "7d": entries7dKeys.size,
      "30d": entries30dKeys.size,
      "90d": entries90dKeys.size,
      "365d": yearDayKeys.size,
    },
  };
}
