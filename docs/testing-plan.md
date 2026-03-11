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
  - **Done:** `playwright.config.ts`, `e2e/` directory, smoke spec `e2e/smoke.spec.ts`. Run `pnpm exec playwright install` once to install browsers.

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

- **Prerender fallback helpers & DB error utilities** – `lib/db-errors.ts`, `lib/api/postgres-errors.ts`, and the pattern in queries (`getNoteBySlug`, `getAllPublishedNotes`, `getAllPublishedProjects`).
  - **What to test**: When `IS_PRERENDER_BUILD === "true"` and `isConnectionErrorOrAggregate(error)` is true, the three query functions return `null`/`[]` and log a warning; otherwise they rethrow. Also verify that when `IS_PRERENDER_BUILD === "true"` but the error is not a connection/aggregate error, the original error is still rethrown. This logic is subtle and directly impacts build reliability; tests can drive the suggested `withPrerenderFallback` refactor from your doc.

- **Login submission logic** – `lib/submitLogin.ts`
  - **What to test**: When `signIn` returns `{ error: AUTH_ERROR_SERVICE_UNAVAILABLE }`, you map to the friendly “Sign-in is temporarily unavailable…” message; when it returns other `error` values you `decodeURIComponent` them; when no error you return `{ ok: true }`; when `signIn` throws you log and return `{ ok: false, error: DEFAULT_ERROR_MESSAGE }`. Mock `next-auth/react`’s `signIn` in unit tests.
  - **Done:** `lib/__tests__/submitLogin.test.ts` — covers the happy path (`ok: true`), service-unavailable mapping, `decodeURIComponent` fallback, and the thrown-error path (logging via `console.error` and returning the default error message) with Vitest mocks/spies cleaned up via a file-level `afterEach(vi.restoreAllMocks)`.
  - **Why**: Critical auth UX logic that should never throw in the client.

- **R2 / S3 and file validation utilities** – `lib/r2.ts`, `lib/validateFileBytes.ts`
  - **What to test**: File size/byte validations (exact boundary values and failure messages) and any content/type checks if present.
  - **Why**: Easy to regress and can cause user-facing upload errors.

- **Home page constants and selection logic** – `lib/constants/home.ts`, `lib/queries/home.ts`
  - **What to test**: Any logic that selects “featured projects” or “recent notes” (once you confirm contents); ensure correct filtering/sorting and max counts.
  - **Done:** `lib/__tests__/home.test.ts` — constants (TECH_STACK, ROADMAP_PHASES); `getHomepageData()` returns notes and projects from mocked `sql`, and the test asserts the actual SQL passed to the mock: notes query includes `WHERE published = true`, `slug != 'about'`, and `LIMIT 3`; projects query includes `WHERE published = true` and `LIMIT 3`.

---

## 3. Data-Access / Integration-Like Tests (`lib/queries/*.ts`) — done

You can test these with either **integration tests** against a test DB or **high-level unit tests with fakes**. Implemented with **mocked `sql`** in `lib/queries/__tests__/`.

- **Page queries** – `lib/queries/page.ts`
  - **Done:** `lib/queries/__tests__/page.test.ts` — `getAllPages` returns what sql returns; `getPageById` returns first row or `null`; `getNoteBySlug` returns note or `null`, and on connection error during prerender returns `null` and logs (otherwise rethrows); `getAllPublishedNotes` same prerender fallback to `[]`.

- **Project queries** – `lib/queries/project.ts`
  - **Done:** `lib/queries/__tests__/project.test.ts` — `getAllProjects`, `getAllPublishedProjects` (with prerender fallback), `getProjectById`, `getProjectBySlug` return expected shapes or `null`; connection-error + prerender returns `[]` for `getAllPublishedProjects`, while non-connection errors are rethrown even during prerender builds.

- **Auth and login-attempt tracking** – `lib/queries/loginAttempts.ts`, `lib/auth.ts`
  - **Done:** `lib/queries/__tests__/loginAttempts.test.ts` — `checkRateLimit(undefined)` returns `{ allowed: true }` without calling sql; with IP: no record → insert and allow; expired window → reset and allow; within window under limit → increment and allow; at/over limit → `{ allowed: false, minutesLeft }`. `clearRateLimit(undefined)` no-ops; with IP calls sql. (`AUTH_ERROR_SERVICE_UNAVAILABLE` mapping is covered in `lib/__tests__/submitLogin.test.ts`.)
  - **Why**: Security-sensitive and behaviorally complex.

---

## 4. Component & Hook Tests (React / UI-Level)

Use **React Testing Library** (with a `jsdom` environment).

- **Login form flow** – `components/auth/LoginForm.tsx`
  - **Done:** `components/auth/LoginForm.test.tsx` — mocks `submitLogin` and `next/navigation`’s `useRouter`; submitting with valid email/password calls `submitLogin` and redirects to `/admin/dashboard` on `{ ok: true }`; `{ ok: false, error }` surfaces the error message; rejected `submitLogin` shows a fallback error message instead of throwing.
  - **What to extend**: Optionally assert loading/disabled submit state during the request and any client-side validation messages if you add them.
  - **Why**: Critical entry point; tests also lock in the default error copy and redirect path.

