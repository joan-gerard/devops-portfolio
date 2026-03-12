-- migrations/003_e2e_only_flag.sql
--
-- Add an `e2e_only` flag to notes (pages) and projects so that
-- content created during automated end-to-end tests can be excluded
-- from public views when the app is not running in E2E mode.

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS e2e_only BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS e2e_only BOOLEAN NOT NULL DEFAULT FALSE;

