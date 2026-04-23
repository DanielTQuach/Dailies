import { prisma } from "@/lib/prisma";
import { leetcodePlaceholderAdapter } from "@/lib/providers/leetcode-placeholder";

/**
 * LeetCode sync via public profile calendar:
 * fetches submissionCalendar and backfills one LEETCODE DailyActivity row per active UTC day.
 */
export async function syncLeetCodeForUser(internalUserId: string) {
  const account = await prisma.providerAccount.findUnique({
    where: {
      userId_provider: { userId: internalUserId, provider: "LEETCODE" },
    },
  });
  if (!account) {
    throw new Error("LeetCode is not connected.");
  }

  const job = await prisma.providerSyncJob.create({
    data: {
      userId: internalUserId,
      provider: "LEETCODE",
      jobType: "sync_calendar_public_profile",
      status: "RUNNING",
      startedAt: new Date(),
      payload: { source: "leetcode-user-calendar" },
    },
  });

  try {
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const raw = await leetcodePlaceholderAdapter.fetchRawActivity({
      userId: internalUserId,
      externalId: account.externalId ?? account.displayName,
      since,
    });
    const events = leetcodePlaceholderAdapter
      .normalizeEvents(raw, new Date())
      .filter((e) => e.occurredAt >= since);

    const byDay = new Map<string, typeof events>();
    for (const event of events) {
      const dayKey = event.occurredAt.toISOString().slice(0, 10);
      const bucket = byDay.get(dayKey) ?? [];
      bucket.push(event);
      byDay.set(dayKey, bucket);
    }

    for (const [dateKey, dayEvents] of byDay.entries()) {
      const summary = leetcodePlaceholderAdapter.summarizeDay(dayEvents);
      const day = new Date(`${dateKey}T00:00:00.000Z`);
      const totalSubmissions = dayEvents.reduce(
        (acc, e) =>
          acc + (typeof e.detail?.submissionCount === "number" ? Number(e.detail.submissionCount) : 0),
        0
      );

      await prisma.dailyActivity.upsert({
        where: {
          userId_date_provider: {
            userId: internalUserId,
            date: day,
            provider: "LEETCODE",
          },
        },
        create: {
          userId: internalUserId,
          date: day,
          provider: "LEETCODE",
          points: summary.points,
          completed: summary.completed,
          meta: {
            source: "leetcode-user-calendar",
            submissionCount: totalSubmissions,
            eventCount: dayEvents.length,
          },
        },
        update: {
          points: summary.points,
          completed: summary.completed,
          meta: {
            source: "leetcode-user-calendar",
            submissionCount: totalSubmissions,
            eventCount: dayEvents.length,
          },
        },
      });
    }

    await prisma.providerAccount.update({
      where: { userId_provider: { userId: internalUserId, provider: "LEETCODE" } },
      data: { lastSyncedAt: new Date() },
    });

    await prisma.providerSyncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        finishedAt: new Date(),
        result: { events: events.length, daysBackfilled: byDay.size },
      },
    });

    return { ok: true as const, daysBackfilled: byDay.size, events: events.length };
  } catch (e) {
    await prisma.providerSyncJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: e instanceof Error ? e.message : "unknown",
      },
    });
    throw e;
  }
}
