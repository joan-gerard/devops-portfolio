# Security Scan Report – devops-portfolio

_Generated for review. No code changes were made during this scan._

---

## What’s in Good Shape

- **Secrets**: `.env*` is in `.gitignore`; no secrets are committed.
- **Auth**: Credentials are validated against a bcrypt hash; misconfiguration and bcrypt errors are mapped to a generic `SERVICE_UNAVAILABLE` message so server details are not exposed.
- **Database**: `DATABASE_URL` is validated at load time; `ssl: "require"` is used; no raw user input is concatenated into SQL (no custom DB queries in app code yet).
- **Dependencies**: `pnpm audit` reports no known vulnerabilities.
- **Frontend**: No `dangerouslySetInnerHTML` in app code; external links that use `target="_blank"` use `rel="noopener noreferrer"`.
- **Protected pages**: Dashboard and login page both use `getServerSession(authOptions)` and redirect appropriately.
- **Login errors**: The client shows only generic messages (“Invalid email or password”, “Sign-in is temporarily unavailable”); no stack traces or config details are leaked.
- **Session**: JWT strategy is used; the email shown on the dashboard is the validated admin email from the provider.

---

## Issues and Recommendations

### 1. **NextAuth middleware not active (medium)**

- **Where**: `proxy.ts` exports NextAuth middleware and a `config.matcher` for `/admin/dashboard`, `/admin/editor`, `/admin/roadmap`.
- **Issue**: Next.js only runs middleware from a root `middleware.ts` (or `src/middleware.ts`). There is no `middleware.ts` that uses this, so the middleware in `proxy.ts` is never run.
- **Impact**: Protection relies entirely on each page calling `getServerSession` and redirecting. If a new admin route is added and the developer forgets the session check, it could be accessible without auth.
- **Recommendation**: Add a root `middleware.ts` that imports and invokes the middleware from `proxy.ts` (and re-exports its `config`), so all matched admin paths are protected at the edge. Alternatively, document that every new admin route must perform a session check and that `proxy.ts` is currently unused.

### 2. **NEXTAUTH_SECRET not documented (medium)**

- **Where**: NextAuth route and docs.
- **Issue**: NextAuth uses `NEXTAUTH_SECRET` for signing JWTs and cookies. If it’s unset in production, NextAuth may fall back to a weak or default behavior. It’s not mentioned in `docs/authentication.md` or `docs/security.md`.
- **Recommendation**: In `docs/authentication.md` (and optionally `docs/security.md`), document that `NEXTAUTH_SECRET` must be set in production (e.g. a long random string) and that `NEXTAUTH_URL` should be set to the canonical app URL when applicable.

### 3. **No rate limiting on login (medium)**

- **Where**: `app/api/auth/[...nextauth]/route.ts` (credentials sign-in).
- **Issue**: The credentials provider has no rate limiting, so an attacker can attempt many passwords against the single admin account.
- **Recommendation**: Add rate limiting for sign-in attempts (e.g. by IP or by email) at the edge or in a wrapper around the NextAuth route), and document it in `docs/security.md`.

### 4. **CI build and DATABASE_URL (low)**

- **Where**: `.github/workflows/ci.yml` – build step uses `DATABASE_URL` from secrets.
- **Issue**: If the Next.js build does not need a real database (e.g. no DB access at build time), requiring a real `DATABASE_URL` in CI increases secret usage and failure surface.
- **Recommendation**: If build does not need DB, consider using a placeholder URL for the build step and document that real `DATABASE_URL` is only for runtime. If build does need DB, current setup is acceptable; just ensure the secret is restricted to what’s needed.

### 5. **Client-side error message from exceptions (low)**

- **Where**: `lib/login.ts` – `catch` uses `err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE`.
- **Issue**: Any unexpected exception (e.g. from `signIn`) could expose `err.message` to the client. Right now the server only returns controlled error codes, so this is unlikely but brittle.
- **Recommendation**: In the `catch` block, always return a generic message (e.g. `DEFAULT_ERROR_MESSAGE`) for the user and log `err` server-side if needed, so future server changes cannot accidentally leak internal messages.

### 6. **Static HTML in docs (informational)**

- **Where**: `docs/project.brief.html` uses `innerHTML` with a static template string.
- **Issue**: If this file is ever served as part of the app and the content became dynamic, it could introduce XSS. Currently it’s static and in docs.
- **Recommendation**: Keep this file static and out of user-controllable content; if it’s ever served by the app, ensure it’s not fed user input.

---

## Summary Table

| Area                      | Severity | Status / action                                    |
| ------------------------- | -------- | -------------------------------------------------- |
| Middleware                | Medium   | Not active; add `middleware.ts` or document intent |
| NEXTAUTH_SECRET           | Medium   | Document as required in production                 |
| Login rate limit          | Medium   | Add and document rate limiting                     |
| CI DATABASE_URL           | Low      | Use placeholder if build doesn’t need DB           |
| Login catch message       | Low      | Always show generic message in catch               |
| Dependencies              | —        | No known vulnerabilities                           |
| Secrets / auth / DB / XSS | —        | In good shape for current scope                    |

---

## Related Documentation

- [Security](security.md) – General security practices and posture.
- [Authentication](authentication.md) – Auth setup, env vars, and architecture.
