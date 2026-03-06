# Security

This document summarizes the project’s security posture and practices.

## Review summary (latest)

- **Secrets**: `.env*` is in `.gitignore`; no secrets are committed. Use `.env.local` for local development and set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXTAUTH_SECRET`, and (if using media upload) `R2_*` vars in your deployment environment. See [security-scan-report.md](security-scan-report.md) for the full list of env-related recommendations.
- **Admin auth**: Admin sign-in uses NextAuth with a credentials provider; the password is stored as a bcrypt hash in `ADMIN_PASSWORD_HASH`. API routes that perform or expose privileged actions require an authenticated session (session existence check via `getServerSession`); role-based checks are not used in this single-admin app. Misconfiguration and bcrypt errors are handled with a generic “Sign-in is temporarily unavailable” message so no server details are exposed. **Set `NEXTAUTH_SECRET`** in production for secure JWT/cookie signing. **Login rate limiting**: Sign-in attempts are limited by client IP to 5 attempts per 15-minute window. IP is taken from `x-forwarded-for` (trimmed), with fallback to `x-real-ip`; when IP cannot be determined, the request is allowed and not rate limited (to avoid a single shared bucket for all unidentifiable clients). The limit is cleared on successful login for that IP. See [Authentication](authentication.md) for full details.
- **Database**: `lib/db.ts` validates `DATABASE_URL` at load time and uses `ssl: "require"` for the Postgres client. Use parameterized queries (e.g. `sql\`...\${userInput}\`` via postgres.js tagged templates) when you add queries to avoid SQL injection.
- **Media upload**: `/api/media` is auth-protected; file type whitelist and size limit apply. Validate file content (e.g. magic bytes) server-side where possible; validate `linked_to` as UUID or null. R2 env vars are validated before upload and missing config returns 503. See [R2 file upload workflow](r2-file-upload-workflow.md) for details.
- **Project URLs**: `github_url` and `live_url` are validated before store in `lib/validateProjectUrl.ts` (allowed schemes: `https:` and `http:`). POST/PATCH project APIs reject invalid schemes with 400.
- **Slugs**: Project and page slugs are validated in `lib/validateSlug.ts` (lowercase alphanumeric and hyphens, max 200 chars). POST/PATCH for projects and pages reject invalid slugs with 400.
- **Dependencies**: Run `pnpm audit` regularly; fix or accept known vulnerabilities.
- **Frontend**: No `dangerouslySetInnerHTML` or other raw HTML injection in app code. External links use `rel="noopener noreferrer"` where appropriate. When adding public note rendering, use TipTap's `generateHTML` with a strict schema.

## Practices to follow

1. **Never commit** `.env`, `.env.local`, or any file containing secrets.
2. **Use parameterized queries** for any user-supplied or dynamic data in SQL.
3. **Keep admin credentials in env only**: Store `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in environment variables; generate the hash with bcrypt (e.g. 10 rounds) and never commit it.
4. **Set `NEXTAUTH_SECRET`** (and `NEXTAUTH_URL` where applicable) in production for NextAuth.
5. **Keep dependencies updated** and run `pnpm audit` before releases.
6. **Restrict DB usage to server** (e.g. API routes, Server Components); do not import `lib/db` from client components.
7. **Login rate limiting** is implemented: 5 attempts per IP per 15-minute window via `lib/queries/loginAttempts.ts` and the `login_attempts` table; when IP cannot be determined (e.g. missing headers), the request is allowed and not rate limited. Ensure the migration is applied in deployed environments.
8. **Validate uploads and stored URLs**: Use server-side checks (e.g. magic bytes for images); validate project URLs' scheme and media `linked_to` (UUID or null).

## Security scan report

A detailed security scan report (findings and recommendations, no code changes) is in [security-scan-report.md](security-scan-report.md). Review it periodically and address items as needed.

## Reporting issues

If you find a security issue, please report it privately (e.g. via maintainer contact or a private channel) rather than in a public issue.
