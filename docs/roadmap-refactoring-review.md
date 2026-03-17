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

**Status:** Completed (March 2026)

**Current (before refactor):**  
Both public (`RoadmapCanvas`) and admin (`RoadmapEditor`) flows:

- Used `Background` with the same dot settings and colors.
- Configured read-only vs editable interactions, but shared a lot of base style and theming inline.

React Flow theming was partly handled in `app/globals.css` via `.react-flow` and `--xy-controls-*` variables, plus a hard override for `.react-flow__controls button`.

**Change:**  
A small `RoadmapFlowConfig` module (`components/roadmap/roadmapFlowConfig.ts`) now centralizes shared React Flow configuration:

- Constants for background gap/size/color and variant: `ROADMAP_BACKGROUND_GAP`, `ROADMAP_BACKGROUND_SIZE`, `ROADMAP_BACKGROUND_COLOR`, `ROADMAP_BACKGROUND_VARIANT`.
- `ROADMAP_PRO_OPTIONS` for shared `proOptions` (e.g. attribution behavior).
- Helper props for public vs admin flows:
  - `ROADMAP_PUBLIC_FLOW_PROPS` (fixed zoom, vertical pan scroll, read-only).
  - `ROADMAP_ADMIN_FLOW_PROPS` (connection mode, delete key codes).

`RoadmapCanvas` and `RoadmapEditor` now consume these helpers and constants when rendering `ReactFlow` and `Background`, so changes to controls, attribution, or edge theming are made in one place while CSS-driven theming in `app/globals.css` remains the single source for visual tokens.

---

## 6. Roadmap Inline Layout and Styles → Tokens

**Current:**  
`PublicRoadmapLayout`, `RoadmapSidePanel`, `AdminRoadmapSidePanel`, and both node components still have large inline style objects for typography, spacing, borders, and backgrounds. Many of these align with the existing public/admin style language (mono font, small uppercase labels, pills) but are defined ad hoc rather than via reusable layout tokens.

`components/roadmap/roadmapStyles.ts` now exists and centralizes roadmap status/type tokens, but it does not yet cover layout/spacing/typography primitives for the page, nodes, or panels.

**Suggestion (updated):**  
Extend `roadmapStyles.ts` to also export layout and typography tokens, for example:

- Shared heading/description styles for the roadmap page.
- Shared card/node container styles (width, radius, padding).
- Shared panel layout styles (header row, body spacing, footer).

Gradually migrate inline style objects in `PublicRoadmapLayout`, `RoadmapSidePanel`, `AdminRoadmapSidePanel`, `RoadmapNode`, and `AdminRoadmapNode` to use these tokens so roadmap stays visually consistent and applies the same design‑token approach as other public/admin pages, building on the existing status/type tokens instead of introducing a parallel system.

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

**Status:** Completed (March 2026)

**Current (before refactor):**  
`POST /api/roadmap`, `PATCH /api/roadmap/[id]`, and `POST /api/roadmap/edges` each:

- Called `request.json()` in a `try/catch` and returned 400 on failure.
- Performed an inline object type guard (`typeof body !== "object" || body === null`).
- Implemented ad hoc checks for allowed status/type values and numeric fields directly in the route handlers.

The patterns and error messages were very similar but duplicated across multiple route files.

**Change:**  
Small API utilities now centralize this behavior:

- `lib/api/json.ts` exports `parseJsonObject(request): Promise<Record<string, unknown> | NextResponse>` which:
  - Handles JSON parsing failures and non-object bodies.
  - Returns consistent `400` error responses for invalid JSON and non-object payloads.
- `lib/api/roadmap-validation.ts` exports:
  - `validateRoadmapNodeCreatePayload(body)` for `POST /api/roadmap`.
  - `validateRoadmapNodePatchPayload(body)` for `PATCH /api/roadmap/[id]`.
  - `validateRoadmapEdgePayload(body)` for `POST /api/roadmap/edges`.

Each validator returns either a normalized, typed payload or a `NextResponse` with aligned error messages (e.g. `title is required`, `Invalid status. Allowed: …`, `position_x must be a number`, `source_id and target_id are required`). All three roadmap routes now use these helpers, reducing duplication and keeping request body validation consistent.

---

## 9. Roadmap E2E Helper Consolidation

**Status:** Completed (March 2026)

