import { prisma } from "@/lib/prisma";
import { githubAdapter } from "@/lib/providers/github";

/**
 * Port of star.dev `providers.syncGithub`: fetch public events, normalize, upsert `DailyActivity` per UTC day.
 */
export async function syncGithubForUser(internalUserId: string) {
  const account = await prisma.providerAccount.findUnique({
    where: {
      userId_provider: { userId: internalUserId, provider: "GITHUB" },
    },
  });
  if (!account) {
    throw new Error("GitHub is not connected.");
  }

  const job = await prisma.providerSyncJob.create({
    data: {
      userId: internalUserId,
      provider: "GITHUB",
      jobType: "sync_contributions",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const raw = await githubAdapter.fetchRawActivity({
      userId: internalUserId,
      externalId: account.externalId ?? account.displayName,
      since,
    });
    const events = githubAdapter
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
      const summary = githubAdapter.summarizeDay(dayEvents);
      const day = new Date(`${dateKey}T00:00:00.000Z`);
      await prisma.dailyActivity.upsert({
        where: {
          userId_date_provider: {
            userId: internalUserId,
            date: day,
            provider: "GITHUB",
          },
        },
        create: {
          userId: internalUserId,
          date: day,
          provider: "GITHUB",
          points: summary.points,
          completed: summary.completed,
          meta: { source: "github-public-events", eventCount: dayEvents.length },
        },
        update: {
          points: summary.points,
          completed: summary.completed,
          meta: { source: "github-public-events", eventCount: dayEvents.length },
        },
      });
    }

    await prisma.providerAccount.update({
      where: { userId_provider: { userId: internalUserId, provider: "GITHUB" } },
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
