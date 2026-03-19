import sql from "@/lib/db";
import { version } from "@/package.json";
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Public — no auth required.
 * Pinged by Better Stack every minute.
 * Runs a live DB connectivity check and returns app version and timestamp.
 * Returns 200 if healthy, 503 if the DB is unreachable.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const dbTimeoutMs = 3000;

  try {
    await Promise.race([
      sql`SELECT 1`,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("DB probe timed out")), dbTimeoutMs);
      }),
    ]);

    return NextResponse.json(
      {
        status: "ok",
        version,
        timestamp,
        db: "ok",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/health] DB check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        version,
        timestamp,
        db: "unreachable",
      },
      { status: 503 }
    );
  }
}
