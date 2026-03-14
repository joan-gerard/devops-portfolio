/**
 * Returns true if the given value is an error indicating the database (or other
 * service) was unreachable (e.g. ECONNREFUSED during static build when DB is not available).
 * Use when you want to fall back to empty data instead of failing the request or build.
 */
export function isConnectionError(e: unknown): boolean {
  const code =
    typeof e === "object" && e !== null && "code" in e
      ? (e as NodeJS.ErrnoException).code
      : undefined;
  return code === "ECONNREFUSED" || code === "ENOTFOUND";
}

/**
 * Returns true if the error is a connection error, or an object with an
 * `errors` array (e.g. AggregateError) that contains at least one connection
 * error. Use in catch blocks for DB calls that may run during static
 * generation (e.g. when DB is unavailable in CI).
 */
export function isConnectionErrorOrAggregate(error: unknown): boolean {
  if (isConnectionError(error)) return true;
  if (typeof error !== "object" || error === null || !("errors" in error)) {
    return false;
  }
  const { errors } = error as { errors?: unknown[] };
  return Array.isArray(errors) && errors.some(isConnectionError);
}

/**
 * Runs a query function and, during prerender builds, returns a fallback
 * if the database is unavailable (connection or aggregate error) instead of
 * failing the build. Use for public data queries that run at build time.
 *
 * @param queryFn - Async function that performs the query (e.g. sql`...`)
 * @param fallback - Value to return when DB is unavailable during prerender
 * @param logContext - Message for console.warn (e.g. "[getNoteBySlug] DB unavailable during prerender — returning null.")
 */
export async function withPrerenderFallback<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  logContext: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    const isPrerenderBuild = process.env.IS_PRERENDER_BUILD === "true";
    if (isPrerenderBuild && isConnectionErrorOrAggregate(error)) {
      const summary =
        error instanceof Error ? error.message.slice(0, 120) : String(error).slice(0, 120);
      console.warn(`${logContext} Reason: ${summary}`);
      return fallback;
    }
    throw error;
  }
}
