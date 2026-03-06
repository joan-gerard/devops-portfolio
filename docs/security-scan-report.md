# Security Scan Report – devops-portfolio

_Generated for review. No code changes were made during this scan._

---

## What’s in Good Shape

- **Secrets**: `.env*` is in `.gitignore`; no secrets are committed.
- **Auth**: Credentials are validated against a bcrypt hash; misconfiguration and bcrypt errors are mapped to a generic `SERVICE_UNAVAILABLE` message so server details are not exposed.
- **Database**: `DATABASE_URL` is validated at load time; `ssl: "require"` is used; all SQL uses parameterized queries (postgres.js tagged templates). `handleDbError` maps invalid UUID (e.g. from route `[id]`) to 404 so no internals are leaked.
- **API authorization**: Admin-only mutations (pages, projects, media upload) check session and role; public GETs filter by `published` where needed.
- **Media upload**: Route is auth-protected; file type whitelist (JPEG, PNG, WebP, GIF) and 5 MB limit; unique object keys; R2 credentials from env. R2 env vars are validated before upload (503 if incomplete); `linked_to` is validated as UUID or null; DB insert failure triggers R2 object deletion. See [R2 file upload workflow](r2-file-upload-workflow.md).
- **Dependencies**: Run `pnpm audit` regularly; address any reported vulnerabilities.
- **Frontend**: No `dangerouslySetInnerHTML` in app code; external links that use `target="_blank"` use `rel="noopener noreferrer"`.
- **Protected pages**: Root `proxy.ts` (Next.js 16 Proxy) runs NextAuth `withAuth` for matched admin paths, redirecting unauthenticated requests to login. Admin layout and routes also use `getServerSession(authOptions)` for defence in depth.
- **Login errors**: The client shows only generic messages (“Invalid email or password”, “Sign-in is temporarily unavailable”); no stack traces or config details are leaked.
- **Session**: JWT strategy is used; the email shown on the dashboard is the validated admin email from the provider.

---

## Issues and Recommendations

### 1. **NextAuth middleware not active (medium)** — Addressed

- **Historical issue**: Previously, Next.js only ran edge auth from a root `middleware.ts` (or `src/middleware.ts`). Logic lived in what is now `proxy.ts` but was not invoked because there was no `middleware.ts`, so admin routes were protected only by page-level `getServerSession`.
- **Resolution**: The app now uses the [Next.js 16 Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy). Root `proxy.ts` exports NextAuth’s `withAuth` and a `config.matcher` for the `/admin/*` routes (e.g. `/admin`, `/admin/dashboard/:path*`, `/admin/editor/:path*`, `/admin/roadmap/:path*`, `/admin/notes/:path*`, `/admin/projects/:path*`). Next.js runs `proxy.ts` at the root, so those admin paths are protected at the edge and unauthenticated requests are redirected to `/admin/login`. Page-level `getServerSession` remains as defense-in-depth.

### 2. **NEXTAUTH_SECRET not documented (medium)** — Addressed

- **Where**: NextAuth route and docs.
- **Issue**: NextAuth uses `NEXTAUTH_SECRET` for signing JWTs and cookies. If it’s unset in production, NextAuth may fall back to a weak or default behavior. It’s not mentioned in `docs/authentication.md` or `docs/security.md`.
- **Resolution**: `docs/authentication.md` now lists `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in the environment variables table, with guidance to set both in production (e.g. Vercel). `docs/security.md` already referenced them. Production (Vercel) has been confirmed to have both variables set.

### 3. **No rate limiting on login (medium)** — Addressed

- **Where**: `app/api/auth/[...nextauth]/route.ts` (credentials sign-in).
- **Issue**: The credentials provider had no rate limiting, so an attacker could attempt many passwords against the single admin account.
- **Resolution**: Rate limiting is implemented in the NextAuth credentials `authorize` callback. Client IP is taken from `x-forwarded-for` (trimmed), with fallback to `x-real-ip`, then to the socket address; if the IP cannot be determined it is left `undefined`. `lib/queries/loginAttempts.ts` enforces a 15-minute fixed window with a maximum of 5 attempts per IP. When the IP is unknown (`undefined`), the request is **allowed** and not rate limited, so that all unidentifiable requests are not grouped into a single shared bucket. The `login_attempts` table is created by `migrations/002_login_attempts.sql`. When the limit is exceeded, the user sees a message with the cooldown time in minutes. On successful login, the counter for that IP is cleared (no-op when IP is unknown). Documented in `docs/security.md`.

### 4. **CI build and DATABASE_URL (low)** — Addressed

- **Where**: `.github/workflows/ci.yml` – build step used `DATABASE_URL` from secrets.
- **Issue**: If the Next.js build does not need a real database (e.g. no DB access at build time), requiring a real `DATABASE_URL` in CI increases secret usage and failure surface.
- **Resolution**: The CI build step no longer uses a secret for `DATABASE_URL`. It uses a syntactically valid placeholder (`postgresql://placeholder:placeholder@localhost/placeholder`) because the build does not connect to the database—all routes are dynamic and data is fetched at request time. The workflow comment documents that the real `DATABASE_URL` is only needed at runtime (e.g. Vercel). Other build-time env vars (NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH) are also placeholders in CI.

### 5. **Client-side error message from exceptions (low)** — Addressed

