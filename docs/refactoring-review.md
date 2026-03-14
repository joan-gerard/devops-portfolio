# Refactoring Review: Reusable Components and Logic

This document captures refactoring opportunities across the app to increase reuse of components and logic. Each section describes the current duplication and a concrete approach to consolidate.

---

## 1. Form Field Components

**Current:** `EditorFormField` (`components/editor/EditorFormField.tsx`) and `ProjectEditFormField` (`components/projects/ProjectEditFormField.tsx`) both delegate to a shared `AdminFormField` (`components/shared/AdminFormField.tsx`) that renders the label, children, and optional hint with a consistent `marginBottom: "20px"` wrapper.

**Status:** ✅ Implemented. Shared `AdminFormField` uses a single label style from `components/admin/formStyles.ts` (`labelStyle`); `labelStyle` is optional so callers can override. Duplicate `labelStyle` removed from `editorStyles.ts` and `projectEditStyles.ts`. Any future admin form fields should reuse `AdminFormField` (and the shared form styles where applicable).

---

## 2. Slug Field + Slug Sanitisation

**Current:** `EditorSlugField` and `ProjectSlugField` duplicate the same `sanitiseSlugInput` (lowercase, `a-z0-9-`, collapse hyphens) and the same layout (input + “↺ from title” button and hint text). They differ only in which form field wrapper they use and how “regenerate from title” is implemented (editor gets slug from parent, project uses `slugify(titleForRegenerate)`).

**Status:** ✅ Implemented. Slug sanitisation moved to `lib/slugify.ts` as `sanitiseSlugForInput(raw: string)`; shared **SlugField** in `components/shared/SlugField.tsx` uses it and `AdminFormField` for label/hint. **EditorSlugField** and **ProjectSlugField** are thin wrappers that pass `onRegenerate`, `hint`, `placeholder`, `ariaLabel`, and context-specific `inputStyle`/`secondaryButtonStyle` from editorStyles or projectEditStyles.

---

## 3. Admin Form Styles

**Current:** `editorStyles.ts` and `projectEditStyles.ts` define the same concepts: `labelStyle`, `inputStyle`, `secondaryButtonStyle`, `publishButtonStyle`. The only meaningful difference is `inputStyle` (editor has `flex: 1`, project has `width: "100%"`).

**Status:** ✅ Implemented. All shared admin form styles live in `components/admin/formStyles.ts`: `labelStyle`, `inputStyle` (single version with `width: "100%"` so it works in both flex and block layouts), `secondaryButtonStyle`, `publishButtonStyle`. Editor and project edit UIs import from this module. `projectEditStyles.ts` removed; `editorStyles.ts` kept only for editor-specific `titleInputStyle` (large title field).

---

## 4. Delete Buttons

**Current:** `DeleteNoteButton` and `DeleteProjectButton` share the same behaviour and UI: confirm (“Sure?” / Delete / Cancel), loading state, `fetch(DELETE)`, then `router.push(redirectTo)` or `router.refresh()`. Only the API URL differs (`/api/pages/${id}` vs `/api/projects/${id}`).

**Suggestion:** A single **ConfirmDeleteButton** (or **DeleteEntityButton**) that takes `deleteUrl`, `redirectTo?`, and optional `onPreventDefault` (for use in rows/cards where you need to stop link navigation). Both current buttons become one-liners that pass the right URL and redirect.

**Status:** ✅ Implemented. Shared ConfirmDeleteButton in `components/shared/ConfirmDeleteButton.tsx` takes `deleteUrl` and optional `redirectTo`; it handles confirm UI, loading, DELETE request, and navigation. The trigger button calls `e.preventDefault()` and `e.stopPropagation()` so it works inside links (e.g. NoteRowLink, ProjectRow). **DeleteNoteButton** and **DeleteProjectButton** are thin wrappers that pass `/api/pages/${id}` and `/api/projects/${id}` respectively. Existing tests for both buttons still pass.

---

## 5. Create Buttons

