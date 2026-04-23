import { prisma } from "@/lib/prisma";
import { computeStreakUtc, computeWeeklyMomentum, uniqueUtcDayKeys, utcDayKey } from "@/lib/streak-stats";

export type HeatmapRowSerializable = {
  date: string;
  provider: string;
  points: number;
  completed: boolean;
};

export type DashboardPayload = {
  goalCount: number;
  entriesLast7d: number;
  entriesLast30d: number;
  totalProgressPoints: number;
  weeklyMomentum: number;
  monthlyMomentum: number;
  momentumDelta: number;
  megaStreak: number;
  nextAction: string;
  heatmapRows: HeatmapRowSerializable[];
  goalsForSelect: { id: string; title: string }[];
  /** GitHub integration summary for the signed-in user (optional UI). */
  github: {
    username: string | null;
    lastSyncedAt: string | null;
    /** Distinct UTC days in the last ~90d with a completed GitHub daily row. */
    completedDaysLast90: number;
  };
};

export async function getDashboardData(internalUserId: string): Promise<DashboardPayload> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const ninetyAgo = new Date(now);
  ninetyAgo.setUTCDate(ninetyAgo.getUTCDate() - 90);
  const monthAgo = new Date(now);
  monthAgo.setUTCDate(monthAgo.getUTCDate() - 30);
  const yearAgo = new Date(now);
  yearAgo.setUTCDate(yearAgo.getUTCDate() - 365);

  const [
    goalCount,
    entriesLast7d,
    entriesLast30d,
    heatmapEntries,
    sumAgg,
    goalsForSelect,
    entries7dKeys,
    entries30dKeys,
    entriesYear,
    githubDailyYear,
    githubAccount,
  ] = await Promise.all([
    prisma.goal.count({ where: { userId: internalUserId } }),
    prisma.progressEntry.count({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: weekAgo },
      },
    }),
    prisma.progressEntry.count({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: monthAgo },
      },
    }),
    prisma.progressEntry.findMany({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: ninetyAgo },
      },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progressEntry.aggregate({
      where: { goal: { userId: internalUserId } },
      _sum: { amount: true },
    }),
    prisma.goal.findMany({
      where: { userId: internalUserId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.progressEntry.findMany({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: weekAgo },
      },
      select: { createdAt: true },
    }),
    prisma.progressEntry.findMany({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: monthAgo },
      },
      select: { createdAt: true },
    }),
    prisma.progressEntry.findMany({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: yearAgo },
      },
      select: { createdAt: true },
    }),
    prisma.dailyActivity.findMany({
      where: {
        userId: internalUserId,
        provider: "GITHUB",
        date: { gte: yearAgo },
      },
      select: { date: true, points: true, completed: true },
    }),
    prisma.providerAccount.findUnique({
      where: { userId_provider: { userId: internalUserId, provider: "GITHUB" } },
      select: { externalId: true, lastSyncedAt: true, connectionStatus: true },
    }),
  ]);

  const weekAgoDay = utcDayKey(weekAgo);
  const monthAgoDay = utcDayKey(monthAgo);
  const ninetyAgoDay = utcDayKey(ninetyAgo);

  const daysWithActivity = uniqueUtcDayKeys(entries7dKeys.map((e) => e.createdAt));
  const monthDaysWithActivity = uniqueUtcDayKeys(entries30dKeys.map((e) => e.createdAt));
  for (const g of githubDailyYear) {
    if (!g.completed) continue;
    const k = utcDayKey(new Date(g.date));
    if (k >= weekAgoDay) daysWithActivity.add(k);
    if (k >= monthAgoDay) monthDaysWithActivity.add(k);
  }
  const weeklyMomentum = computeWeeklyMomentum(daysWithActivity.size, 7);
  const monthlyMomentum = computeWeeklyMomentum(monthDaysWithActivity.size, 30);
  const momentumDelta = weeklyMomentum - monthlyMomentum;

  const streakDays = uniqueUtcDayKeys(entriesYear.map((e) => e.createdAt));
  for (const g of githubDailyYear) {
    if (!g.completed) continue;
    streakDays.add(utcDayKey(new Date(g.date)));
  }
  const megaStreak = computeStreakUtc(streakDays);

  const progressHeatmap: HeatmapRowSerializable[] = heatmapEntries.map((e) => ({
    date: e.createdAt.toISOString(),
    provider: "Progress",
    points: e.amount,
    completed: true,
  }));
  const githubHeatmap: HeatmapRowSerializable[] = githubDailyYear
    .filter((g) => utcDayKey(new Date(g.date)) >= ninetyAgoDay)
    .filter((g) => g.completed || g.points > 0)
    .map((g) => ({
      date: new Date(g.date).toISOString(),
      provider: "GitHub",
      points: g.points,
      completed: g.completed,
    }));
  const heatmapRows: HeatmapRowSerializable[] = [...progressHeatmap, ...githubHeatmap];

  const githubCompletedDaysLast90 = new Set(
    githubDailyYear
      .filter((g) => g.completed && utcDayKey(new Date(g.date)) >= ninetyAgoDay)
      .map((g) => utcDayKey(new Date(g.date)))
  ).size;

  const totalProgressPoints = sumAgg._sum.amount ?? 0;

  const githubLinked =
    githubAccount?.connectionStatus === "connected" && Boolean(githubAccount.externalId?.trim());

  let nextAction = "Log progress on one of your goals.";
  if (goalCount === 0) {
    nextAction = "Create your first goal to start tracking.";
  } else if (githubLinked && githubCompletedDaysLast90 === 0) {
    nextAction =
      "GitHub is linked but no synced activity yet — open Integrations, confirm your username, then use Run sync.";
  } else if (entriesLast7d === 0) {
    nextAction = "No entries in the last 7 days — add a quick log below.";
  }

  return {
    goalCount,
    entriesLast7d,
    entriesLast30d,
    totalProgressPoints,
    weeklyMomentum,
    monthlyMomentum,
    momentumDelta,
    megaStreak,
    nextAction,
    heatmapRows,
    goalsForSelect,
    github: {
      username: githubAccount?.externalId?.trim() ? githubAccount.externalId : null,
      lastSyncedAt: githubAccount?.lastSyncedAt?.toISOString() ?? null,
      completedDaysLast90: githubCompletedDaysLast90,
    },
  };
}
