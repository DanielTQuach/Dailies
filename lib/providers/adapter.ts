import type { DataSourceType, ProviderKey } from "@prisma/client";

export type NormalizedActivityEvent = {
  occurredAt: Date;
  points: number;
  trivial: boolean;
  confidence: number;
  detail?: Record<string, unknown>;
};

export type DailyCompletionSummary = {
  date: Date;
  provider: ProviderKey;
  points: number;
  completed: boolean;
  confidence: number;
};

export interface ProviderAdapter {
  readonly key: ProviderKey;
  readonly displayName: string;
  readonly defaultDataSource: DataSourceType;
  readonly defaultConfidence: number;

  fetchRawActivity(input: {
    userId: string;
    externalId?: string | null;
    since?: Date;
  }): Promise<unknown>;

  normalizeEvents(raw: unknown, occurredAtFallback: Date): NormalizedActivityEvent[];

  summarizeDay(events: NormalizedActivityEvent[]): DailyCompletionSummary;
}
