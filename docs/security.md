# Security

This document summarizes the project’s security posture and practices.

## Review summary (latest)

- **Secrets**: `.env*` is in `.gitignore`; no secrets are committed. Use `.env.local` for local development and set `DATABASE_URL` (and any other secrets) in your deployment environment.
- **Database**: `lib/db.ts` validates `DATABASE_URL` at load time and uses `ssl: "require"` for the Postgres client. Use parameterized queries (e.g. `sql\`...\${userInput}\`` via postgres.js tagged templates) when you add queries to avoid SQL injection.
- **Dependencies**: Run `pnpm audit` regularly; fix or accept known vulnerabilities.
- **Frontend**: No `dangerouslySetInnerHTML` or other raw HTML injection in app code. External links use `rel="noopener noreferrer"` where appropriate.

## Practices to follow

1. **Never commit** `.env`, `.env.local`, or any file containing secrets.
2. **Use parameterized queries** for any user-supplied or dynamic data in SQL.
3. **Keep dependencies updated** and run `pnpm audit` before releases.
4. **Restrict DB usage to server** (e.g. API routes, Server Components); do not import `lib/db` from client components.

## Reporting issues

If you find a security issue, please report it privately (e.g. via maintainer contact or a private channel) rather than in a public issue.
