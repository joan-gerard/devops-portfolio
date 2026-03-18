# Folder / Module Re-organization Opportunities (No Behavior Changes)

Scope: structural refactors only (moving/renaming modules and folders, improving barrel exports and module boundaries). The goal is to reduce duplication and make features easier to navigate without changing runtime behavior.

## 1. Reorganize roadmap UI components under a single feature tree

- Current: public roadmap UI lives under `components/public/roadmap/*`, while admin/editor roadmap UI lives under `components/roadmap/*`.
- Opportunity: introduce a single roadmap feature hierarchy under `components/roadmap/`, for example:
  - `components/roadmap/public/*` for what is currently in `components/public/roadmap/*`
  - keep `components/roadmap/admin/*` (or `components/roadmap/editor/*`) for what is currently in `components/roadmap/*`
- No behavior changes: re-export from the old entry points (or update only local imports) so the rendered UI and props remain identical.

Status: Implemented by moving the public roadmap components + tests into `components/roadmap/public/` and updating imports to point at the new barrel (legacy `components/public/roadmap/` barrel removed).

## 2. Clarify roadmap "node" variants and contracts

- Current: `components/roadmap/nodes/public/RoadmapNode.tsx` and `components/roadmap/nodes/admin/AdminRoadmapNode.tsx` are near-duplicates with subtle differences. Both rely on a stable handle-id contract so editor edges connect when rendered in public mode.
- Opportunity:
  - move both into a dedicated node folder, e.g. `components/roadmap/nodes/`
  - extract the handle id contract (e.g. `top`, `left`, `bottom`, `right`) into a shared module (e.g. `components/roadmap/handles.ts`)
  - have both node components and the edge/mapper logic import the same handle constants
- No behavior changes: the node rendering logic and props can remain the same; this mainly eliminates drift risk.

Status: Implemented by adding `components/roadmap/handles.ts`, moving public/admin node components + tests into `components/roadmap/nodes/`, and updating imports/barrels to reference the new locations.

## 3. Reorganize roadmap side panels into a shared panels folder

- Current:
  - `components/roadmap/public/RoadmapSidePanel.tsx`
  - `components/roadmap/AdminRoadmapSidePanel.tsx`
  - shared shell already exists as `components/roadmap/RoadmapSidePanelShell.tsx`
- Opportunity:
  - move the public and admin side panels into `components/roadmap/panels/public` and `components/roadmap/panels/admin` (or similar)
  - keep `RoadmapSidePanelShell` in the same panels feature area
- No behavior changes: panel props, layout, and styles remain unchanged; imports/barrel exports are the main changes.

## 4. Extract roadmap "public vs admin" presentation modules without touching mapper behavior

- Current:
  - `components/roadmap/roadmapFlowMapper.ts` already centralizes React Flow mapping (`toPublicFlowNodes`, `toAdminFlowNodes`, `toFlowEdges`).
  - public presentation components live under `components/roadmap/public/`, while admin presentation components are still mostly in `components/roadmap/` root.
- Opportunity:
  - keep `roadmapFlowMapper.ts` as-is, but align module ownership by moving admin presentation components into a symmetric folder (e.g. `components/roadmap/admin/*`) to match `components/roadmap/public/*`.
- No behavior changes: the mapper API should stay identical; this is a navigation + ownership refactor.

## 5. Move large API route orchestration logic into `lib/` modules

- Current:
  - `app/api/media/route.ts` contains orchestration for:
    - auth check
    - R2 env/config validation
    - magic-byte MIME detection
    - upload + DB insert + rollback
  - roadmap routes (`app/api/roadmap/route.ts`, `app/api/roadmap/[id]/route.ts`, `app/api/roadmap/edges/route.ts`) already share parsing/validation helpers in `lib/api/*`, but still embed SQL orchestration in route files.
- Opportunity:
  - extract “orchestration” into `lib/media/*` and/or `lib/api/media/*` while keeping each `app/api/*/route.ts` responsible only for:
    - auth/session check
    - calling the extracted function
    - mapping returned values/errors to `NextResponse`
  - for roadmap endpoints, similarly move route SQL blocks into `lib/roadmap/api/*` (keeping function signatures aligned with existing validators)
- No behavior changes: keep the response shapes and status codes exactly the same; update imports only.

## 6. Standardize request/response helpers layout

- Current: request parsing/validation lives under `lib/api/*` (e.g. `lib/api/json.ts`, `lib/api/roadmap-validation.ts`).
- Opportunity:
  - create a small, consistent folder structure under `lib/api/`, e.g.:
    - `lib/api/parsers/*` (request body parsing)
    - `lib/api/validators/*` (payload validation)
    - `lib/api/errors/*` (error mapping utilities like `handleDbError`-adjacent functions)
- No behavior changes: move existing modules (or create thin wrapper re-exports) so all routes keep identical behavior.

## 7. Add missing barrel exports for roadmap subfolders

- Current: roadmap has `components/roadmap/index.ts` (admin/editor exports) and `components/roadmap/public/index.ts` (public exports). When reorganizing further into deeper folders (nodes/panels/public/admin), it's still easy to miss exports or create inconsistent import paths.
- Opportunity:
  - ensure each new roadmap subfolder has an `index.ts` barrel where appropriate
  - keep top-level feature exports stable (or provide compatibility re-exports)
- No behavior changes: only module exports/import paths change.

## 8. Documentation organization for feature-focused navigation

- Current:
  - roadmap refactoring notes live in `docs/roadmap-refactoring-review.md`
  - recent roadmap folder/module re-org notes live in `docs/folder-module-reorg-opportunities.md`
  - broad refactoring notes live in `docs/refactoring-review.md`
  - additional learning/testing/security docs exist at the root of `docs/`
- Opportunity:
  - introduce subfolders like:
    - `docs/roadmap/` (move roadmap-related review docs)
    - `docs/testing/` (consolidate testing plan/security scan/testing guidance)
- No behavior changes: docs-only move; update links if any are referenced.

## 9. (Optional) Reduce casting hotspots by isolating mapping types

- Current: `components/roadmap/roadmapFlowMapper.ts` uses `as unknown as FlowNode[]` when returning nodes.
- Opportunity:
  - reorganize/types-only refactor to centralize mapping typing so future node contracts fail earlier during development
- No behavior changes: keep the runtime returned objects identical; adjust only types/module boundaries.
