# Migrations

Plain SQL migration files, run in order against Neon.

| File         | Description                             |
| ------------ | --------------------------------------- |
| 001_init.sql | Initial schema — pages, projects, media |

## Running a migration

psql "$DATABASE_URL" -f migrations/001_init.sql
