-- migrations/004_remove_e2e_only_rows.sql
--
-- Remove all rows from pages and projects that were created by E2E tests
-- (e2e_only = true). Run this to clean up test data from a shared database.

DELETE FROM pages
WHERE e2e_only = true;

DELETE FROM projects
WHERE e2e_only = true;