**Current (before refactor):**  
`e2e/roadmap-admin.spec.ts` and `e2e/roadmap.spec.ts` each defined their own roadmap helpers like `createRoadmapItem`, `patchRoadmapItem`, and `deleteRoadmapItem`, plus an inline `getRoadmapCenter` in the admin spec. These all wrapped the same `/api/roadmap` POST/PATCH/DELETE calls with slightly different parameter shapes and defaults.

**Change:**  
Common helpers have been factored into `e2e/fixtures/roadmap.ts`:

- `getRoadmapCenter(page)` computes a stable canvas center based on existing roadmap item positions (with a sensible default when empty).
- `createRoadmapItem(page, { title, type, status, position })` creates a roadmap item with optional type/status and an overridable position (defaulting to `(80, 80)`).
- `patchRoadmapItem(page, id, fields)` performs a PATCH to `/api/roadmap/[id]` and asserts success.
- `deleteRoadmapItem(page, id)` deletes a roadmap item via the API.

Both `roadmap-admin.spec.ts` and `roadmap.spec.ts` now import these helpers instead of defining their own, reducing duplication and keeping roadmap E2E setup/teardown behavior centralized.

---

## 10. Shared Public/Admin Roadmap Completed Date Formatting

**Status:** Completed (March 2026)

**Current (before refactor):**  
Both `RoadmapSidePanel` (public) and `AdminRoadmapSidePanel` formatted `completed_at` inline using `new Date(completed_at).toLocaleDateString("en-GB", { day, month, year })`, duplicating the locale/formatting logic in two places.

**Change:**  
Date formatting for roadmap items is now centralized:

- `lib/roadmap-date.ts` exports a small `formatRoadmapDate(input)` helper that:
  - Accepts a `string | Date | null | undefined`.
  - Returns a formatted `"en-GB"` date string (`"d MMM yyyy"` style) or an empty string for falsy/invalid inputs.
- Both `components/public/roadmap/RoadmapSidePanel.tsx` and `components/roadmap/AdminRoadmapSidePanel.tsx` now import `formatRoadmapDate` and use it for their `"Completed …"` labels instead of calling `toLocaleDateString` directly.

This keeps roadmap date formatting in a single place and makes future locale/format changes straightforward.

---

## 11. Roadmap Types: Unify `RoadmapData` Shape

**Status:** Completed (March 2026)

**Current (before refactor):**  
`types/roadmap.ts` defined `RoadmapData` as `{ items: RoadmapItem[]; edges: RoadmapEdge[] }`, while `lib/queries/roadmap.ts` declared its own `RoadmapData` type with `items: RoadmapItemWithSlug[]`. The shared name with different meanings made it easy to confuse API-level and query-level shapes.

**Change:**  
Roadmap types are now clearly separated and centralized:

- `types/roadmap.ts` exports:
  - `RoadmapData` — API-level shape (`items: RoadmapItem[]; edges: RoadmapEdge[]`).
  - `RoadmapItemWithSlug` — extends `RoadmapItem` with `linked_page_slug: string | null`.
  - `RoadmapDataWithSlug` — query/UI shape (`items: RoadmapItemWithSlug[]; edges: RoadmapEdge[]`).
- `lib/queries/roadmap.ts` imports `RoadmapItemWithSlug` and `RoadmapDataWithSlug` instead of redefining its own `RoadmapData`, and `getRoadmapData()` now returns `RoadmapDataWithSlug`.

This makes it explicit when slugs are present on roadmap items, avoids duplicate `RoadmapData` definitions, and keeps API vs query-layer types clearly named.

---

## 12. Remove Debug Artefacts and Hard-Coded Overrides

**Status:** Completed (March 2026)

**Current (before refactor):**  
`RoadmapCanvas` set the outer container background to `"red !important"`, which was a debugging leftover:

- `style={{ position: "relative", width: "100%", height: "100%", background: "red !important" }}`.

This conflicted with the normal theme/background tokens used elsewhere.

**Change:**  
The roadmap canvas container now uses theme tokens instead of a hard-coded debug color:

- The container style is now `background: "var(--bg)"`, matching the rest of the public layout.
- `ReactFlow` itself continues to use its own `style={{ background: "var(--bg)" }}` and the shared roadmap background configuration from `roadmapFlowConfig`.

This removes the debug artefact and keeps roadmap visuals consistent with the global design system.

---

**Last reviewed:** March 2026 — roadmap feature set only. Update this document as roadmap refactors are completed or priorities change.
