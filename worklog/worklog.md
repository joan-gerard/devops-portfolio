# DevOps Portal — Work Log

_Exported 2026-03-05_

---

## Sessions

### Initialised the Next.js project

_Phase 01 · 2026-03-01T00:00:00.000Z_

Created the app with the App Router, Tailwind CSS, ESLint and Prettier. Commited to GitHub

### Set up Neon / connect postgres.js / write and push first migration

_Phase 01 · 2026-03-01T00:00:00.000Z_

Set up Neon: Created a Neon project, get your connection strin
Connect postgres.js: Created /lib/db.ts with the postgres.js client.
Write your first migration: Created /migrations/001_init.sql with the initial schema: pages, projects, media tables. Ran it against Neon.

### Set up GitHub Actions

_Phase 01 · 2026-03-02T00:00:00.000Z_

Created a basic CI workflow that runs automatically on every push to any branch and every pull request to main. It will run three checks in sequence: install dependencies, lint, and build

### Phase 02: Authentication

_Phase 02 · 2026-03-03T00:00:00.000Z_

Completed full authentication flow for the admin area. Installed NextAuth.js with a credentials provider — no user table, admin credentials stored as environment variables. Password hashed with bcryptjs (cost factor 12) and stored in ADMIN_PASSWORD_HASH. Discovered that bcrypt hashes contain $ characters which the .env.local parser interprets as variable references, truncating the value — fixed by escaping each $ with a backslash.
Built the login page at /(auth)/admin/login with email/password form, error messaging, and loading state. The login page lives in a separate /(auth) route group with a minimal layout — this was necessary after discovering that placing it inside /(admin) caused it to inherit the admin shell layout, triggering an infinite 307 redirect loop for unauthenticated users.
SessionProvider required its own 'use client' wrapper component (AuthSessionProvider) since React Context is unavailable in Server Components. Admin layout at /(admin)/admin/layout.tsx renders this wrapper around all protected pages.
Route protection implemented via proxy.ts at the project root — the Next.js convention for this version of the framework (middleware.ts is deprecated). Uses withAuth from NextAuth with an explicit authorized callback. Login page is deliberately excluded from the matcher to prevent redirect loops.
Added SignOutButton client component in the admin header — calls signOut({ callbackUrl: '/admin/login' }) on click, styled with a red hover state to signal it as a destructive action. Confirmed full auth cycle: login, session persistence on refresh, protected route redirect when logged out, and sign out redirect.

### Projects admin page

_Phase 03 · 2026-03-04T00:00:00.000Z_

Built the full projects admin flow: CreateProjectButton creates a new project and redirects to /admin/projects/[id]. Projects list page at /admin/projects mirrors the notes list with title, tech stack tags, published status, and last updated date. Project edit page split into a server component (page.tsx) and client shell (ProjectEditClient.tsx) with fields for title, slug, description, tech stack, GitHub URL, and live URL. All fields autosave with a 1s debounce. Publish toggle and delete with redirect in the meta bar.

### Editable slug fields

_Phase 03 · 2026-03-04T00:00:00.000Z_

Added editable slug fields to both the notes editor (EditorPageClient.tsx) and the projects editor (ProjectEditClient.tsx). Slug input sanitises on keypress — only a-z, 0-9, and - permitted. An icon from title button regenerates the slug from the current title on demand. A yellow warning appears when editing the slug of a published item. Saves via PATCH with a 1s debounce.

### Phase 03 Step 7 — Cloudflare R2 file uploads

_Phase 03 · 2026-03-05T00:00:00.000Z_

Wired image uploads into the TipTap editor. Created lib/r2.ts with an S3-compatible client using the AWS SDK. Built POST /api/media route handling auth, validation (file type, size, UUID format for linked_to), R2 upload via PutObjectCommand, and media table insert. Added @tiptap/extension-image, updated EditorToolbar.tsx with a hidden file input and upload button pushed to the right of the formatting groups via marginLeft: auto. Images insert inline at cursor position on success. Added position: sticky to the toolbar so it remains visible when scrolling long notes — top set to the admin header height and toolbar z-index set lower than the header to prevent overlap

