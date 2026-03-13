import sql from "@/lib/db";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, clearRateLimit } from "../loginAttempts";

vi.mock("@/lib/db", () => ({ default: vi.fn() }));

const mockSql = vi.mocked(sql);

/** postgres sql return type includes ResultQueryMeta; we only need array-like in tests */
function asSqlResult<T>(value: T): Awaited<ReturnType<typeof sql>> {
  return value as Awaited<ReturnType<typeof sql>>;
}

const FIXED_NOW = new Date("2024-06-01T12:00:00.000Z");

describe("loginAttempts", () => {
  beforeEach(() => {
    mockSql.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("returns allowed: true without calling sql when ip is undefined", async () => {
      const result = await checkRateLimit(undefined);

      expect(result).toEqual({ allowed: true });
      expect(mockSql).not.toHaveBeenCalled();
    });

    it("inserts and returns allowed: true when no existing record", async () => {
      mockSql.mockResolvedValueOnce(asSqlResult([{ attempts: 1, window_start: FIXED_NOW }]));

      const result = await checkRateLimit("192.168.1.1");

      expect(result).toEqual({ allowed: true });
      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it("resets window and returns allowed: true when window expired", async () => {
      const windowStart = new Date("2024-06-01T11:44:00.000Z");
      mockSql.mockResolvedValueOnce(asSqlResult([{ attempts: 1, window_start: windowStart }]));

      const result = await checkRateLimit("192.168.1.1");

      expect(result).toEqual({ allowed: true });
      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it("increments and returns allowed: true when within window and under limit", async () => {
      const windowStart = new Date("2024-06-01T11:50:00.000Z");
      mockSql.mockResolvedValueOnce(asSqlResult([{ attempts: 3, window_start: windowStart }]));

      const result = await checkRateLimit("192.168.1.1");

      expect(result).toEqual({ allowed: true });
      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it("returns allowed: false with minutesLeft when at or over limit within window", async () => {
      const windowStart = new Date("2024-06-01T11:50:00.000Z");
      mockSql.mockResolvedValueOnce(asSqlResult([{ attempts: 5, window_start: windowStart }]));

      const result = await checkRateLimit("192.168.1.1");

      expect(result).toEqual({ allowed: false, minutesLeft: 5 });
      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearRateLimit", () => {
    it("does not call sql when ip is undefined", async () => {
      await clearRateLimit(undefined);

      expect(mockSql).not.toHaveBeenCalled();
    });

    it("calls sql DELETE when ip is provided", async () => {
      mockSql.mockResolvedValueOnce(asSqlResult(undefined));

      await clearRateLimit("192.168.1.1");

      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });
});