**Current:** `CreateNoteButton` and `CreateProjectButton` follow the same pattern: default title, `slugify(title) + "-" + Date.now()`, POST to an API, then redirect to the edit page. Only API path, default title, redirect path, and button label differ.

**Suggestion:** Either a **CreateEntityButton** that accepts `apiPath`, `redirectPath`, `defaultTitle`, `buttonLabel`, and optionally `creatingLabel`, or a small **useCreateEntity** hook that returns `{ create, loading }` and a shared button UI. Both create buttons then just wire config to this.

**Status:** ✅ Implemented. Shared **CreateEntityButton** in `components/shared/CreateEntityButton.tsx` accepts `apiPath`, `defaultTitle`, `redirectPathPrefix` (we redirect to `${redirectPathPrefix}/${response.id}`), `buttonLabel`, and optional `creatingLabel` and `errorMessage`. It POSTs `{ title, slug }` with `slug = slugify(defaultTitle) + "-" + Date.now()` and uses the same button styling. Admin notes and projects pages use **CreateEntityButton** directly with the appropriate config; wrapper components were removed. Tests live in `components/shared/CreateEntityButton.test.tsx` (note-like config, project-like config, and failure case).

---

## 6. Edit Meta Bars

**Current:** `EditorMetaBar` and `ProjectEditMetaBar` have the same structure: back link, status text, publish toggle, delete button. Differences: back href/label, `statusColor` vs `statusColour`, which delete component is used, and `marginBottom`.

**Suggestion:** A single **EditMetaBar** (or **AdminEditMetaBar**) with props such as: `backHref`, `backLabel`, `saveStatus`, `statusColor`, `statusLabel`, `published`, `onTogglePublished`, and `deleteAction: ReactNode` (so each page passes its own delete button). This removes duplication and the colour spelling inconsistency.

**Status:** ✅ Implemented. Shared **EditMetaBar** in `components/shared/EditMetaBar.tsx` with props `backHref`, `backLabel`, `saveStatus`, `statusColor`, `statusLabel`, `published`, `onTogglePublished`, `deleteAction` (ReactNode), and optional `marginBottom` (default `"16px"`). Uses consistent `statusColor` spelling. **EditorPageClient** and **ProjectEditClient** use **EditMetaBar** directly, passing their delete button (DeleteNoteButton / DeleteProjectButton) as `deleteAction`. EditorMetaBar and ProjectEditMetaBar removed. Tests in `components/shared/EditMetaBar.test.tsx`.

---

## 7. Back Link Styling

**Current:** Back links appear in `EditorMetaBar` / `ProjectEditMetaBar` (inline `backLinkStyle`), `BackToProjectsLink` (`components/public/projects/project-page/BackToProjectsLink.tsx`; class `notes-back-link` + `u-text-muted-accent-hover`), and `NoteDetail`’s `NoteBackLink` (class `notes-back-link`).

**Suggestion:** A shared **BackLink** component that takes `href` and `children`, and uses one style (either a shared class or a small shared style object). Use it in meta bars, `BackToProjectsLink`, and `NoteDetail` so back links look and behave the same everywhere.

---

## 8. Public Page Headers

**Current:** `NotesPageHeader` uses inline styles for label, heading, and description. `ProjectsPageHeader` uses `projectStyles` (`pageLabel`, `pageHeading`, `pageDescription`). The structure is the same: small label, main heading, description paragraph.

**Suggestion:** Either a **PageHeader** component: `PageHeader({ label, heading, description })` that uses shared style constants, or shared design tokens (e.g. in `components/public/styles.ts` or `lib/styles/public.ts`) for “page label”, “page heading”, “page description”, and have both headers use them. That way Notes and Projects (and any future similar pages) stay consistent and you don’t repeat the same inline object.

---

## 9. Detail Page Headers

**Current:** `NoteDetailHeader` (inside `NoteDetail.tsx`) and `ProjectDetailHeader` (`components/public/projects/project-page/ProjectDetailHeader.tsx`) use the same layout: small uppercase label (“Note” / “Project”), large title, then metadata (tags + date vs date only). Inline styles are repeated.

