-- Add short summary field for public listing cards.
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS summary TEXT NOT NULL DEFAULT '';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS summary TEXT NOT NULL DEFAULT '';
