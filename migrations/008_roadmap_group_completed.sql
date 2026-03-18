-- migrations/008_roadmap_group_completed.sql
-- Add a completion flag specifically for group nodes so their
-- visual treatment (e.g. border colour) can reflect completion.

ALTER TABLE roadmap_items
ADD COLUMN IF NOT EXISTS is_group_completed BOOLEAN NOT NULL DEFAULT FALSE;

