import sql from "@/lib/db";
import { withPrerenderFallback } from "@/lib/db-errors";
import { Page, PublicNote, PublishedNotePreview } from "@/types/pages";
import { cache } from "react";

const isE2ETestRuntime = process.env.E2E_TEST === "1";

export async function getAllPages() {
  return sql<Page[]>`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.tags,
      p.published,
      p.updated_at,
      p.e2e_only,
      r.id AS roadmap_item_id,
      r.status AS roadmap_item_status,
      r.title AS roadmap_item_title
    FROM pages p
    LEFT JOIN LATERAL (
      SELECT id, status, title
      FROM roadmap_items
      WHERE linked_page_id = p.id
      ORDER BY updated_at DESC
      LIMIT 1
    ) r ON true
    ORDER BY p.updated_at DESC
  `;
}

export async function getPageById(id: string): Promise<Page | null> {
  const rows = await sql<Page[]>`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.content,
      p.tags,
      p.published,
      p.created_at,
      p.updated_at,
      p.e2e_only,
      r.id AS roadmap_item_id,
      r.status AS roadmap_item_status,
      r.title AS roadmap_item_title
    FROM pages p
    LEFT JOIN LATERAL (
      SELECT id, status, title
      FROM roadmap_items
      WHERE linked_page_id = p.id
      ORDER BY updated_at DESC
      LIMIT 1
    ) r ON true
    WHERE p.id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Fetches a published note by slug (e.g. "about").
 *
 * During prerender builds (IS_PRERENDER_BUILD === "true"), if the database
 * is unavailable (connection or aggregate error), returns null so the page
 * can render its fallback state and the build succeeds.
 */
export const getNoteBySlug = cache(async (slug: string): Promise<PublicNote | null> => {
  return withPrerenderFallback(
    async () => {
      const rows = await sql<PublicNote[]>`
        SELECT id, title, slug, content, tags, updated_at
        FROM pages
        WHERE slug = ${slug}
          AND published = true
          ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
        LIMIT 1
      `;
      const note = rows[0] ?? null;
      return note;
    },
    null,
    `[getNoteBySlug] DB unavailable during prerender build — returning null. Slug: ${slug}.`
  );
});

export async function getAllPublishedNotes(): Promise<PublishedNotePreview[]> {
  return withPrerenderFallback<PublishedNotePreview[]>(
    () =>
      sql<PublishedNotePreview[]>`
        SELECT id, title, slug, tags, updated_at
        FROM pages
        WHERE published = true
          AND slug != 'about'
          ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
        ORDER BY updated_at DESC
      `,
    [],
    "[getAllPublishedNotes] DB unavailable during prerender build — returning empty list."
  );
}
