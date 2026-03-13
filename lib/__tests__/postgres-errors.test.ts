import { NextResponse } from "next/server";
import { getPostgresErrorCode, handleDbError } from "../api/postgres-errors";

// Helper to extract JSON body and status from NextResponse in tests
async function responseJson(res: NextResponse) {
  return {
    status: res.status,
    json: await res.json(),
  };
}

describe("getPostgresErrorCode", () => {
  it("returns the code when present on the error object", () => {
    expect(getPostgresErrorCode({ code: "22P02" })).toBe("22P02");
  });

  it("returns undefined when code is missing or error is not an object", () => {
    expect(getPostgresErrorCode({})).toBeUndefined();
    expect(getPostgresErrorCode(null)).toBeUndefined();
    expect(getPostgresErrorCode("boom")).toBeUndefined();
  });
});

describe("handleDbError", () => {
  const baseOptions = {
    logLabel: "TEST",
    notFoundMessage: "Not found",
    serverErrorMessage: "Server error",
  } as const;

  it("returns 404 with notFoundMessage for 22P02 errors", async () => {
    const res = handleDbError({ code: "22P02" }, baseOptions);
    const data = await responseJson(res);

    expect(data.status).toBe(404);
    expect(data.json).toEqual({ error: "Not found" });
  });

  it("returns 409 with conflictMessage for 23505 errors when conflictMessage is provided", async () => {
    const res = handleDbError({ code: "23505" }, { ...baseOptions, conflictMessage: "Conflict" });
    const data = await responseJson(res);

    expect(data.status).toBe(409);
    expect(data.json).toEqual({ error: "Conflict" });
  });

  it("falls back to 500 when code is unhandled or conflictMessage is missing", async () => {
    const resUnhandled = handleDbError({ code: "OTHER" }, baseOptions);
    const unhandledData = await responseJson(resUnhandled);

    expect(unhandledData.status).toBe(500);
    expect(unhandledData.json).toEqual({ error: "Server error" });

    const resNoConflictMessage = handleDbError({ code: "23505" }, baseOptions);
    const noConflictData = await responseJson(resNoConflictMessage);

    expect(noConflictData.status).toBe(500);
    expect(noConflictData.json).toEqual({ error: "Server error" });
  });
});
