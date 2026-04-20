import { prisma } from "@/lib/prisma";

export type HeatmapRowSerializable = {
  date: string;
  provider: string;
  points: number;
  completed: boolean;
};

export type DashboardPayload = {
  goalCount: number;
  entriesLast7d: number;
  totalProgressPoints: number;
  weeklyMomentum: number;
  megaStreak: number;
  nextAction: string;
  heatmapRows: HeatmapRowSerializable[];
  goalsForSelect: { id: string; title: string }[];
};

function utcDayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeStreakUtc(daysWithActivity: Set<string>) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const key = utcDayKey(d);
    if (daysWithActivity.has(key)) {
      streak += 1;
    } else if (streak > 0) {
      break;
    }
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

export async function getDashboardData(internalUserId: string): Promise<DashboardPayload> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const ninetyAgo = new Date(now);
  ninetyAgo.setUTCDate(ninetyAgo.getUTCDate() - 90);
  const yearAgo = new Date(now);
  yearAgo.setUTCDate(yearAgo.getUTCDate() - 365);

  const [
    goalCount,
    entriesLast7d,
    heatmapEntries,
    sumAgg,
    goalsForSelect,
    entries7dKeys,
    entriesYear,
  ] = await Promise.all([
    prisma.goal.count({ where: { userId: internalUserId } }),
    prisma.progressEntry.count({
      where: {
        goal: { userId: internalUserId },
        createdAt: { gte: weekAgo },
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
        createdAt: { gte: yearAgo },
      },
      select: { createdAt: true },
    }),
  ]);

  const daysWithActivity = new Set(entries7dKeys.map((e) => utcDayKey(e.createdAt)));
  const weeklyMomentum = daysWithActivity.size / 7;

  const streakDays = new Set(entriesYear.map((e) => utcDayKey(e.createdAt)));
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
    totalProgressPoints,
    weeklyMomentum,
    megaStreak,
    nextAction,
    heatmapRows,
    goalsForSelect,
  };
}
