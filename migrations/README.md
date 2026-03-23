# Migrations

Plain SQL migration files, run in order against Neon.

| File                                      | Description                                               |
| ----------------------------------------- | --------------------------------------------------------- |
| 001_init.sql                              | Initial schema — pages, projects, media                   |
| 002_login_attempts.sql                    | Login rate-limiting table (ip, attempts, window_start)    |
| 003_e2e_only_flag.sql                     | Add `e2e_only` flag to pages and projects (E2E test data) |
| 004_remove_e2e_only_rows.sql              | Delete rows where e2e_only = true (clean test data)       |
| 005_roadmap.sql                           | Roadmap graph — roadmap_items, roadmap_edges, enums       |
| 006_roadmap_edge_handles.sql              | Add source_handle, target_handle to roadmap_edges         |
| 007_roadmap_group_type.sql                | Add roadmap node type `group` for organisation            |
| 008_roadmap_group_completed.sql           | Add `is_group_completed` flag to roadmap_items            |
| 009_roadmap_e2e_only.sql                  | Add `e2e_only` flag to roadmap_items for test isolation   |
| 010_add_summary_to_pages_and_projects.sql | Add `summary` column to pages and projects                |

## Running a migration

Run in order. Replace `$DATABASE_URL` with your connection string (keep the double quotes):

```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
```