**Suggestion:** A **DetailPageHeader** component with props like `label`, `title`, and `metadata?: ReactNode`, and shared styles for label, title, and metadata container. Note detail passes tags + date; project detail passes only date. This keeps one place for typography and spacing.

---

## 10. Empty States

**Current:** `NotesEmptyState` and the empty branch in `ProjectsGrid` both use: centered block, padding (e.g. 64px vertical), mono 13px muted text. Projects uses `emptyState` and `emptyStateText` from `projectStyles`; Notes uses inline styles. The About page has an internal **AboutEmptyState** in `AboutPageContent.tsx` (centered block, mono muted text) that follows the same pattern.

**Suggestion:** A single **EmptyState** component that takes `message` (and optionally `className`/style or `children` for richer content like About’s instructions), and shared styles (e.g. in a shared “public page” styles file). Use it on Notes, Projects, and About so copy and layout stay consistent and you don’t duplicate the layout object.

---

## 11. Homepage Section Layout

**Current:** `RecentNotesSection` and `FeaturedProjectsSection` share the same structure: section wrapper, label, heading, then either an empty message or a grid, then a “View all” link. Only content and copy differ. **TechStackSection** and **RoadmapSection** also use the same section tokens (`sectionLabel`, `sectionHeading`, and `viewAllLink` where applicable) from `sectionStyles`, so a shared section wrapper would benefit all four home sections for consistency.

**Suggestion:** A **SectionWithGrid** (or **HomeSection**) component with props like `label`, `heading`, `emptyMessage`, `viewAllHref`, `viewAllLabel`, and `children`. Each section renders its grid/content as children. That keeps layout and “view all” behaviour in one place.

You can also consider reusing **ProjectCard** (or a shared card) for the homepage featured projects: **FeaturedProject** and **PublishedProject** are compatible in shape, so the home section could render the same card component with the same styles and link behaviour.

---

## 12. Design Tokens Across Public Pages

**Current:** `sectionStyles.ts` (home) and `projectStyles.ts` (projects) both define label (small uppercase mono), heading (Syne, bold), tag (mono, muted, pill), and card-like styles. Home sections that use these include `RecentNotesSection`, `FeaturedProjectsSection`, `TechStackSection`, `RoadmapSection`, and `NoteCard` (sectionStyles); projects use `ProjectsPageHeader`, `ProjectsGrid`, `ProjectCard`, and `ProjectTechStackSection` (projectStyles).

**Suggestion:** A single set of “public page” design tokens (e.g. one file or a small hierarchy) for label, heading, tag, card, and optionally “view all” link and empty state. Home and projects (and Notes if you refactor it) import from there. That reduces duplication and keeps the public look consistent.

---

## 13. Page Container Layout

**Current:** The same container style appears in many places: `maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px"` (or very close) in `ProjectDetail`, `NoteDetail`, `AboutPageContent`, notes page, projects page, `PublicNav`, `PublicFooter`, `error.tsx`, etc.

**Suggestion:** A shared constant (e.g. `pageContainerStyle`) or a **PageContainer** component used on all these public (and error) pages. That makes it easy to change width/padding in one place.

---

## 14. Save Status in Admin Hooks

**Current:** `useEditorPage` and `useProjectEdit` both define `SaveStatus` type, `DEBOUNCE_MS`, `STATUS_COLOR` / `STATUS_COLOUR` and `STATUS_LABEL`, and similar debounced PATCH and publish toggle pattern.

**Suggestion:** Extract shared pieces into something like `lib/adminSave.ts` or `hooks/useAdminSave.ts`: the `SaveStatus` type and constants (`DEBOUNCE_MS`, `STATUS_COLOR`, `STATUS_LABEL`; standardise on “colour” once). Optionally a small `useDebouncedPatch(baseUrl)` or shared “save status” logic that both hooks use. The hooks can stay separate but share types and constants (and possibly a bit of generic save/publish logic).

