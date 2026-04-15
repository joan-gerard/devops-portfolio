import sql from "@/lib/db";
import { version } from "@/package.json";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * GET /api/health/db
 * Restricted DB connectivity check for low-frequency monitoring.
 *
 * Access is guarded with the `x-monitor-token` header and
 * `HEALTH_DB_MONITOR_TOKEN` environment variable.
 */
export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 3000;
const MONITOR_TOKEN_HEADER = "x-monitor-token";

function isAuthorised(request: Request): boolean {
  const expectedToken = process.env.HEALTH_DB_MONITOR_TOKEN;
  if (!expectedToken || expectedToken.trim() === "") {
    // Fail closed if token is not configured.
    return false;
  }

  const incomingToken = request.headers.get(MONITOR_TOKEN_HEADER);
  if (!incomingToken) return false;

  const incomingBuffer = Buffer.from(incomingToken, "utf8");
  const expectedBuffer = Buffer.from(expectedToken, "utf8");

  if (incomingBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(incomingBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  if (!isAuthorised(request)) {
    return NextResponse.json(
      {
        status: "error",
        version,
        timestamp,
        error: "Unauthorised",
      },
      { status: 401 }
    );
  }

  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        sql`SELECT 1`,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("DB probe timed out")), DB_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }

    return NextResponse.json(
      {
        status: "ok",
        version,
        timestamp,
        checks: {
          db: "ok",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/health/db] DB check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        version,
        timestamp,
        checks: {
          db: "unreachable",
        },
      },
      { status: 503 }
    );
  }
}
