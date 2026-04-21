import { prisma } from "@/lib/prisma";
import { computeStreakUtc, computeWeeklyMomentum, uniqueUtcDayKeys } from "@/lib/streak-stats";

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
  ]);

  const daysWithActivity = uniqueUtcDayKeys(entries7dKeys.map((e) => e.createdAt));
  const weeklyMomentum = computeWeeklyMomentum(daysWithActivity.size, 7);
  const monthDaysWithActivity = uniqueUtcDayKeys(entries30dKeys.map((e) => e.createdAt));
  const monthlyMomentum = computeWeeklyMomentum(monthDaysWithActivity.size, 30);
  const momentumDelta = weeklyMomentum - monthlyMomentum;

  const streakDays = uniqueUtcDayKeys(entriesYear.map((e) => e.createdAt));
  const megaStreak = computeStreakUtc(streakDays);

  const heatmapRows: HeatmapRowSerializable[] = heatmapEntries.map((e) => ({
    date: e.createdAt.toISOString(),
    provider: "Progress",
    points: e.amount,
    completed: true,
  }));

  const totalProgressPoints = sumAgg._sum.amount ?? 0;

  let nextAction = "Log progress on one of your goals.";
  if (goalCount === 0) {
    nextAction = "Create your first goal to start tracking.";
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
  };
}