### Phase 03 Step 7 — Compensating delete on DB insert failure

_Phase 03 · 2026-03-05T00:00:00.000Z_

Added a nested try/catch around the INSERT INTO media in app/api/media/route.ts. If the DB insert fails after a successful R2 upload, a DeleteObjectCommand fires immediately to roll back the R2 object. Rollback failures are logged but do not change the client response — the user always receives { "error": "Upload failed" } with a 500. A Sentry comment is in place for Phase 6 to promote rollback failures to tracked exceptions

## Decisions

### Complete Project Brief

_Phase 00 · 2026-03-01T00:00:00.000Z_

The brief is a vital document that includes many aspects of the project that I want to build before I start my DevOps learning journey. The planning phase, which is now recorded in the project brief, has helped me define the project, ie purpose, core features, tech stack, data modals, code project structure, etc.

### Chose not to use an ORM

_Phase 00 · 2026-03-02T00:00:00.000Z_

Postgres.js chosen over Prisma for raw SQL access. Better learning value, full transparency over queries, closer to how production teams manage schemas, and a stronger talking point in interviews

### Neon: Choose AWS over Azure

_Phase 01 · 2026-03-02T00:00:00.000Z_

Chose AWS eu-west-1 (Ireland) as the Neon cloud provider
AWS chosen over Azure because it's the dominant platform in the DevOps job market, Vercel also runs on AWS which keeps app-to-database latency within the same network, and the ecosystem of tutorials and tooling is more mature for AWS

### Keep GET /api/pages public but filter by published status

_Phase 03 · 2026-03-03T00:00:00.000Z_

Unauthenticated requests return only published = true records. Admin sessions return all records including drafts. Keeps the API simple — no separate public/private endpoints — while ensuring draft content is never exposed to the public portfolio

### Did not implement role-based session checks

_Phase 03 · 2026-03-03T00:00:00.000Z_

Single-user app — there is no mechanism to create a non-admin account. Session existence is sufficient; a valid session already proves the person authenticated with the admin credentials. Revisit if multi-user support is ever needed.

### Moved login page to /(auth) route group

_Phase 03 · 2026-03-03T00:00:00.000Z_

Login page was originally inside /(admin) which caused it to inherit the admin shell layout, triggering a redirect loop. Moving it to a separate /(auth) group with a minimal layout gives it a completely clean render context with no session logic.

### Two-step delete confirmation instead of a modal

_Phase 03 · 2026-03-03T00:00:00.000Z_

Delete flow uses an inline "Sure? / Delete / Cancel" pattern rather than a modal dialog. Keeps the interaction lightweight — no overlay, no focus trap, no additional component. The two-step requirement prevents accidental deletion while staying visually minimal.

### Delete from editor redirects to /admin/notes

_Phase 03 · 2026-03-03T00:00:00.000Z_

DeleteNoteButton accepts an optional redirectTo prop. When used in the editor meta bar it passes /admin/notes, so deletion sends you back to the list rather than trying to refresh a page whose data no longer exists. When used in the notes list it calls router.refresh() instead to update the list in place.

### Tags normalised to lowercase alphanumeric + hyphens only

_Phase 03 · 2026-03-03T00:00:00.000Z_

Tag input strips all characters except a-z, 0-9, and - and lowercases the input before saving. Prevents inconsistent tags like Docker vs docker or ci/cd vs ci-cd from appearing as separate tags in the UI.

### Tags save immediately on each change, not debounced

_Phase 03 · 2026-03-03T00:00:00.000Z_

Unlike title and content which debounce, tag changes (add or remove) save immediately via PATCH. Tags are discrete actions rather than continuous typing, so there's no risk of firing too many requests. Immediate save means the notes list always reflects the current tag state without any delay.

