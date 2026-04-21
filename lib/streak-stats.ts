/** UTC calendar day key `YYYY-MM-DD` from a `Date` (uses `toISOString`). */
export function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Longest run of consecutive UTC days with activity, walking backward from `anchor` (default: now).
 * Allows inactive "gap" days before the streak starts (matches prior dashboard behavior).
 */
export function computeStreakUtc(daysWithActivity: Set<string>, anchor: Date = new Date()): number {
  const d = new Date(anchor);
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

/** Share of `windowDays` that had at least one qualifying day (0–1). */
export function computeWeeklyMomentum(uniqueActiveDays: number, windowDays = 7): number {
  if (windowDays <= 0) return 0;
  return uniqueActiveDays / windowDays;
}

export function uniqueUtcDayKeys(dates: Date[]): Set<string> {
  return new Set(dates.map((d) => utcDayKey(d)));
}