- **Where**: `lib/submitLogin.ts` – `catch` previously used `err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE`.
- **Issue**: Any unexpected exception (e.g. from `signIn`) could expose `err.message` to the client. Right now the server only returns controlled error codes, so this is unlikely but brittle.
- **Resolution**: The `catch` block always returns a generic message (`DEFAULT_ERROR_MESSAGE`) to the user. The real error is logged with `console.error` for debugging; no exception message is ever shown to the user, so future server or client changes cannot accidentally leak internal messages.

### 6. **Media upload – MIME type and file content (medium)**

- **Where**: `app/api/media/route.ts` – validation uses `file.type` (browser-provided) and file extension from `file.name`.
- **Issue**: A malicious client can spoof `Content-Type` and filename; a non-image could be uploaded if only MIME/extension are trusted.
- **Recommendation**: Add server-side validation of file content (e.g. magic-byte checks for JPEG/PNG/WebP/GIF) in addition to type/extension checks.

### 7. **Media upload – `linked_to` not validated (low)** — Addressed

- **Where**: `app/api/media/route.ts` – `formData.get("linked_to")` was passed into the `INSERT` as-is.
- **Issue**: Invalid or arbitrary values could cause Postgres errors (e.g. invalid UUID) and result in a 500 instead of 400.
- **Resolution**: `linked_to` is now validated as a string if present, normalised (empty → null), and checked with a UUID regex before insert; invalid values return 400. See [R2 file upload workflow](r2-file-upload-workflow.md).

### 8. **R2 / media env vars (low)** — Addressed

- **Where**: `lib/r2.ts` and `app/api/media/route.ts` use `process.env.R2_*`.
- **Issue**: If any are missing, the app could throw at runtime when an upload is attempted (no secret leak, but poor fail-fast and UX).
- **Resolution**: The media route now validates all five R2 env vars before upload and returns 503 with a clear message when incomplete. Required variables are documented in [R2 file upload workflow](r2-file-upload-workflow.md#environment-variables-r2).

### 9. **Project URLs – no scheme validation (medium when public)**

- **Where**: `app/api/projects/route.ts` and `app/api/projects/[id]/route.ts` – `github_url` and `live_url` are stored without validation.
- **Issue**: If these are later rendered as `href` on public pages, values like `javascript:...` or `data:...` could lead to XSS or unexpected behavior.
- **Recommendation**: Before storing, validate that URLs use allowed schemes (e.g. `https:` and optionally `http:`). Reject or sanitize others. When rendering, use the same allowlist or a safe link component.

### 10. **Slug format/length not validated (low)**

- **Where**: `POST /api/pages`, `POST /api/projects`, and their PATCH handlers – `slug` is required (for create) but not validated for format or length.
- **Issue**: Very long or odd slugs could cause issues (DB, URLs, or caches). Unlikely to be critical.
- **Recommendation**: Validate slug format (e.g. alphanumeric, hyphens) and max length (e.g. 80–200 chars) and return 400 when invalid.

### 11. **Image upload error message in EditorToolbar (low)**

- **Where**: `components/editor/EditorToolbar.tsx` – `handleImageUpload` uses `alert(err instanceof Error ? err.message : "Upload failed")`.
- **Issue**: Server error messages (e.g. from API JSON) can be shown to the user.
- **Recommendation**: Show a generic message (e.g. "Upload failed") in the UI and log the real error (e.g. via `console.error` or a logging utility).

### 12. **Public note rendering (future)**

- **Where**: The project brief describes public note pages rendered with TipTap's `generateHTML(content)`. There is no public `/notes/[slug]` route in the app yet.
- **Recommendation**: When you add it, use TipTap's `generateHTML` with a strict schema (no raw HTML or custom nodes that allow scripts). Avoid rendering stored content with `dangerouslySetInnerHTML` and no schema.

### 13. **Static HTML in docs (informational)**

- **Where**: `docs/project.brief.html` uses `innerHTML` with a static template string.
- **Issue**: If this file is ever served as part of the app and the content became dynamic, it could introduce XSS. Currently it’s static and in docs.
- **Recommendation**: Keep this file static and out of user-controllable content; if it’s ever served by the app, ensure it’s not fed user input.

---

## Summary Table

| Area                      | Severity | Status / action                                                                  |
| ------------------------- | -------- | -------------------------------------------------------------------------------- |
| Proxy (admin auth)        | Medium   | Addressed – `proxy.ts` active on Next.js 16                                      |
| NEXTAUTH_SECRET           | Medium   | Addressed – documented in auth docs; production (Vercel) set                     |
| Login rate limit          | Medium   | Addressed – IP-based rate limit (5/15 min); documented                           |
| Media MIME / magic bytes  | Medium   | Validate file content server-side                                                |
| Project URL schemes       | Medium   | Validate/sanitize when public links exist                                        |
| CI DATABASE_URL           | Low      | Addressed – placeholder in CI; real URL only at runtime (documented in workflow) |
| Login catch message       | Low      | Addressed – generic message in catch; real error logged only                     |
| Media `linked_to`         | Low      | Addressed – validated as UUID or null in media route; documented                 |
| R2 env vars               | Low      | Addressed – validate in media route before upload; documented                    |
| Slug validation           | Low      | Validate format and length                                                       |
| EditorToolbar alert       | Low      | Use generic message in UI                                                        |
| Dependencies              | —        | Run `pnpm audit` regularly                                                       |
| Secrets / auth / DB / XSS | —        | In good shape for current scope                                                  |
| Public note HTML          | —        | When added, use safe schema for `generateHTML`                                   |

---

## Related Documentation

- [Security](security.md) – General security practices and posture.
- [Authentication](authentication.md) – Auth setup, env vars, and architecture.
