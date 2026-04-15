import { version } from "@/package.json";
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Public — no auth required.
 * Pinged by Better Stack every minute.
 * App-level liveness only (no backing service probes).
 * Returns 200 when the app process can respond.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  return NextResponse.json(
    {
      status: "ok",
      version,
      timestamp,
      checks: {
        app: "ok",
      },
    },
    { status: 200 }
  );
}