### Server components query lib/queries/ directly, not API routes

_Phase 03 · 2026-03-03T00:00:00.000Z_

Calling fetch('/api/projects') from a server component would be an HTTP request from the server to itself — unnecessary overhead. Server components call query helpers in lib/queries/ directly. API routes exist for browser/client consumers only.

### Slug management - manually controlled after creation

_Phase 03 · 2026-03-04T00:00:00.000Z_

Two options were considered. Option A (auto-update slug with title) was rejected — silently breaking bookmarked URLs when a project is renamed is unacceptable once content is published. Option B (editable slug, pre-filled at creation, manually controlled thereafter) was chosen. This is the pattern used by Notion, Ghost, and most CMSes. A ↺ regenerate button provides convenience without removing control.

### Project edit page uses form fields, not a rich text editor

_Phase 03 · 2026-03-04T00:00:00.000Z_

Notes use TipTap for freeform content. Projects use structured form fields (title, slug, description, tech stack, GitHub URL, live URL) — no rich text editor. Projects are structured data entries, not long-form writing. A textarea for description is sufficient and more appropriate than a block editor for short, factual content.

### Account API Token, not User API Token for R2

_Phase 03 · 2026-03-05T00:00:00.000Z_

R2 credentials are created as an Account API Token scoped to Object Read & Write on one specific bucket. User API tokens are tied to a personal login and have broader scope than needed. Account tokens follow the principle of least privilege — they can only do exactly what the upload route requires and are revocable independently of the user account.

### No IP filtering on R2 API token

_Phase 03 · 2026-03-05T00:00:00.000Z_

Client IP Address Filtering was left empty when creating the R2 API token. Vercel runs on a distributed edge network with no stable IP, and GitHub Actions runners are assigned from a large rotating Azure pool. Whitelisting those would either be impossible to maintain or require ranges so broad the filter provides no real security value. Security is handled at the application layer instead — auth session check before any upload, token stored as an environment variable, never in client code

### Validate all five R2 env vars in the route, not just the two used directly

_Phase 03 · 2026-03-05T00:00:00.000Z_

R2_S3_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are consumed by lib/r2.ts, not app/api/media/route.ts directly. They are validated in the route anyway to surface misconfiguration as a clean 503 rather than an opaque AWS SDK error from inside the client. A comment documents why variables not used in the file are checked there

### Native alert() for upload errors, toast deferred to UI polish

_Phase 03 · 2026-03-05T00:00:00.000Z_

Upload failures surface as a browser native alert() dialog. The page does not crash — the editor remains fully intact and the button resets. A toast notification would be more polished but alert() is functional and the cosmetic improvement is deferred to a later UI polish pass.

### Cron job reporting: three-layer observability

_Phase 03 · 2026-03-05T00:00:00.000Z_

Each media cleanup cron run writes a structured JSON report to the cron_log table (status, duration, pass-by-pass counts, errors array), pipes the same summary to console.log for Vercel log capture, and triggers a Sentry exception on partial or failed status. No notification on clean runs — alert fatigue from successful jobs is counterproductive. A dedicated Observability chapter will be added to the brief in Phase 6 once Sentry, health endpoints, and uptime monitoring are all built.

## Blockers

### psql command not found after installing libpq

_Phase 01 · 2026-03-02T00:00:00.000Z_

Installed libpq via Homebrew but psql wasn't accessible because the binary wasn't in the PATH. Resolved by running brew link --force libpq

### First migration file not executing

_Phase 01 · 2026-03-02T00:00:00.000Z_

psql connected but ignored the -f flag. The backslash line continuation [psql "postgresql://username:password@ep-xxx.eu-west-1.aws.neon.tech/neondb?sslmode=require" \
 -f migrations/001_init.sql] in the terminal caused psql to treat the connection string and the -f migrations/001_init.sql as two separate commands. It connected to Neon successfully but never ran the SQL file. Resolved by running the full command on a single unbroken line

