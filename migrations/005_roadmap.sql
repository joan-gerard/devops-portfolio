-- migrations/005_roadmap.sql
-- Roadmap graph: nodes and directed dependency edges.

-- ── Enums ──────────────────────────────────────────────────────────────────────

CREATE TYPE roadmap_item_type   AS ENUM ('learning', 'project');
CREATE TYPE roadmap_item_status AS ENUM ('not_started', 'in_progress', 'completed');

-- ── roadmap_items ──────────────────────────────────────────────────────────────
-- Each row is a node on the React Flow canvas.
-- position_x / position_y are stored so the admin can drag nodes and persist layout.
-- linked_page_id is a soft reference — no FK constraint so deleting a note does not
-- cascade-delete a roadmap node. The application layer handles the null case.

CREATE TABLE roadmap_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  description    TEXT,
  type           roadmap_item_type   NOT NULL DEFAULT 'learning',
  status         roadmap_item_status NOT NULL DEFAULT 'not_started',
  position_x     FLOAT       NOT NULL DEFAULT 0,
  position_y     FLOAT       NOT NULL DEFAULT 0,
  linked_page_id UUID,                          -- soft ref → pages.id or projects.id
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── roadmap_edges ──────────────────────────────────────────────────────────────
-- Each row is a directed dependency: source → target means "complete source before target".
-- Stored separately from roadmap_items so the graph structure is queryable without
-- array operators and edges can carry metadata (label, style) in future without
-- schema changes to the nodes table.

CREATE TABLE roadmap_edges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES roadmap_items(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES roadmap_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT roadmap_edges_no_self_loop CHECK (source_id <> target_id),
  CONSTRAINT roadmap_edges_unique       UNIQUE (source_id, target_id)
);

-- ── Indexes ────────────────────────────────────────────────────────────────────

-- GET /api/roadmap fetches all items ordered by status then position — this index
-- supports the status filter used in the public roadmap page.
CREATE INDEX idx_roadmap_items_status ON roadmap_items(status);

-- Edge lookups: find all edges where a given node is the source or target.
CREATE INDEX idx_roadmap_edges_source ON roadmap_edges(source_id);
CREATE INDEX idx_roadmap_edges_target ON roadmap_edges(target_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Keeps updated_at current on every PATCH without requiring the application layer
-- to pass the timestamp explicitly.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER roadmap_items_updated_at
  BEFORE UPDATE ON roadmap_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();