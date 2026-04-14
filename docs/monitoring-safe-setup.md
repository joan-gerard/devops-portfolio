# Safe Monitoring Setup

This guide documents a monitoring setup for `devops-portfolio` that keeps reliability high without accidentally burning Neon compute.

## Goal

- Detect real outages quickly.
- Avoid keeping Neon compute warm 24/7 with unnecessary probes.
- Keep alerts actionable (low noise, clear ownership).

## Why the Current Pattern Is Risky

`app/api/health/route.ts` currently runs a live DB probe (`SELECT 1`) and is intended to be hit every minute.

When an external monitor checks this endpoint every 60 seconds, Neon compute can stay continuously active. On usage-based plans, that can consume monthly CU-hours much faster than expected.

## Recommended Monitoring Model

Use two health endpoints with different purposes:

1. App liveness/readiness (high frequency, no DB)
2. Database connectivity (low frequency, with DB)

This split gives fast incident detection without continuous database wake-ups.

## Endpoint Design

### 1) `/api/health` (public, high-frequency)

Use for uptime checks every 1 minute.

Should verify:

- HTTP stack is up.
- App process can serve requests.
- Basic metadata (timestamp, version).

Should not do:

- Any database query.
- Any network calls to backing services.

Expected status:

- `200` when app is up.
- `503` only for true app-level failure.

### 2) `/api/health/db` (restricted, low-frequency)

Use for dependency checks every 10-15 minutes (or on-demand during incidents).

Should verify:

- Database connectivity with a lightweight query (`SELECT 1`).
- Timeout guard (for example 2-3 seconds).

Should be protected by one of:

- Secret header/token.
- IP allowlist.
- Internal-only monitor target.

Expected status:

- `200` when DB is reachable.
- `503` when DB check fails or times out.

## Suggested Probe Intervals

- **Uptime probe (`/api/health`)**: every 60 seconds.
- **DB probe (`/api/health/db`)**: every 10-15 minutes.
- **Optional synthetic user flow** (home page fetch, auth page load): every 5-10 minutes.

This keeps fast visibility for full outages while reducing DB keepalive pressure.

## Alerting Rules (Practical Defaults)

### Uptime alert (critical)

- Trigger if 3 consecutive failures at 1-minute interval.
- Notify immediately (PagerDuty/Slack critical channel).

### DB dependency alert (high)

- Trigger if 2 consecutive failures at 10-15 minute interval.
- Notify app owner Slack channel.
- Include last status code and timeout/error message.

### Recovery notifications

- Send auto-resolved alert when checks recover.
- Include outage duration in resolution message.

## Neon Compute Guardrails

- Keep autosuspend enabled (do not configure synthetic checks that prevent idle).
- Avoid minute-level DB probes from public uptime tools.
- Review Neon metrics weekly:
  - CU-hours trend (month-to-date).
  - Active compute time.
  - Query volume spikes.
- Set internal budget thresholds:
  - 50% monthly CU by day 15 -> review traffic and probes.
  - 75% monthly CU by day 20 -> reduce non-essential checks immediately.

## Operational Runbook

When an alert fires:

1. Check if it is app-only (`/api/health`) or dependency-specific (`/api/health/db`).
2. If DB-only, inspect Neon status/metrics before restarting app services.
3. Check recent deploys and Vercel logs for correlated errors.
4. If needed, temporarily increase DB probe frequency during active incident response.
5. After recovery, return probes to baseline intervals.

## Implementation Checklist

- [ ] Keep `/api/health` lightweight and DB-free.
- [ ] Introduce `/api/health/db` for low-frequency DB checks.
- [ ] Restrict `/api/health/db` access (token or allowlist).
- [ ] Update monitor definitions in Better Stack.
- [ ] Add alert routes/channels and escalation policy.
- [ ] Document owner and response expectations.
- [ ] Review CU-hour usage after one full week.

## Notes for This Repo

- `app/api/health/route.ts` currently includes a DB probe and is documented as being pinged every minute.
- For Neon cost control, move that DB probe logic to a separate low-frequency endpoint and keep `/api/health` app-only.