### 307 redirect loop on /admin/login

_Phase 03 · 2026-03-03T00:00:00.000Z_

Login page inherited the admin layout which contained session-checking logic, causing unauthenticated users to be redirected to /admin/login infinitely. Fix: moved login page to /(auth) route group with its own minimal layout.

### postgres.js JSONValue type error on JSONB column

_Phase 03 · 2026-03-03T00:00:00.000Z_

Passing a Record<string, unknown> to sql.json() failed TypeScript compilation because postgres.js's internal JSONValue type is overly strict. Fix: cast to as any at the call site — acceptable since the value is already validated as a non-null object before reaching the query.

### http://localhost:3000/api/projects/non-existent-id returned 500 instead of 404

_Phase 03 · 2026-03-03T00:00:00.000Z_

Passing a non-UUID string to a UUID column causes Postgres to throw error 22P02 (invalid input syntax for type uuid) before it even attempts the query. The error lands in the catch block and was returning 500. Fix: catch 22P02 explicitly in all [id] route handlers and return 404 — consistent with a valid UUID that finds no rows.

### Note and project slugs were never updated after creation

_Phase 03 · 2026-03-04T00:00:00.000Z_

Slugs were generated once at creation as untitled-{timestamp} and never changed, even after renaming the item. The public portfolio URLs would have been permanently broken for any renamed content. Fixed by adding an editable slug field to both editor pages with a sanitised input, debounced save, and a ↺ regenerate button.

### Sticky toolbar appeared above the admin header

_General · 2026-03-05T00:00:00.000Z_

Setting position: sticky; top: 0 on the editor toolbar caused it to overlap the admin header on scroll because top: 0 pinned it to the viewport rather than below the header, and the toolbar's z-index was higher than the header's. Solution: The toolbar is sticky with top: var(--header-height) and zIndex: 8. The fix was to avoid overflow: hidden on the toolbar’s parent and to apply overflow: hidden only to the inner wrapper around EditorContent, so the toolbar can stick to the viewport while the content area still clips with rounded corners.

### R2 upload succeeded but DB insert could fail silently, leaving stranded objects

_Phase 03 · 2026-03-05T00:00:00.000Z_

The original implementation had no handling for the case where PutObjectCommand succeeds but INSERT INTO media throws. The object would land in R2 with no database record, invisible to the cron job's DB-led sweep. Fixed with a compensating DeleteObjectCommand in a nested try/catch around the insert. If the rollback itself also fails, the error is logged and the Phase 6 cron Pass 2 (R2 inventory reconciliation via ListObjectsV2Command) acts as the final safety net.

## Lessons

### SELECT NOW() as a fast db connection test

_Phase 01 · 2026-03-02T00:00:00.000Z_

Rather than building UI to test a database connection, a simple API route that runs SELECT NOW() is the quickest way to confirm everything is wired up. It's fast to write, fast to delete, and gives an immediate pass/fail. Example:
// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
try {
const result = await sql`SELECT NOW() as time`
return NextResponse.json({
success: true,
time: result[0].time
})
} catch (error) {
return NextResponse.json({
success: false,
error: String(error)
}, { status: 500 })
}
}

### Env vars with $ — local vs production

_Phase 02 · 2026-03-02T00:00:00.000Z_

What happened
ADMIN_PASSWORD_HASH (bcrypt, contains $) worked locally only when each $ was escaped as \$ in .env. On Vercel, that same escaped value caused 401 on credential login; removing the backslashes fixed it.
Why

- Local: The shell can interpret .env or how env is loaded, so $ starts variable substitution and mangles the value. Escaping with \$ makes the shell pass a literal $, so the app gets the correct hash.
- Production (e.g. Vercel): Env vars are set in the UI/API and injected into the process with no shell parsing. The value is used literally. If you store \$2a\$10$..., the app receives backslashes as part of the string, so the hash is wrong and auth fails.
  Takeaway