- **Delete buttons** – `components/notes/DeleteNoteButton.tsx`, `components/projects/DeleteProjectButton.tsx`
  - **Done:** `components/notes/DeleteNoteButton.test.tsx`, `components/projects/DeleteProjectButton.test.tsx` — initial click shows the “Sure?” confirm UI; confirm click issues `fetch(DELETE)` to `/api/pages/:id` or `/api/projects/:id` and, depending on props, either calls `router.refresh()` or `router.push(redirectTo)`; cancel click hides the confirm UI and restores the original `Delete` button.
  - **What to extend**: Add explicit assertions for loading/disabled state on the confirm button during the request and, if you refactor, cover any shared `ConfirmDeleteButton` abstraction.
  - **Why**: Risky actions that must behave exactly; tests now guard both the confirm/cancel UX and the correct routing behavior.

- **Create buttons** – `components/notes/CreateNoteButton.tsx`, `components/projects/CreateProjectButton.tsx`
  - **Done:** `components/notes/CreateNoteButton.test.tsx`, `components/projects/CreateProjectButton.test.tsx` — clicking the button sends a `POST` to `/api/pages` or `/api/projects` with `{ title: "Untitled …", slug: slugify(title) + "-" + Date.now() }` (both `slugify` and `Date.now` are mocked for determinism); on success, tests assert navigation to `/admin/editor/:id` (notes) or `/admin/projects/:id` (projects); when the request fails (`res.ok === false`), tests verify no navigation occurs.
  - **What to extend**: If you surface an explicit error UI on failure, assert that it appears; when you introduce a shared `useCreateEntity` or `CreateEntityButton`, keep these behaviors covered while pointing the tests at the new abstraction.
  - **Why**: Important admin workflows and a good place for tests once you centralize create logic; current tests protect API contracts, slug generation, and navigation behavior.

- **Slug fields** – `components/editor/EditorSlugField.tsx`, `components/projects/ProjectSlugField.tsx`
  - **What to test**: Typing into slug field sanitizes input (lowercase, allowed chars, no double hyphens); “Regenerate from title” button uses the title to compute a new slug and respects sanitized rules and `MAX_SLUG_LENGTH`.
  - **Why**: Bridge between user input and `validateSlug`/`slugify`; fragile formatting rules.

- **Save-status meta bars** – `components/editor/EditorMetaBar.tsx`, `components/projects/ProjectEditMetaBar.tsx` and hooks mentioned in doc (`useEditorPage`, `useProjectEdit`)
  - **What to test**: Debounced auto-save: modifying content triggers a pending state, then saved state after PATCH completes; publish toggle updates status and calls correct endpoint; visual status changes (label and color correspond to `SaveStatus` state).
  - **Why**: Debounced interactions are prone to race conditions; tests help solidify behavior and support refactoring toward a shared `useAdminSave` or similar.

- **Public display components** – e.g. `components/public/projects/ProjectCard.tsx`
  - **What to test**: Renders title and description correctly; renders tech stack tags when present; hides tag container when empty; conditionally renders GitHub and Live links only when URLs exist, with correct `href`, `target`, `rel`, `aria-label`; renders Details link with correct `href` (`/projects/${slug}`).
  - **Why**: Simple, stable components; fast tests that protect UI/aria contracts.

- **Public pages layout components** – `NotesPageHeader`, `ProjectsPageHeader`, `NotesEmptyState`, `ProjectsGrid`, `RecentNotesSection`, `FeaturedProjectsSection`, `NoteDetail`, `ProjectDetail`
  - **What to test**: Given props (or data from mocks), they show correct “empty” messaging when lists are empty; render the right number of cards/rows when data is present; show the correct headings and labels.
  - **Why**: Ideal tests to add once you introduce shared components like `PageHeader`, `EmptyState`, `SectionWithGrid`, etc.

---

## 5. End-to-End (E2E) Scenarios

Using Playwright after basic tooling is in place.

- **Public read-only flows**
  - **What to test**: Visit home page and see recent notes and featured projects sections; clicking a project card goes to the project detail page. Visit `/notes`: list of notes appears; clicking a note shows detail; tag filter changes visible notes. 404 / error states behave as intended.
  - **Why**: Core user-facing functionality and good smoke checks for deployments.

- **Authentication flows**
  - **What to test**: Successful login with valid credentials redirects to admin dashboard or intended page; failed login shows error messaging mapped from `submitLogin` (including the service-unavailable case).
  - **Why**: High impact if broken; ensures frontend and backend auth stay compatible.

- **Admin content lifecycle**
  - **What to test**: Create → Edit → Publish → View flow for notes: use create button, land on edit page, change title/content, auto-save, toggle publish; visit corresponding public URL and confirm visibility. Same for projects, including GitHub/Live links.
  - **Why**: This is the “happy path” for your own workflow.

- **Destructive operations**
  - **What to test**: Deleting a note/project: confirm dialog appears; cancel leaves content unchanged; confirm removes item from admin list and public pages.
  - **Why**: Guards against regressions in delete behavior or route paths.

---

## 6. Regression Tests Around Refactors in `refactoring-review.md`

Your refactoring doc already identifies shared abstractions; you can use tests to **lock in behavior before refactoring**:

- **Before refactor, add tests for current behavior** of: delete buttons, create buttons, meta bars, back links, empty states, section layouts, page containers, and link-pill styling.
- **Then refactor**, keeping tests green.
- This ensures the new `FormField`, `SlugField`, `EditMetaBar`, `BackLink`, `EmptyState`, `SectionWithGrid`, and design tokens behave identically from the user’s perspective.

You could also **update/add documentation** (e.g. in this file or a short “Testing strategy” section) to capture: chosen test stack (Vitest/Jest, React Testing Library, Playwright), the tiers above (utilities → queries → components → e2e), and conventions for where tests live (e.g. `__tests__` folders vs `*.test.tsx` next to code).

---

_Generated from a full app review focused on testing opportunities. Update this document as tests are added or priorities change._
