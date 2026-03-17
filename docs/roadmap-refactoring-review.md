## Roadmap Refactoring Review

This document captures refactoring opportunities specifically for the roadmap feature set added between commits `02e2f6a8a10972e8618881c9e36bc4308c9592ef` and `19ae8a24911527ea6be840646ce4d9528a86c856`.

---

## 1. Roadmap Status and Type Styling Tokens

**Status:** Completed (March 2026)

**Current (before refactor):**  
`RoadmapNode`, `AdminRoadmapNode`, `RoadmapSidePanel`, and `AdminRoadmapSidePanel` each defined their own status/type label, color, and badge/pill styling (`STATUS_STYLES`, `STATUS_ICON`, `STATUS_LABEL`, `STATUS_COLOR`, `STATUS_OPTIONS`, `TYPE_STYLES`, `TYPE_OPTIONS`). The mappings were conceptually the same (three statuses, three types) but lived in multiple components with slightly different shapes and colors.

**Change:**  
A shared `roadmapStyles` module (`components/roadmap/roadmapStyles.ts`) now exports:

- `ROADMAP_STATUS`, `ROADMAP_STATUS_LABEL`, and `ROADMAP_STATUS_COLORS` (for dots/badges/pills).
- `ROADMAP_STATUS_ICON` for node/status glyphs.
- `ROADMAP_STATUS_NODE_STYLES` for node border/icon/pill styling.
- `ROADMAP_TYPE_CONFIG` (label + colors).
- `ROADMAP_STATUS_OPTIONS` and `ROADMAP_TYPE_OPTIONS` for admin side panel controls.

All roadmap UIs (`RoadmapNode`, `AdminRoadmapNode`, `RoadmapSidePanel`, and `AdminRoadmapSidePanel`) import from this module so any visual or copy change happens in one place and both admin and public views stay consistent.

---

## 2. Shared Slide‑In Side Panel Shell (Admin + Public)

**Status:** Completed (March 2026)

**Current (before refactor):**  
`RoadmapSidePanel` and `AdminRoadmapSidePanel` both implemented:

- An absolute, right‑hand slide‑in panel with transform/transition.
- A full-screen backdrop that closes on click.
- Escape key handling to close.
- Very similar header rows (title/status vs “Edit node”) and close button styles.

**Change:**  
A generic slide‑in panel shell `RoadmapSidePanelShell` (`components/roadmap/RoadmapSidePanelShell.tsx`) now centralizes:

- Props like `isOpen`, `onClose`, `width`, `header`, `children`.
- Backdrop rendering and click-to-close behavior.
- Escape key handling to close.
- The right-hand slide-in layout and translateX animation.

Both `RoadmapSidePanel` (public) and `AdminRoadmapSidePanel` (admin) now import and use `RoadmapSidePanelShell`, and only own their specific header/body content (status copy, form fields, actions).

---

## 3. Shared Roadmap Save Status Handling

**Status:** Completed (March 2026)

**Current (before refactor):**  
`RoadmapEditor` defined a local `SaveStatus` union (`"idle" | "saving" | "saved" | "error"`) and managed timers to revert back to idle. `AdminRoadmapSidePanel` defined its own `SaveStatus` type and internal state, then mirrored it outward via `onSaveStatusChange`. `lib/adminSave.ts` already existed with an admin save status model for editor/project pages, but roadmap used its own mini variant.

**Change:**  
A roadmap-specific `useRoadmapSaveStatus` hook (`hooks/useRoadmapSaveStatus.ts`) now encapsulates the `"idle" | "saving" | "saved" | "error"` state machine and auto‑reset timer:

- Exposes `saveStatus`, `beginSaving`, `finishSaving`, `setIdle`, and `setError`.
- Resets back to `"idle"` after a configurable delay (default 2000ms) when a save completes successfully.

`RoadmapEditor` uses this hook to drive the top‑center save badge and passes its `beginSaving` / `finishSaving` helpers into `AdminRoadmapSidePanel`, which calls them from its PATCH/delete actions. This keeps save status handling for roadmap centralized and ensures consistent labels, timing, and transitions between the editor canvas and the admin side panel.

