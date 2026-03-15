-- migrations/007_roadmap_group_type.sql
-- Add a "group" node type for organisational nodes (no status/link, just structure).

ALTER TYPE roadmap_item_type ADD VALUE 'group';