---

## 15. Prerender Fallback in Queries

**Current:** `getNoteBySlug`, `getAllPublishedNotes`, and `getAllPublishedProjects` use the same pattern: try/catch, `IS_PRERENDER_BUILD`, `isConnectionErrorOrAggregate`, `console.warn`, return a fallback (null or empty array).

**Suggestion:** A helper, e.g. in `lib/db-errors.ts` or `lib/queries/prerender.ts`:

```ts
withPrerenderFallback<T>(queryFn: () => Promise<T>, fallback: T, logContext: string): Promise<T>
```

Use it in all three so the prerender behaviour and logging live in one place.

---

## 16. External Link / “Pill” Styling

**Current:** `ProjectLinksSection`, `ProjectCard`, and `FeaturedProjectsSection` repeat similar styling for “GitHub →” and “Live →” links (mono, size, border, hover).

**Suggestion:** A small **LinkPill** or **ExternalLink** component (or shared style set) with variants (e.g. muted vs accent) so these links are implemented once and stay consistent.

---

## Summary Table

| Area               | Current duplication              | Reuse approach                                                                       |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Form field         | Editor + Project                 | ✅ `AdminFormField` + shared `formStyles` (label)                                    |
| Slug field         | 2 components + 2× sanitise       | ✅ `sanitiseSlugForInput` in lib/slugify + shared SlugField                          |
| Admin form styles  | editorStyles + projectEditStyles | ✅ Single `formStyles.ts` (width: "100%"); projectEditStyles removed                 |
| Delete buttons     | Note + Project                   | ✅ `ConfirmDeleteButton` + thin wrappers                                             |
| Create buttons     | Note + Project                   | ✅ `CreateEntityButton` used directly in admin pages                                 |
| Meta bars          | Editor + Project                 | ✅ `EditMetaBar` with `deleteAction`; used in EditorPageClient and ProjectEditClient |
| Back links         | 4 places                         | Shared `BackLink`                                                                    |
| Page headers       | Notes inline, Projects styles    | `PageHeader` or shared tokens                                                        |
| Detail headers     | Note + Project                   | `DetailPageHeader`                                                                   |
| Empty states       | Notes + Projects + About         | `EmptyState` + shared styles                                                         |
| Home sections      | 2 sections                       | `SectionWithGrid` / `HomeSection`                                                    |
| Design tokens      | sectionStyles + projectStyles    | Unified public page tokens                                                           |
| Page container     | 6+ places                        | `pageContainerStyle` or `PageContainer`                                              |
| Save status        | 2 hooks                          | Shared types/constants (+ optional hook)                                             |
| Prerender fallback | 3 query functions                | `withPrerenderFallback`                                                              |
| Link pills         | 3+ places                        | `LinkPill` / `ExternalLink`                                                          |

---

_Generated from a full app review focused on reusable components and logic. Update this document as refactors are completed or priorities change._

**Last reviewed:** March 2026 — paths and component locations verified. Section 1: shared admin formStyles (label). Section 2: `sanitiseSlugForInput` + shared SlugField. Section 3: all admin form styles in `formStyles.ts` (width: "100%"); projectEditStyles removed; editorStyles only `titleInputStyle`. Section 4: shared `ConfirmDeleteButton` in `components/shared/ConfirmDeleteButton.tsx`; DeleteNoteButton and DeleteProjectButton are thin wrappers. Section 5: shared `CreateEntityButton` in `components/shared/CreateEntityButton.tsx`; used directly in admin notes and projects pages; tests in `CreateEntityButton.test.tsx`. Section 6: shared `EditMetaBar` in `components/shared/EditMetaBar.tsx`; EditorPageClient and ProjectEditClient use it with `deleteAction`; tests in `EditMetaBar.test.tsx`.

**Related:** See [Testing Plan](testing-plan.md) for testing opportunities and regression-test strategy around these refactors.
