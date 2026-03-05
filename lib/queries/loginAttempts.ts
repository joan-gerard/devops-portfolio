import sql from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; minutesLeft?: number }> {
  const now = new Date();

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

export async function clearRateLimit(ip: string): Promise<void> {
  await sql`
    DELETE FROM login_attempts WHERE ip = ${ip}
  `;
}
