import type { ProviderAdapter, NormalizedActivityEvent } from "@/lib/providers/adapter";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

type LeetCodeCalendarResponse = {
  data?: {
    matchedUser?: {
      userCalendar?: {
        submissionCalendar?: string;
      } | null;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

/**
 * Uses LeetCode public GraphQL calendar data keyed by unix day timestamps.
 * Produces one normalized event per active day so dashboard/streak can aggregate by day.
 */
export const leetcodePlaceholderAdapter: ProviderAdapter = {
  key: "LEETCODE",
  displayName: "LeetCode",
  defaultDataSource: "PUBLIC_PROFILE",
  defaultConfidence: 0.7,

  async fetchRawActivity(input) {
    const username = input.externalId?.trim();
    if (!username) {
      throw new Error("LeetCode username is missing. Save your username first.");
    }

    const body = {
      operationName: "userProfileCalendar",
      variables: { username },
      query:
        "query userProfileCalendar($username: String!) { matchedUser(username: $username) { userCalendar { submissionCalendar } } }",
    };

    const res = await fetch(LEETCODE_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/",
        "User-Agent": "Dailies",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`LeetCode request failed (${res.status})`);
    }

    const payload = (await res.json()) as LeetCodeCalendarResponse;
    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message ?? "LeetCode returned an unknown error.");
    }
    return { username, payload };
  },

  normalizeEvents(raw: unknown, fallback: Date): NormalizedActivityEvent[] {
    const wrapped = raw as {
      username?: string;
      payload?: LeetCodeCalendarResponse;
    };
    const calendarRaw =
      wrapped.payload?.data?.matchedUser?.userCalendar?.submissionCalendar ?? "{}";

    let parsed: Record<string, number> = {};
    try {
      parsed = JSON.parse(calendarRaw) as Record<string, number>;
    } catch {
      parsed = {};
    }

    return Object.entries(parsed)
      .filter(([, count]) => Number.isFinite(count) && count > 0)
      .map(([unixDay, count]) => {
        const seconds = Number.parseInt(unixDay, 10);
        const occurredAt = Number.isFinite(seconds) ? new Date(seconds * 1000) : fallback;
        return {
          occurredAt,
          points: 1,
          trivial: false,
          confidence: 0.7,
          detail: {
            submissionCount: count,
            source: "leetcode-user-calendar",
          },
        } satisfies NormalizedActivityEvent;
      })
      .filter((e) => !Number.isNaN(e.occurredAt.getTime()));
  },

  summarizeDay(events: NormalizedActivityEvent[]) {
    const pts = events.some((e) => e.points > 0) ? 1 : 0;
    return {
      date: events[0]?.occurredAt ?? new Date(),
      provider: "LEETCODE",
      points: pts,
      completed: pts > 0,
      confidence: 0.7,
    };
  },
};
