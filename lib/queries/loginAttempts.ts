import sql from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

/**
 * Atomically check and increment the login attempt count for an IP.
 * Uses INSERT ... ON CONFLICT DO UPDATE to avoid race conditions when
 * concurrent requests from the same IP both try to create the row.
 */
export async function checkRateLimit(
  ip: string | undefined
): Promise<{ allowed: boolean; minutesLeft?: number }> {
  const now = new Date();

  if (!ip) return { allowed: true };

  const windowCutoff = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);

  const [row] = await sql`
    INSERT INTO login_attempts (ip, attempts, window_start)
    VALUES (${ip}, 1, ${now})
    ON CONFLICT (ip) DO UPDATE SET
      attempts = CASE
        WHEN login_attempts.window_start < ${windowCutoff} THEN 1
        WHEN login_attempts.attempts >= ${MAX_ATTEMPTS} THEN login_attempts.attempts
        ELSE login_attempts.attempts + 1
      END,
      window_start = CASE
        WHEN login_attempts.window_start < ${windowCutoff} THEN ${now}
        ELSE login_attempts.window_start
      END
    RETURNING attempts, window_start
  `;

  if (!row) return { allowed: true };

  const windowStart = new Date(row.window_start);
  const minutesElapsed = (now.getTime() - windowStart.getTime()) / 60000;

  if (minutesElapsed >= WINDOW_MINUTES) {
    return { allowed: true };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    const minutesLeft = Math.ceil(WINDOW_MINUTES - minutesElapsed);
    return { allowed: false, minutesLeft };
  }

  return { allowed: true };
}

export async function clearRateLimit(ip: string | undefined): Promise<void> {
  if (!ip) return;
  await sql`
    DELETE FROM login_attempts WHERE ip = ${ip}
  `;
}