---

## 4. Roadmap Node and Edge Mapping Utilities

**Status:** Completed (March 2026)

**Current (before refactor):**  
`RoadmapCanvas` and `RoadmapEditor` each hand-rolled their own mapping from `RoadmapItemWithSlug` / `RoadmapEdge` to React Flow `Node` / `Edge`:

- `RoadmapCanvas` constructed nodes inline and cast them with `as unknown as Node[]`.
- `RoadmapEditor` used local `toFlowNode` and `toFlowEdge` helpers.

Edge style constants (stroke color, width, type) and the “side to side uses straight line vs smoothstep” rule lived inside `toFlowEdge`.

**Change:**  
Mapping has been centralized into `components/roadmap/roadmapFlowMapper.ts`, which exports:

- `toPublicFlowNodes(items, selectedId)` — builds public read-only nodes with `type: "roadmapNode"`, selection, and `draggable: false`.
- `toAdminFlowNodes(items, selectedId)` — builds admin nodes with `type: "adminRoadmapNode"` and correctly typed `data`.
- `toFlowEdges(edges)` — builds edges with shared styling, interaction width, and the side-to-side `"straight"` vs `"smoothstep"` rule, including optional handle IDs.

`RoadmapCanvas` now uses `toPublicFlowNodes` / `toFlowEdges`, and `RoadmapEditor` uses `toAdminFlowNodes` / `toFlowEdges` (including when adding or creating edges), reducing casting, de-duplicating edge styling, and centralizing any future changes to handle IDs/handles.

---

## 5. Shared Roadmap React Flow Configuration and Theming

**Current:**  
Both public (`RoadmapCanvas`) and admin (`RoadmapEditor`) flows:

- Use `Background` with the same dot settings and colors.
- Configure read-only vs editable interactions, but share a lot of base style and theming.

React Flow theming is partly handled in `app/globals.css` via `.react-flow` and `--xy-controls-*` variables, plus a hard override for `.react-flow__controls button`.

**Suggestion:**  
Extract a small `RoadmapFlowConfig` module that:

- Holds constants for background gap/size/color, default edge style, controls styling, and any `proOptions`.
- Optionally exports helper props for public vs admin flows (e.g. `publicFlowProps`, `adminFlowProps`).

Use these helpers inside `RoadmapCanvas` and `RoadmapEditor` so changes to controls, attribution, or edges are centralized.

---

## 6. Roadmap Inline Layout and Styles → Tokens

**Current:**  
`PublicRoadmapLayout`, `RoadmapSidePanel`, `AdminRoadmapSidePanel`, and both node components have large inline style objects for typography, spacing, borders, and backgrounds. Many of these align with the existing public/admin style language (mono font, small uppercase labels, pills) but are defined ad hoc rather than via reusable tokens like `publicPageStyles`.

**Suggestion:**  
Create a dedicated `roadmapStyles.ts` with:

- Shared heading/description styles for the roadmap page.
- Shared card/node container styles (width, radius, padding).
- Shared panel layout styles (header row, body spacing, footer).

Use those tokens in the main roadmap components so roadmap stays visually consistent and applies the same design‑token approach as other public/admin pages.

---

## 7. Unify Roadmap API GET with Query Layer

**Current:**  
`lib/queries/roadmap.ts` exposes `getRoadmapData()` which:

- LEFT JOINs `pages` and `projects` to resolve `linked_page_slug`.
- Applies `e2e_only` filtering.
- Wraps behavior in `withPrerenderFallback`.

`app/api/roadmap/route.ts` directly queries `roadmap_items` and `roadmap_edges` (no joins, slightly different shape, custom `E2E_TEST` filtering), returning `RoadmapItem` without slugs. E2E tests for public/admin roadmap hit `/api/roadmap` directly, while the pages use `getRoadmapData()`.

