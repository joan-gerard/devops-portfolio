# Security

This document summarizes the project’s security posture and practices.

## Review summary (latest)

- **Secrets**: `.env*` is in `.gitignore`; no secrets are committed. Use `.env.local` for local development and set `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH` (and any other secrets) in your deployment environment.
- **Admin auth**: Admin sign-in uses NextAuth with a credentials provider; the password is stored as a bcrypt hash in `ADMIN_PASSWORD_HASH`. The session includes a `role: "admin"` and API routes that perform or expose admin-only actions require `session.user.role === "admin"`. Misconfiguration and bcrypt errors are handled with a generic “Sign-in is temporarily unavailable” message so no server details are exposed. See [Authentication](authentication.md) for full details.
- **Database**: `lib/db.ts` validates `DATABASE_URL` at load time and uses `ssl: "require"` for the Postgres client. Use parameterized queries (e.g. `sql\`...\${userInput}\`` via postgres.js tagged templates) when you add queries to avoid SQL injection.
- **Dependencies**: Run `pnpm audit` regularly; fix or accept known vulnerabilities.
- **Frontend**: No `dangerouslySetInnerHTML` or other raw HTML injection in app code. External links use `rel="noopener noreferrer"` where appropriate.

## Practices to follow

1. **Never commit** `.env`, `.env.local`, or any file containing secrets.
2. **Use parameterized queries** for any user-supplied or dynamic data in SQL.
3. **Keep admin credentials in env only**: Store `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in environment variables; generate the hash with bcrypt (e.g. 10 rounds) and never commit it.
4. **Keep dependencies updated** and run `pnpm audit` before releases.
5. **Restrict DB usage to server** (e.g. API routes, Server Components); do not import `lib/db` from client components.

## Security scan report

A detailed security scan report (findings and recommendations, no code changes) is in [security-scan-report.md](security-scan-report.md). Review it periodically and address items as needed.

## Reporting issues

If you find a security issue, please report it privately (e.g. via maintainer contact or a private channel) rather than in a public issue.
