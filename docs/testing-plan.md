# Testing Plan: DevOps Portfolio

This document captures testing opportunities across the app and the current testing setup. The opportunities below are organised by layer and priority so you can add tests incrementally.

---

## Current setup (infrastructure in place)

- **Unit / component tests:** **Vitest** with TypeScript, **React Testing Library**, **jsdom**.
  - Config: `vitest.config.ts` (uses `vite-tsconfig-paths` for `@/` aliases).
  - Setup: `test/setup.ts` (imports `@testing-library/jest-dom`).
  - Helpers: `test/test-utils.tsx` exports a custom `render()` that wraps UI in `AuthSessionProvider` for tests that need session context.
  - Unit tests live next to code (e.g. `lib/validateSlug.test.ts` or `lib/__tests__/validateSlug.test.ts`) or in `__tests__` directories; Vitest runs `**/*.test.{ts,tsx}` and `**/*.spec.{ts,tsx}` and excludes `e2e/`.
- **E2E tests:** **Playwright**.
  - Config: `playwright.config.ts`; tests live in `e2e/`. The config starts the app via `webServer` (e.g. `pnpm dev`) unless you run with an existing server.
  - Install browsers once: `pnpm exec playwright install`.
  - **E2E-only content isolation:** When running e2e against a shared database, the app uses an `E2E_TEST=1` flag and an `e2e_only` column on `pages`/`projects` so that any notes or projects created and published during e2e runs are **hidden from public views** in normal dev/prod.
- **Scripts (in `package.json`):**
  - `pnpm test` — Vitest in watch mode.
  - `pnpm test:run` — Vitest single run.
  - `pnpm test:watch` — Vitest watch (alias for `test`).
  - `pnpm test:ci` — Vitest single run with verbose reporter.
  - `pnpm test:e2e` — Playwright e2e tests.
  - `pnpm test:e2e:ui` — Playwright with UI mode.

---

## 1. Testing Infrastructure (Foundational) — done

- **Unit test runner:** **Vitest** with TypeScript support.
  - **Done:** `vitest.config.ts`, path aliases via `vite-tsconfig-paths`, scripts `test`, `test:run`, `test:watch`, `test:ci`.

- **React Testing Library for components**
  - **Done:** jsdom environment, `test/setup.ts` with `@testing-library/jest-dom`, custom `render()` in `test/test-utils.tsx` wrapping `AuthSessionProvider`.

- **E2E tests (Playwright)**
  - **Done:** `playwright.config.ts`, `e2e/` directory, smoke spec `e2e/smoke.spec.ts`. Run `pnpm exec playwright install` once to install browsers. A Playwright `globalTeardown` (`e2e/global-teardown.ts`) runs after each E2E run to delete any `e2e_only = true` `pages`/`projects` rows so the shared database stays clean.

---

## 2. Domain and Utility Unit Tests (`lib/`)

These are low-friction, high-value tests: pure functions or simple I/O boundaries.

- **Slug validation** – `lib/validateSlug.ts`
  - **What to test**:
    - `normalizeSlug`: trims whitespace and lowercases (e.g. `"  Foo-Bar "` → `"foo-bar"`).
    - `isValidSlug`: valid slugs (`"my-project"`, `"abc123"`), invalid (empty, too long, `"My-Project"`, `"--bad"`, `"bad--slug"`, `"bad slug"`), and non-string values (if you ever call from JS) return `false`.
    - `getSlugValidationError`: correct messages for empty, too long, and bad format.
  - **Why**: This underpins URL and DB safety and is straightforward to test.

- **Slugifying / sanitisation logic** – `lib/slugify.ts` (mentioned in refactoring doc)
  - **What to test** (once consolidated there): converting arbitrary titles to slugs that match the same rules as `isValidSlug`; handling repeated spaces, special characters, and Unicode.
  - **Why**: Prevents drift between displayed slugs and what’s allowed by `validateSlug`.

