import { isConnectionError, isConnectionErrorOrAggregate } from "../db-errors";

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
