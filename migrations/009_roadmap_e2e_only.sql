-- migrations/009_roadmap_e2e_only.sql
-- Add an `e2e_only` flag to roadmap_items so E2E-created
-- roadmap nodes can be hidden from normal admin/public views.

ALTER TABLE roadmap_items
  ADD COLUMN IF NOT EXISTS e2e_only BOOLEAN NOT NULL DEFAULT FALSE;