- **Project URL validation** – `lib/validateProjectUrl.ts`
  - **What to test**: `isAllowedProjectUrlScheme`: accepts `http:` and `https:` URLs; rejects empty, whitespace, non-string, and URLs over max length (2048); rejects disallowed schemes (`javascript:`, `data:`, `file:`); rejects invalid URL strings; trims before parsing. `normalizeProjectUrl`: null/undefined/blank → null; non-blank string trimmed; non-string → null.
  - **Why**: Prevents XSS when project links (e.g. github_url, live_url) are rendered as `href`; security-sensitive.

- **Prerender fallback helpers & DB error utilities** – `lib/db-errors.ts`, `lib/api/postgres-errors.ts`, and the pattern in queries (`getNoteBySlug`, `getAllPublishedNotes`, `getAllPublishedProjects`, `getHomepageData`, `getRoadmapData`).
  - **What to test**: When `IS_PRERENDER_BUILD === "true"` and `isConnectionErrorOrAggregate(error)` is true, those query functions return `null`/`[]`/empty data and log a warning; otherwise they rethrow. Also verify that when `IS_PRERENDER_BUILD === "true"` but the error is not a connection/aggregate error, the original error is still rethrown. This logic is subtle and directly impacts build reliability.

- **Login submission logic** – `lib/submitLogin.ts`
  - **What to test**: When `signIn` returns `{ error: AUTH_ERROR_SERVICE_UNAVAILABLE }`, you map to the friendly “Sign-in is temporarily unavailable…” message; when it returns other `error` values you `decodeURIComponent` them; when no error you return `{ ok: true }`; when `signIn` throws you log and return `{ ok: false, error: DEFAULT_ERROR_MESSAGE }`. Mock `next-auth/react`’s `signIn` in unit tests.
  - **Done:** `lib/__tests__/submitLogin.test.ts` — covers the happy path (`ok: true`), service-unavailable mapping, `decodeURIComponent` fallback, and the thrown-error path (logging via `console.error` and returning the default error message) with Vitest mocks/spies cleaned up via a file-level `afterEach(vi.restoreAllMocks)`.
  - **Why**: Critical auth UX logic that should never throw in the client.

- **R2 / S3 and file validation utilities** – `lib/r2.ts`, `lib/validateFileBytes.ts`
  - **What to test**: File size/byte validations (exact boundary values and failure messages) and any content/type checks if present.
  - **Why**: Easy to regress and can cause user-facing upload errors.

- **Home page constants and selection logic** – `lib/constants/home.ts`, `lib/queries/home.ts`
  - **What to test**: Any logic that selects “featured projects” or “recent notes” (once you confirm contents); ensure correct filtering/sorting and max counts.
  - **Done:** `lib/__tests__/home.test.ts` — constants (TECH_STACK, ROADMAP_PHASES); `getHomepageData()` returns notes and projects from mocked `sql` (and now uses `withPrerenderFallback` for CI build resilience), and the test asserts the actual SQL passed to the mock: notes query includes `WHERE published = true`, `slug != 'about'`, and `LIMIT 3`; projects query includes `WHERE published = true` and `LIMIT 3`.

---

## 3. Data-Access / Integration-Like Tests (`lib/queries/*.ts`) — done

You can test these with either **integration tests** against a test DB or **high-level unit tests with fakes**. Implemented with **mocked `sql`** in `lib/queries/__tests__/`.

- **Page queries** – `lib/queries/page.ts`
  - **Done:** `lib/queries/__tests__/page.test.ts` — `getAllPages` returns what sql returns; `getPageById` returns first row or `null`; `getNoteBySlug` returns note or `null`, and on connection error during prerender returns `null` and logs (otherwise rethrows); `getAllPublishedNotes` same prerender fallback to `[]`.

- **Project queries** – `lib/queries/project.ts`
  - **Done:** `lib/queries/__tests__/project.test.ts` — `getAllProjects`, `getAllPublishedProjects` (with prerender fallback), `getProjectById`, `getProjectBySlug` return expected shapes or `null`; connection-error + prerender returns `[]` for `getAllPublishedProjects`, while non-connection errors are rethrown even during prerender builds.