- In hosting dashboards (Vercel, etc.): use the raw value with unescaped $.
- In local .env: use \$ so the shell doesn’t expand $.
- Document this for any env var that contains $ (e.g. bcrypt hashes, secrets with $ in them).

### Always test both the authenticated and unauthenticated paths of API routes

_Phase 03 · 2026-03-03T00:00:00.000Z_

The published/unpublished filter bug would have exposed draft notes in production if it hadn't been caught in review. For any route with conditional auth logic, explicitly test both the authenticated response and the unauthenticated response before moving on.

### Postgres error 22P02 — invalid UUID syntax throws before query execution

_Phase 03 · 2026-03-03T00:00:00.000Z_

If a route receives a string like non-existent-id and passes it to a WHERE id = $1 clause on a UUID column, Postgres doesn't return zero rows — it throws immediately. Always catch 22P02 in [id] route handlers alongside 23505. The pattern applies to every table with a UUID primary key.

### router.refresh() vs router.push() after mutation

_Phase 03 · 2026-03-03T00:00:00.000Z_

router.refresh() re-fetches server component data for the current page without a full navigation — the right choice when you want the list to update in place after a delete. router.push() navigates to a new route — the right choice when the current page's data no longer exists after the mutation (e.g. deleting from the editor). Choosing the wrong one either causes a navigation you didn't want or leaves stale data on screen.

### Tag normalisation should happen at the input layer, not the API layer

_Phase 03 · 2026-03-03T00:00:00.000Z_

Normalising tags (lowercase, strip special characters) in the TagInput component means the API always receives clean data. Doing it only at the API layer would allow the UI to briefly display un-normalised tags before the save response returns. Normalising at input keeps the UI and database consistent at all times.

### Reusable components should be parameterised early, not hardcoded

_Phase 03 · 2026-03-04T00:00:00.000Z_

TagInput was initially built for one specific use case. When the second use case (tech stack on projects) arrived, retrofitting the props was straightforward but could have been avoided by anticipating reuse from the start. Any component that interacts with a specific API endpoint or field name should accept those as props with sensible defaults rather than hardcoding them.

### R2 API token vs Access Key ID / Secret Access Key

_Phase 03 · 2026-03-05T00:00:00.000Z_

The API token created in the Cloudflare dashboard is not what goes in the env file. Creating the token generates a key pair — Access Key ID and Secret Access Key — which are the actual credentials the AWS SDK uses to sign requests. The token itself lives in the Cloudflare dashboard as the parent permission scope. If you need to revoke access, delete the token there and both keys stop working immediately.

### res.json() consumes the response body — parse once, use everywhere

_Phase 03 · 2026-03-05T00:00:00.000Z_

Calling res.json() twice on the same Response object consumes the stream on the first call and throws on the second. Even when the two calls are in separate branches of an if/else and only one fires at runtime, the correct pattern is to parse once into a variable immediately after the fetch resolves and reference that variable in both the error branch and the success branch.

### Compensating actions in distributed operations should be synchronous where possible

_Phase 03 · 2026-03-05T00:00:00.000Z_

When an operation spans two systems (R2 and Postgres), a failure in the second step after the first has already succeeded leaves the systems inconsistent. A synchronous compensating action — issuing a DeleteObjectCommand immediately on DB failure — closes the gap at the source. It should be wrapped in its own try/catch so a failed rollback does not mask the original error. Log rollback failures separately with enough context (bucket, key) for manual recovery or cron cleanup.

### Validate all environment variables at the boundary that uses them

_Phase 03 · 2026-03-05T00:00:00.000Z_

Checking R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in the media route even though they're consumed by lib/r2.ts means a misconfigured deployment surfaces as a 503 with a clear log message rather than an opaque AWS SDK error from deep inside the client. The pattern — validate all config at the entry point, fail fast with a useful message — is more operationally useful than strict separation of concerns in this case.
