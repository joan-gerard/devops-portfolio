-- docker/seed/seed.sql
-- Idempotent development seed data for local Docker Compose environments.
-- Safe to run repeatedly; updates existing records in place.

BEGIN;

-- -----------------------------------------------------------------------------
-- Seed notes/pages
-- -----------------------------------------------------------------------------
INSERT INTO pages (id, title, slug, content, tags, published, e2e_only)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Docker Fundamentals',
    'docker-fundamentals',
    '{
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Seeded note for local Docker development." }]
        }
      ]
    }'::jsonb,
    ARRAY['docker', 'containers', 'devops'],
    TRUE,
    FALSE
  ),
  (
    '11111111-1111-1111-1111-111111111112',
    'CI/CD Pipeline Basics',
    'ci-cd-pipeline-basics',
    '{
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Seeded CI/CD note used by roadmap links." }]
        }
      ]
    }'::jsonb,
    ARRAY['ci-cd', 'automation'],
    TRUE,
    FALSE
  ),
  (
    '11111111-1111-1111-1111-111111111113',
    'About Me',
    'about',
    '{
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "TEST",
              "type": "text"
            }
          ]
        }
      ]
    }'::jsonb,
    ARRAY['about', 'portfolio'],
    TRUE,
    FALSE
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  e2e_only = EXCLUDED.e2e_only;

-- -----------------------------------------------------------------------------
-- Seed projects
-- -----------------------------------------------------------------------------
INSERT INTO projects (
  id,
  title,
  slug,
  description,
  tech_stack,
  github_url,
  live_url,
  published,
  e2e_only
)
VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    'DevOps Portfolio',
    'devops-portfolio',
    'Seeded local project used to verify public project cards and roadmap links.',
    ARRAY['Next.js', 'Docker', 'PostgreSQL'],
    'https://github.com/example/devops-portfolio',
    'https://example.com/devops-portfolio',
    TRUE,
    FALSE
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Infrastructure Playground',
    'infrastructure-playground',
    'Sample infrastructure project for local development demos.',
    ARRAY['Terraform', 'AWS', 'GitHub Actions'],
    'https://github.com/example/infrastructure-playground',
    NULL,
    TRUE,
    FALSE
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tech_stack = EXCLUDED.tech_stack,
  github_url = EXCLUDED.github_url,
  live_url = EXCLUDED.live_url,
  published = EXCLUDED.published,
  e2e_only = EXCLUDED.e2e_only;

-- -----------------------------------------------------------------------------
-- Seed roadmap nodes
-- -----------------------------------------------------------------------------
INSERT INTO roadmap_items (
  id,
  title,
  description,
  type,
  status,
  position_x,
  position_y,
  linked_page_id,
  is_group_completed,
  e2e_only
)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    'Learning Path',
    'Grouped milestones for the Dockerized local environment.',
    'group',
    'in_progress',
    80,
    80,
    NULL,
    FALSE,
    FALSE
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Read Docker Fundamentals',
    'Study container basics and image lifecycle.',
    'learning',
    'completed',
    360,
    40,
    (SELECT id FROM pages WHERE slug = 'docker-fundamentals'),
    FALSE,
    FALSE
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Implement CI/CD',
    'Apply CI/CD workflow ideas to the app.',
    'learning',
    'in_progress',
    360,
    180,
    (SELECT id FROM pages WHERE slug = 'ci-cd-pipeline-basics'),
    FALSE,
    FALSE
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    'Ship Portfolio MVP',
    'Publish and validate deployment workflow.',
    'project',
    'not_started',
    640,
    110,
    (SELECT id FROM projects WHERE slug = 'devops-portfolio'),
    FALSE,
    FALSE
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  position_x = EXCLUDED.position_x,
  position_y = EXCLUDED.position_y,
  linked_page_id = EXCLUDED.linked_page_id,
  is_group_completed = EXCLUDED.is_group_completed,
  e2e_only = EXCLUDED.e2e_only;

-- -----------------------------------------------------------------------------
-- Seed roadmap edges
-- -----------------------------------------------------------------------------
INSERT INTO roadmap_edges (id, source_id, target_id, source_handle, target_handle)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '33333333-3333-3333-3333-333333333332',
    NULL,
    NULL
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333332',
    '33333333-3333-3333-3333-333333333333',
    NULL,
    NULL
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333334',
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE
SET
  source_id = EXCLUDED.source_id,
  target_id = EXCLUDED.target_id,
  source_handle = EXCLUDED.source_handle,
  target_handle = EXCLUDED.target_handle;

COMMIT;