- **Roadmap queries** – `lib/queries/roadmap.ts`
  - **Done:** `getRoadmapData` uses `withPrerenderFallback` with fallback `{ items: [], edges: [] }` so the roadmap page prerenders in CI without a DB.

- **Auth and login-attempt tracking** – `lib/queries/loginAttempts.ts`, `lib/auth.ts`
  - **Done:** `lib/queries/__tests__/loginAttempts.test.ts` — `checkRateLimit(undefined)` returns `{ allowed: true }` without calling sql; with IP: no record → insert and allow; expired window → reset and allow; within window under limit → increment and allow; at/over limit → `{ allowed: false, minutesLeft }`. `clearRateLimit(undefined)` no-ops; with IP calls sql. (`AUTH_ERROR_SERVICE_UNAVAILABLE` mapping is covered in `lib/__tests__/submitLogin.test.ts`.)
  - **Why**: Security-sensitive and behaviourally complex.

---

## 4. Component & Hook Tests (React / UI-Level)

Use **React Testing Library** (with a `jsdom` environment).

- **Login form flow** – `components/auth/LoginForm.tsx`
  - **Done:** `components/auth/LoginForm.test.tsx` — mocks `submitLogin` and `next/navigation`’s `useRouter`; submitting with valid email/password calls `submitLogin` and redirects to `/admin/dashboard` on `{ ok: true }`; `{ ok: false, error }` surfaces the error message; rejected `submitLogin` shows a fallback error message instead of throwing.
  - **What to extend**: Optionally assert loading/disabled submit state during the request and any client-side validation messages if you add them.
  - **Why**: Critical entry point; tests also lock in the default error copy and redirect path.

- **Delete buttons** – `components/notes/DeleteNoteButton.tsx`, `components/projects/DeleteProjectButton.tsx`
  - **Done:** `components/notes/DeleteNoteButton.test.tsx`, `components/projects/DeleteProjectButton.test.tsx` — initial click opens an accessible modal dialog (`role="dialog"`, "Confirm deletion"); confirm click issues `fetch(DELETE)` to `/api/pages/:id` or `/api/projects/:id` and, depending on props, either calls `router.refresh()` or `router.push(redirectTo)`; cancel click closes the dialog and restores the original delete trigger button.
  - **What to extend**: Add explicit assertions for loading/disabled state on the confirm button during the request and, if you refactor, cover any shared `ConfirmDeleteButton` abstraction.
  - **Why**: Risky actions that must behave exactly; tests now guard both the confirm/cancel UX and the correct routing behaviour.

- **Create buttons** – `components/notes/CreateNoteButton.tsx`, `components/projects/CreateProjectButton.tsx`
  - **Done:** `components/notes/CreateNoteButton.test.tsx`, `components/projects/CreateProjectButton.test.tsx` — clicking the button sends a `POST` to `/api/pages` or `/api/projects` with `{ title: "Untitled …", slug: slugify(title) + "-" + Date.now() }` (both `slugify` and `Date.now` are mocked for determinism); on success, tests assert navigation to `/admin/editor/:id` (notes) or `/admin/projects/:id` (projects); when the request fails (`res.ok === false`), tests verify no navigation occurs.
  - **What to extend**: If you surface an explicit error UI on failure, assert that it appears; when you introduce a shared `useCreateEntity` or `CreateEntityButton`, keep these behaviours covered while pointing the tests at the new abstraction.
  - **Why**: Important admin workflows and a good place for tests once you centralize create logic; current tests protect API contracts, slug generation, and navigation behaviour.

- **Slug fields** – Shared UI: `components/shared/SlugField.tsx`; thin wrappers: `EditorSlugField.tsx`, `ProjectSlugField.tsx`. Sanitisation: `lib/slugify.ts` (`sanitiseSlugForInput`).
  - **Done:** `lib/__tests__/slugify.test.ts` — `sanitiseSlugForInput` lowercases, replaces disallowed chars with hyphens, collapses hyphens. `EditorSlugField.test.tsx` — slug input sanitisation, "↺ from title" calls `onRegenerateFromTitle`, published hint. `ProjectSlugField.test.tsx` — same sanitisation (uses real `sanitiseSlugForInput`, mocked `slugify`); "↺ from title" calls `onChange(slugify(titleForRegenerate))` or `onRegenerateFromTitle`; length limit (≤80); published hint.
  - **Why**: Bridge between user input and `validateSlug`/`slugify`; fragile formatting rules.

