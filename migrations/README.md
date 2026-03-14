# Migrations

Plain SQL migration files, run in order against Neon.

| File         | Description                             |
| ------------ | --------------------------------------- |
| 001_init.sql | Initial schema — pages, projects, media |

## Running a migration

NB: You need to copy/paste the actual $DATABASE_URL
NB: Keep the double quotation marks

psql "$DATABASE_URL" -f migrations/001_init.sql
