# DevOps Portal — Work Log

_Exported 2026-03-04_

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