- **Save-status meta bars** – `components/editor/EditorMetaBar.tsx`, `components/projects/ProjectEditMetaBar.tsx` and hooks mentioned in doc (`useEditorPage`, `useProjectEdit`)
  - **Done:** `components/editor/EditorMetaBar.test.tsx` — when `saveStatus` is idle the status label is hidden; when saving/saved/error the correct label and colour are shown; Publish/Published button calls `onTogglePublished`; back link to `/admin/notes`. `components/projects/ProjectEditMetaBar.test.tsx` — same for project (statusColour, back to `/admin/projects`). `hooks/useEditorPage.test.ts` — initial state; statusColor/statusLabel map to SaveStatus; debounced title/slug change triggers PATCH after 1s and sets saved/error; togglePublished PATCHes immediately and updates or reverts published. `hooks/useProjectEdit.test.ts` — same pattern for project (fields, handleChange debounce, togglePublished).
  - **Why**: Debounced interactions are prone to race conditions; tests help solidify behaviour and support refactoring toward a shared `useAdminSave` or similar.

- **Public display components** – e.g. `components/public/projects/ProjectCard.tsx`
  - **What to test**: Renders title and description correctly; renders tech stack tags when present; hides tag container when empty; conditionally renders GitHub and Live links only when URLs exist, with correct `href`, `target`, `rel`, `aria-label`; renders Details link with correct `href` (`/projects/${slug}`).
  - **Why**: Simple, stable components; fast tests that protect UI/aria contracts.
  - **Done**: `ProjectCard.test.tsx` covers all of the above (title/description, tech tags, empty tag container, GitHub/Live link presence and attributes, Details link href and aria-label).

- **Public pages layout components** – `NotesPageHeader`, `ProjectsPageHeader`, `NotesEmptyState`, `ProjectsGrid`, `RecentNotesSection`, `FeaturedProjectsSection`, `NoteDetail`, `ProjectDetail`
  - **Done:** Page headers: `NotesPageHeader.test.tsx`, `ProjectsPageHeader.test.tsx` (label, heading, description). Empty/list: `NotesEmptyState.test.tsx` (generic vs tag-specific empty message), `ProjectsGrid.test.tsx` (empty state + card count). Sections: `RecentNotesSection.test.tsx`, `FeaturedProjectsSection.test.tsx` (label, heading, empty message, card count, All notes/projects link). Detail: `NoteDetail.test.tsx` (title, tags, date, back link, empty content), `ProjectDetail.test.tsx` (title, date, back link, description, tech stack, links).
  - **What to extend**: Given props (or data from mocks), they show correct "empty" messaging when lists are empty; render the right number of cards/rows when data is present; show the correct headings and labels.
  - **Why**: Ideal tests to add once you introduce shared components like `PageHeader`, `EmptyState`, `SectionWithGrid`, etc.

---

## 5. End-to-End (E2E) Scenarios — done

Using Playwright after basic tooling is in place.

- **Roadmap (public + admin)**
  - **What to test**:
    - **Public `/roadmap`**: canvas mounts; clicking a node opens the side panel; clicking the same node again closes it; when a node has a linked slug, the side panel shows a “View note/project” action and navigation works.
    - **Admin `/roadmap/edit`**: login required; clicking a node opens the edit side panel; editing title shows “Saved” and persists after refresh; toggling group completion persists after refresh.
  - **Why**: The roadmap is interaction-heavy (React Flow canvas + side panels + API writes). A small number of focused E2E tests catches regressions in React Flow integration, auth, API routes, and DB persistence that unit/component tests can’t fully cover.

