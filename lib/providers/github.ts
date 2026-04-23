import type { ProviderAdapter, NormalizedActivityEvent } from "@/lib/providers/adapter";

type GitHubPublicEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name?: string };
};

const GITHUB_API_BASE = "https://api.github.com";
const MAX_PAGES = 10;

/**
 * Mirrors star.dev: public GitHub events API (no OAuth required for MVP).
 * Optional `GITHUB_TOKEN` env increases rate limits for server-side sync.
 */
export const githubAdapter: ProviderAdapter = {
  key: "GITHUB",
  displayName: "GitHub",
  defaultDataSource: "OAUTH",
  defaultConfidence: 0.95,

  async fetchRawActivity(input) {
    const username = input.externalId?.trim();
    if (!username) {
      throw new Error("GitHub username is missing. Save your GitHub username first.");
    }

    const since = input.since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const events: GitHubPublicEvent[] = [];
    const token = process.env.GITHUB_TOKEN?.trim();

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "Dailies",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) {
        throw new Error(`GitHub API request failed (${res.status})`);
      }

      const pageEvents = (await res.json()) as GitHubPublicEvent[];
      if (pageEvents.length === 0) break;
      events.push(...pageEvents);

      const oldest = pageEvents[pageEvents.length - 1];
      if (!oldest?.created_at) break;
      if (new Date(oldest.created_at) < since) break;
    }

    return { username, events, source: "public-events" };
  },

  normalizeEvents(raw: unknown, fallback: Date): NormalizedActivityEvent[] {
    const payload = raw as { events?: GitHubPublicEvent[]; source?: string };
    const events = payload.events ?? [];

    return events
      .map((e) => {
        const occurredAt = e.created_at ? new Date(e.created_at) : fallback;
        return {
          occurredAt,
          points: 1,
          trivial: e.type === "WatchEvent",
          confidence: 0.9,
          detail: {
            id: e.id,
            type: e.type,
            repo: e.repo?.name,
            source: payload.source ?? "unknown",
          },
        } satisfies NormalizedActivityEvent;
      })
      .filter((e) => !Number.isNaN(e.occurredAt.getTime()));
  },

  summarizeDay(events: NormalizedActivityEvent[]) {
    const pts = events.reduce((a, e) => a + (e.points > 0 ? 1 : 0), 0);
    return {
      date: events[0]?.occurredAt ?? new Date(),
      provider: "GITHUB",
      points: Math.min(1, pts),
      completed: pts > 0,
      confidence: events[0]?.confidence ?? 0.95,
    };
  },
};
