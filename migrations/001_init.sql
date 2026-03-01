-- migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes / learning pages
CREATE TABLE pages (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT        NOT NULL DEFAULT 'Untitled',
  slug        TEXT        NOT NULL UNIQUE,
  content     JSONB       NOT NULL DEFAULT '{}',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  published   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects showcase
CREATE TABLE projects (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT        NOT NULL,
  slug         TEXT        NOT NULL UNIQUE,
  description  TEXT        NOT NULL DEFAULT '',
  tech_stack   TEXT[]      NOT NULL DEFAULT '{}',
  github_url   TEXT,
  live_url     TEXT,
  published    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media / file uploads (pointing to Cloudflare R2)
CREATE TABLE media (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename     TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  size         INTEGER     NOT NULL DEFAULT 0,
  linked_to    UUID,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();