- **Public read-only flows**
  - **What to test**: Visit home page and see recent notes and featured projects sections; clicking a project card goes to the project detail page. Visit `/notes`: list of notes appears; clicking a note shows detail; tag filter changes visible notes. 404 / error states behave as intended.
  - **Why**: Core user-facing functionality and good smoke checks for deployments.
  - **Done:** `e2e/public.spec.ts` — home sections, project/note list and detail links, tag filter, 404 for invalid note/project slugs.

- **Authentication flows**
  - **What to test**: Successful login with valid credentials redirects to admin dashboard or intended page; failed login shows error messaging mapped from `submitLogin` (including the service-unavailable case).
  - **Why**: High impact if broken; ensures frontend and backend auth stay compatible.
  - **Done:** `e2e/auth.spec.ts` — failed login shows error; successful login redirects when `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` are set; unauthenticated admin access redirects to login.

- **Admin content lifecycle**
  - **What to test**: Create → Edit → Publish → View flow for notes: use create button, land on edit page, change title/content, auto-save, toggle publish; visit corresponding public URL and confirm visibility. Same for projects, including GitHub/Live links.
  - **Why**: This is the “happy path” for your own workflow.
  - **Done:** `e2e/admin-content.spec.ts` — create note/project → edit → publish → visible on public pages (GitHub/Live links for projects). Requires E2E credentials; skipped when not set.
  - **Note:** The project edit form uses a single debounce timer (`useProjectEdit`). The project test fills each field (title, description, GitHub URL, live URL) and waits for “saving|saved” after each, so every value is persisted. Link assertions are scoped to `main` so they match the project’s links, not the footer. Save and visibility timeouts are set high enough (12s for save status, 10s for public page content, 8s for link assertions) so tests stay stable when the full e2e suite runs under load.

- **Destructive operations**
  - **What to test**: Deleting a note/project: confirm dialog appears; cancel leaves content unchanged; confirm removes item from admin list and public pages.
  - **Why**: Guards against regressions in delete behaviour or route paths.
  - **Done:** `e2e/destructive.spec.ts` — modal confirm dialog ("Confirm deletion"); cancel leaves content; confirm removes from admin and public. Requires E2E credentials; skipped when not set.

**Running E2E:** `pnpm test:e2e` (or `pnpm test:e2e:ui`). Install browsers once: `pnpm exec playwright install`. Admin and destructive specs require `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`; without them those tests are skipped. After the suite finishes, `globalTeardown` runs and deletes any `e2e_only` rows created during the run, guarded by `E2E_TEST=1`/`CI` so it only affects test environments.

If E2E appears stuck (stale `:3001`, PID cleanup, kill/force-kill workflow), see `docs/e2e-troubleshooting.md`.

You don’t need to start `pnpm dev:e2e` yourself for `pnpm test:e2e` to work.

- **A good workflow is:**
  - Keep `pnpm dev` running on port 3000 for manual browsing (default `.next` dist directory).
  - Let Playwright start/stop `pnpm dev:e2e` on port 3001 automatically when you run `pnpm test:e2e` (using a separate `.next-e2e` dist directory so caches and locks do not conflict).

- **How it behaves now (from `next.config.ts` and `playwright.config.ts`):**

  ```ts
  // next.config.ts
  const nextConfig: NextConfig = {
    distDir: process.env.NEXT_DIST_DIR ?? ".next",
  };

  // package.json
  "dev:e2e": "NEXT_DIST_DIR=.next-e2e PORT=3001 E2E_TEST=1 next dev"

  // playwright.config.ts
  webServer: {
    command: "pnpm dev:e2e",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    env: { E2E_TEST: "1" },
  },
  use: {
    baseURL: "http://localhost:3001",
  },
  ```

  - When you run `pnpm test:e2e`:
    - If no server is running on `http://localhost:3001`, Playwright runs `pnpm dev:e2e`, which sets `NEXT_DIST_DIR=.next-e2e PORT=3001 E2E_TEST=1 next dev`.
    - If a `pnpm dev:e2e` is already running on port 3001, Playwright just reuses it (also fine, since that process already has `NEXT_DIST_DIR=.next-e2e` and `E2E_TEST=1`).

### Two dev servers (dev + E2E) architecture

