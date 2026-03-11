# Testing Plan: DevOps Portfolio

This document captures testing opportunities across the app. The codebase currently has **no test tooling configured** (`package.json` has no test scripts, no Jest/Vitest/Playwright, and no `*.test.*`/`*spec.*` files). The opportunities below are organised by layer and priority so you can add tests incrementally.

---

## 1. Testing Infrastructure (Foundational)

- **Add a unit test runner**
  - **Opportunity**: Introduce **Vitest** or **Jest** with TypeScript support.
  - **Why**: Enables fast feedback on lib functions and non-Next-specific logic.
  - **Scope**:
    - Configure `vitest.config.ts` or `jest.config.js`.
    - Add scripts in `package.json`, e.g. `test`, `test:watch`, `test:ci`.
    - Set up `ts-node` / `ts-jest` or Vitest + `tsconfig`.

- **Add React Testing Library for components**
  - **Opportunity**: Test key interactive components under realistic DOM conditions.
  - **Why**: You have several client components with branching UI (e.g. delete buttons, login form, editor/project UI).
  - **Scope**:
    - Configure test environment to use `jsdom`.
    - Helpers for rendering components with providers (e.g. `AuthSessionProvider`).

- **Add e2e tests (Playwright or Cypress)**
  - **Opportunity**: Cover public flows and admin flows end-to-end.
  - **Why**: Critical flows (login, create/edit/delete notes/projects) should be exercised as a real user would.

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

- **Prerender fallback helpers & DB error utilities** – `lib/db-errors.ts`, `lib/api/postgres-errors.ts`, and the pattern in queries (`getNoteBySlug`, `getAllPublishedNotes`, `getAllPublishedProjects`).
  - **What to test**: When `IS_PRERENDER_BUILD === "true"` and `isConnectionErrorOrAggregate(error)` is true, the three query functions return `null`/`[]` and log a warning; otherwise they rethrow. This logic is subtle and directly impacts build reliability; tests can drive the suggested `withPrerenderFallback` refactor from your doc.

- **Login submission logic** – `lib/submitLogin.ts`
  - **What to test**: When `signIn` returns `{ error: AUTH_ERROR_SERVICE_UNAVAILABLE }`, you map to the friendly “Sign-in is temporarily unavailable…” message; when it returns other `error` values you `decodeURIComponent` them; when no error you return `{ ok: true }`; when `signIn` throws you log and return `{ ok: false, error: DEFAULT_ERROR_MESSAGE }`. Mock `next-auth/react`’s `signIn` in unit tests.
  - **Why**: Critical auth UX logic that should never throw in the client.

- **R2 / S3 and file validation utilities** – `lib/r2.ts`, `lib/validateFileBytes.ts`
  - **What to test**: File size/byte validations (exact boundary values and failure messages) and any content/type checks if present.
  - **Why**: Easy to regress and can cause user-facing upload errors.

- **Home page constants and selection logic** – `lib/constants/home.ts`, `lib/queries/home.ts`
  - **What to test**: Any logic that selects “featured projects” or “recent notes” (once you confirm contents); ensure correct filtering/sorting and max counts.

---

## 3. Data-Access / Integration-Like Tests (`lib/queries/*.ts`)

You can test these with either **integration tests** against a test DB or **high-level unit tests with fakes**.

- **Page queries** – `lib/queries/page.ts`
  - **What to test** (with a fake `sql` or test DB): `getAllPages` returns pages ordered by `updated_at DESC`; `getPageById` returns a single row or `null` when not found; `getNoteBySlug` only returns published notes; `getAllPublishedNotes` excludes `"about"` and only returns `published = true`; error handling / prerender fallbacks as above.

- **Project queries** – `lib/queries/project.ts`
  - **What to test**: `getAllProjects` returns full admin fields and correct ordering; `getAllPublishedProjects` only returns published projects, in correct order; `getProjectById` returns project or `null`; `getProjectBySlug` only returns published projects; error handling / prerender fallbacks.

- **Auth and login-attempt tracking** – `lib/queries/loginAttempts.ts`, `lib/auth.ts`
  - **What to test**: Any logic around max login attempts, lockout, or rate limiting; mapping DB responses to auth errors (e.g. `AUTH_ERROR_SERVICE_UNAVAILABLE`).
  - **Why**: Security-sensitive and behaviorally complex.

---

## 4. Component & Hook Tests (React / UI-Level)

Use **React Testing Library** (with a `jsdom` environment).

- **Login form flow** – `components/auth/LoginForm.tsx`
  - **What to test**: Submitting with valid email/password triggers `submitLogin`, shows loading state, then on `{ ok: true }` redirects or updates UI; on `{ ok: false, error }` displays the error message; prevents multiple submissions while loading; displays validation errors if you have client-side checks.
  - **Why**: Critical entry point; tests can also verify that default error copy is correct.

- **Delete buttons** – `components/notes/DeleteNoteButton.tsx`, `components/projects/DeleteProjectButton.tsx`
  - **What to test**: Click “Delete” shows confirm UI (“Sure?” or similar), then clicking confirm calls `fetch(DELETE)` with correct URL and on success calls `router.push` or `router.refresh`; clicking cancel restores the original button; loading state and disabled button during the request; optional: verify `onPreventDefault`/link-row behavior if present.
  - **Why**: Risky actions that must behave exactly; ideal candidates for a shared `ConfirmDeleteButton` whose behavior is fully tested.

- **Create buttons** – `components/notes/CreateNoteButton.tsx`, `components/projects/CreateProjectButton.tsx`
  - **What to test**: Clicking button sends POST to correct API with the expected payload (title, slug); slug generation uses `slugify(title) + "-" + Date.now()` (you can abstract `Date.now` with a mockable helper). Error paths: failed request shows an error or at least doesn’t navigate.
  - **Why**: Important admin workflows and a good place for tests once you centralize logic (`useCreateEntity` or `CreateEntityButton`).

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

Using Playwright or Cypress after basic tooling is in place.

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