**Suggestion:**  
Have `GET /api/roadmap` delegate to `getRoadmapData()` (or a thin variant of it) instead of re‑implementing SQL, optionally accepting a query param to control `e2e_only` inclusion for tests. This keeps roadmap data access in one place (queries) with consistent behavior (slug resolution, E2E flag, prerender handling) and simplifies future schema changes.

---

## 8. API Request Body Parsing and Validation Helpers

**Current:**  
`POST /api/roadmap`, `PATCH /api/roadmap/[id]`, and `POST /api/roadmap/edges` all implement:

- `try { await request.json() } catch { 400 }`.
- An object type guard (`typeof body !== "object" || body === null`).
- Ad hoc checks for allowed status/type values and number fields.

The patterns and error messages are very similar, but repeated across multiple route files.

**Suggestion:**  
Add small API utilities, e.g. in `lib/api/json.ts` or `lib/api/roadmap-validation.ts`:

- `parseJsonObject(request): Promise<Record<string, unknown> | NextResponse>` to encapsulate error handling.
- `validateRoadmapNodePayload(body)` and `validateRoadmapEdgePayload(body)` that return either a normalized typed object or a `NextResponse` error.

Use them in all roadmap routes to reduce duplication and ensure error responses stay aligned.

---

## 9. Roadmap E2E Helper Consolidation

**Current:**  
`e2e/roadmap-admin.spec.ts` and `e2e/roadmap.spec.ts` each define helper functions like `createRoadmapItem`, `deleteRoadmapItem`, and variants for patching/setting up roadmap nodes. Similar patterns (POST `/api/roadmap`, PATCH `/api/roadmap/[id]`, DELETE) are repeated with minor parameter differences.

**Suggestion:**  
Factor common helpers into `e2e/fixtures/roadmap.ts`:

- `createRoadmapItem(page, { title, type, status, position })`
- `patchRoadmapItem(page, id, fields)`
- `deleteRoadmapItem(page, id)`
- Optional helpers for computing a canvas center for tests.

Import these in both E2E suites to reduce duplication and make improvements (like better test data isolation) in one place.

---

## 10. Shared Public/Admin Roadmap Completed Date Formatting

**Current:**  
Both `RoadmapSidePanel` (public) and `AdminRoadmapSidePanel` format `completed_at` with `toLocaleDateString("en-GB", { day, month, year })` inline.

**Suggestion:**  
Extract a tiny `formatRoadmapDate` utility in `lib/roadmap-date.ts` (or similar) and use it in both panels. This keeps date formatting rules for roadmap items in a single place and makes it easier to change locale/format later.

---

## 11. Roadmap Types: Unify `RoadmapData` Shape

**Current:**  
`types/roadmap.ts` defines `RoadmapData` (`items: RoadmapItem[]; edges: RoadmapEdge[]`), while `lib/queries/roadmap.ts` defines its own `RoadmapData` with `items: RoadmapItemWithSlug[]`.

**Suggestion:**  
Either:

- Export `RoadmapItemWithSlug` and `RoadmapDataWithSlug` from `types/roadmap.ts` and use them in `lib/queries/roadmap.ts`, or
- Keep `RoadmapItem` / `RoadmapEdge` in `types` only, and have the query file import them and define `RoadmapItemWithSlug` there without redefining `RoadmapData` with a different meaning.

This clarifies type naming across API and queries and avoids two slightly-different `RoadmapData` interfaces.

---

## 12. Remove Debug Artefacts and Hard-Coded Overrides

**Current:**  
`RoadmapCanvas` sets the container background to `"red !important"`, which appears to be a debugging leftover:

- `style={{ position: "relative", width: "100%", height: "100%", background: "red !important" }}`.

**Suggestion:**  
Remove the hard-coded red background and rely on `var(--bg)` / `var(--surface-2)` or a roadmap-specific style from the new `roadmapStyles` mentioned above.

---

**Last reviewed:** March 2026 — roadmap feature set only. Update this document as roadmap refactors are completed or priorities change.
