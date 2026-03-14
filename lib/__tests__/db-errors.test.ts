import {
  isConnectionError,
  isConnectionErrorOrAggregate,
  withPrerenderFallback,
} from "../db-errors";

describe("isConnectionError", () => {
  it("returns true for ECONNREFUSED", () => {
    expect(isConnectionError({ code: "ECONNREFUSED" })).toBe(true);
  });

  it("returns true for ENOTFOUND", () => {
    expect(isConnectionError({ code: "ENOTFOUND" })).toBe(true);
  });

  it("returns false for other codes or non-error values", () => {
    expect(isConnectionError({ code: "ETIMEDOUT" })).toBe(false);
    expect(isConnectionError({})).toBe(false);
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError("ECONNREFUSED")).toBe(false);
  });
});

describe("isConnectionErrorOrAggregate", () => {
  it("returns true when error itself is a connection error", () => {
    expect(isConnectionErrorOrAggregate({ code: "ECONNREFUSED" })).toBe(true);
  });

  it("returns true when any nested error is a connection error", () => {
    const aggregate = {
      errors: [{ code: "ETIMEDOUT" }, { code: "ENOTFOUND" }],
    };
    expect(isConnectionErrorOrAggregate(aggregate)).toBe(true);
  });

  it("returns false when there are no connection errors", () => {
    const aggregate = {
      errors: [{ code: "ETIMEDOUT" }, { code: "EOTHER" }],
    };
    expect(isConnectionErrorOrAggregate(aggregate)).toBe(false);
  });

  it("returns false for non-object or object without errors array", () => {
    expect(isConnectionErrorOrAggregate(null)).toBe(false);
    expect(isConnectionErrorOrAggregate("oops")).toBe(false);
    expect(isConnectionErrorOrAggregate({})).toBe(false);
  });
});

describe("withPrerenderFallback", () => {
  it("returns query result when queryFn resolves", async () => {
    const result = await withPrerenderFallback(() => Promise.resolve(42), 0, "[test] fallback");
    expect(result).toBe(42);
  });

  it("returns fallback and warns when prerender build and connection error", async () => {
    const prev = process.env.IS_PRERENDER_BUILD;
    process.env.IS_PRERENDER_BUILD = "true";
    const err = new Error("Connection refused") as Error & { code?: string };
    err.code = "ECONNREFUSED";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await withPrerenderFallback(
      () => Promise.reject(err),
      null,
      "[test] DB unavailable — returning null."
    );

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[test] DB unavailable — returning null. Reason:")
    );
    warnSpy.mockRestore();
    process.env.IS_PRERENDER_BUILD = prev;
  });

  it("rethrows when not prerender build", async () => {
    const prev = process.env.IS_PRERENDER_BUILD;
    process.env.IS_PRERENDER_BUILD = "false";
    const err = new Error("Connection refused") as Error & { code?: string };
    err.code = "ECONNREFUSED";

    await expect(withPrerenderFallback(() => Promise.reject(err), null, "[test]")).rejects.toThrow(
      "Connection refused"
    );

    process.env.IS_PRERENDER_BUILD = prev;
  });
});
