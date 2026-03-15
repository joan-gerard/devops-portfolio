# Migrations

Plain SQL migration files, run in order against Neon.

| File                         | Description                                               |
| ---------------------------- | --------------------------------------------------------- |
| 001_init.sql                 | Initial schema — pages, projects, media                   |
| 002_login_attempts.sql       | Login rate-limiting table (ip, attempts, window_start)    |
| 003_e2e_only_flag.sql        | Add `e2e_only` flag to pages and projects (E2E test data) |
| 004_remove_e2e_only_rows.sql | Delete rows where e2e_only = true (clean test data)       |
| 005_roadmap.sql              | Roadmap graph — roadmap_items, roadmap_edges, enums       |
| 006_roadmap_edge_handles.sql | Add source_handle, target_handle to roadmap_edges         |
| 007_roadmap_group_type.sql   | Add roadmap node type `group` for organisation            |

## Running a migration

Run in order. Replace `$DATABASE_URL` with your connection string (keep the double quotes):

```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
```
