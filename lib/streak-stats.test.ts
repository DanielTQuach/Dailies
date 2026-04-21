import { describe, expect, it } from "vitest";
import { computeStreakUtc, computeWeeklyMomentum, uniqueUtcDayKeys, utcDayKey } from "./streak-stats";

describe("utcDayKey", () => {
  it("returns YYYY-MM-DD in UTC", () => {
    expect(utcDayKey(new Date(Date.UTC(2024, 5, 7, 15, 30, 0)))).toBe("2024-06-07");
  });
});

describe("computeWeeklyMomentum", () => {
  it("divides active days by window length", () => {
    expect(computeWeeklyMomentum(3, 7)).toBeCloseTo(3 / 7);
    expect(computeWeeklyMomentum(0, 7)).toBe(0);
  });
});

describe("uniqueUtcDayKeys", () => {
  it("dedupes dates on the same UTC day", () => {
    const set = uniqueUtcDayKeys([
      new Date(Date.UTC(2024, 0, 1, 1, 0, 0)),
      new Date(Date.UTC(2024, 0, 1, 22, 0, 0)),
    ]);
    expect(set.size).toBe(1);
    expect(set.has("2024-01-01")).toBe(true);
  });
});

describe("computeStreakUtc", () => {
  it("counts consecutive days ending at anchor", () => {
    const anchor = new Date(Date.UTC(2024, 0, 10, 12, 0, 0));
    const days = new Set(["2024-01-10", "2024-01-09", "2024-01-08"]);
    expect(computeStreakUtc(days, anchor)).toBe(3);
  });

  it("stops at first gap after streak started", () => {
    const anchor = new Date(Date.UTC(2024, 0, 10, 12, 0, 0));
    const days = new Set(["2024-01-10", "2024-01-08"]);
    expect(computeStreakUtc(days, anchor)).toBe(1);
  });

  it("allows leading inactive days before streak", () => {
    const anchor = new Date(Date.UTC(2024, 0, 10, 12, 0, 0));
    const days = new Set(["2024-01-05"]);
    expect(computeStreakUtc(days, anchor)).toBe(1);
  });
});
