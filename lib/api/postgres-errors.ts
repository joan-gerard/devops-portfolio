import { NextResponse } from "next/server";

/**
 * Extracts the PostgreSQL error code from an unknown error, if present.
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export function getPostgresErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: string }).code;
  }
  return undefined;
}

export type DbErrorHandlerOptions = {
  /** Label for console.error (e.g. "GET /api/pages/[id]") */
  logLabel: string;
  /** Message for 404 when code is 22P02 (invalid UUID / not found) */
  notFoundMessage: string;
  /** Message for 409 when code is 23505 (unique violation); omit for GET/DELETE */
  conflictMessage?: string;
  /** Message for 500 fallback */
  serverErrorMessage: string;
};

/**
 * Handles common Postgres errors (invalid UUID, unique violation) and returns
 * the appropriate NextResponse. Use in catch blocks of API routes that use sql.
 */
export function handleDbError(error: unknown, options: DbErrorHandlerOptions): NextResponse {
  const code = getPostgresErrorCode(error);

  if (code === "22P02") {
    return NextResponse.json({ error: options.notFoundMessage }, { status: 404 });
  }
  if (code === "23505" && options.conflictMessage) {
    return NextResponse.json({ error: options.conflictMessage }, { status: 409 });
  }

  console.error(`${options.logLabel} error:`, error);
  return NextResponse.json({ error: options.serverErrorMessage }, { status: 500 });
}
