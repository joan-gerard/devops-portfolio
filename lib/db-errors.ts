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
 * Returns true if the error is a connection error, or an AggregateError that
 * contains at least one connection error. Use in catch blocks for DB calls
 * that may run during static generation (e.g. when DB is unavailable in CI).
 */
export function isConnectionErrorOrAggregate(error: unknown): boolean {
  if (isConnectionError(error)) return true;
  const agg = error as { errors?: unknown[] };
  return Array.isArray(agg.errors) && agg.errors.some(isConnectionError);
}