- **Normal dev server:** `pnpm dev`
  - Port: `3000`
  - Env: no `E2E_TEST`, default `NEXT_DIST_DIR` → `.next`
  - Purpose: day-to-day manual testing and development.

- **E2E dev server:** `pnpm dev:e2e`
  - Port: `3001`
  - Env: `E2E_TEST=1`, `NEXT_DIST_DIR=.next-e2e`
  - Purpose: Playwright E2E runs with isolated build artifacts and E2E-only content tagging.
  - **Detail pages:** Note and project detail pages use `revalidate = 3600` (ISR). In development (`next dev`), Next.js renders on-demand and does not cache, so E2E still sees newly published content immediately. (Route segment config must be static, so conditional dynamic/revalidate is not supported.)

- Because the servers use **different ports** and **different dist directories**, they can run concurrently without fighting over `.next/dev/lock` or corrupting each other’s caches. Public read flows during E2E always hit the E2E server (via `baseURL`), while your manual browsing can stay on the normal dev server.

**E2E-only content behaviour (shared DB without staging):**

- **Schema:** A migration adds `e2e_only BOOLEAN NOT NULL DEFAULT FALSE` to both `pages` and `projects`, and to `roadmap_items` so roadmap nodes created during E2E runs can also be hidden outside of E2E.
- **Marking E2E content:** When the app runs with `E2E_TEST=1`, the `POST /api/pages`, `POST /api/projects`, and `POST /api/roadmap` routes insert new rows with `e2e_only = true`. The `PATCH /api/pages/[id]` and `PATCH /api/projects/[id]` routes also set `e2e_only = true` when a request (in E2E mode) publishes an entity (`published` explicitly `true` in the body).
- **Public queries:** All public-facing queries (`getNoteBySlug`, `getAllPublishedNotes`, `getAllPublishedProjects`, `getProjectBySlug`, `getHomepageData`, and `getRoadmapData`) add `AND e2e_only = false` (or an equivalent `WHERE` clause) to their `WHERE` clauses **unless** `E2E_TEST=1`. In E2E mode the filter is omitted so tests can assert that freshly created notes/projects/roadmap nodes are visible on `/notes/:slug`, `/projects/:slug`, `/roadmap`, and in listings.
- **Public API GETs:** Unauthenticated `GET /api/pages`, `GET /api/projects`, `GET /api/pages/[id]`, `GET /api/projects/[id]`, and `GET /api/roadmap` also exclude `e2e_only` rows when not in E2E mode, so API consumers never see test content in normal dev/prod.
- **Implication:** You can safely run Playwright E2E against the live database (shared with prod) without polluting real public views; any “E2E Note …”, “E2E Project …”, or “E2E Roadmap …” entities that were created and published during tests are effectively hidden outside of E2E runs.

**E2E project layout (playwright.config.ts):** Auth, public, and smoke specs run in parallel (`chromium` / `firefox` projects with default workers). Admin-content and destructive specs run in a single admin project (`chromium-admin`) with `workers: 1` and a `dependency` on the base Chromium project, so they run after the parallel suite and avoid cross-browser data races against shared admin state.

---

## 6. Regression Tests Around Refactors in `refactoring-review.md`

Your refactoring doc already identifies shared abstractions; you can use tests to **lock in behaviour before refactoring**:

- **Before refactor, add tests for current behaviour** of: delete buttons, create buttons, meta bars, back links, empty states, section layouts, page containers, and link-pill styling.
- **Then refactor**, keeping tests green.
- This ensures the new `FormField`, `SlugField`, `EditMetaBar`, `BackLink`, `EmptyState`, `SectionWithGrid`, and design tokens behave identically from the user’s perspective.

You could also **update/add documentation** (e.g. in this file or a short “Testing strategy” section) to capture: chosen test stack (Vitest/Jest, React Testing Library, Playwright), the tiers above (utilities → queries → components → e2e), and conventions for where tests live (e.g. `__tests__` folders vs `*.test.tsx` next to code).

---

_Generated from a full app review focused on testing opportunities. Update this document as tests are added or priorities change._
