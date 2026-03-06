import sql from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(
  ip: string | undefined
): Promise<{ allowed: boolean; minutesLeft?: number }> {
  const now = new Date();

  // If IP cannot be determined, allow the request — do not rate limit
  // an unknown key as it would create a shared bucket across all
  // unidentifiable requests
  if (!ip) return { allowed: true };

  // Note: this is a read-then-write pattern and is not atomic under concurrency.
  // Simultaneous requests from the same IP could both pass the limit check before
  // either increments the counter. Acceptable for a single-admin app where
  // concurrent login attempts from the same IP are not a realistic threat.
  const [record] = await sql`
    SELECT attempts, window_start
    FROM login_attempts
    WHERE ip = ${ip}
  `;

  if (!record) {
    await sql`
      INSERT INTO login_attempts (ip, attempts, window_start)
      VALUES (${ip}, 1, ${now})
    `;
    return { allowed: true };
  }

  const windowStart = new Date(record.window_start);
  const minutesElapsed = (now.getTime() - windowStart.getTime()) / 60000;

  if (minutesElapsed >= WINDOW_MINUTES) {
    // Window expired — reset
    await sql`
      UPDATE login_attempts
      SET attempts = 1, window_start = ${now}
      WHERE ip = ${ip}
    `;
    return { allowed: true };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const minutesLeft = Math.ceil(WINDOW_MINUTES - minutesElapsed);
    return { allowed: false, minutesLeft };
  }

  // Within window, under limit — increment
  await sql`
    UPDATE login_attempts
    SET attempts = attempts + 1
    WHERE ip = ${ip}
  `;
  return { allowed: true };
}

export async function clearRateLimit(ip: string | undefined): Promise<void> {
  if (!ip) return;
  await sql`
    DELETE FROM login_attempts WHERE ip = ${ip}
  `;
}
