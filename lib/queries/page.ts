import sql from "@/lib/db";
import { isConnectionErrorOrAggregate } from "@/lib/db-errors";
import { Page, PublicNote, PublishedNotePreview } from "@/types/pages";

export async function getAllPages() {
  return sql<Page[]>`
    SELECT id, title, slug, tags, published, updated_at
    FROM pages
    ORDER BY updated_at DESC
  `;
}

export async function getPageById(id: string): Promise<Page | null> {
  const rows = await sql<Page[]>`
    SELECT id, title, slug, content, tags, published, created_at, updated_at
    FROM pages
    WHERE id = ${id}
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
export async function getNoteBySlug(slug: string): Promise<PublicNote | null> {
  try {
    console.log("[getNoteBySlug] called with slug:", slug);
    const rows = await sql<PublicNote[]>`
      SELECT id, title, slug, content, tags, updated_at
      FROM pages
      WHERE slug = ${slug}
        AND published = true
      LIMIT 1
    `;
    // return rows[0] ?? null;

    const note = rows[0] ?? null;
    console.log(
      "[getNoteBySlug] result:",
      note ? { id: note.id, slug: note.slug, published: true } : null
    );
    return note;
  } catch (error) {
    const isPrerenderBuild = process.env.IS_PRERENDER_BUILD === "true";
    if (isPrerenderBuild && isConnectionErrorOrAggregate(error)) {
      const summary =
        error instanceof Error ? error.message.slice(0, 120) : String(error).slice(0, 120);
      console.warn(
        "[getNoteBySlug] DB unavailable during prerender build — returning null.",
        `Slug: ${slug}. Reason: ${summary}`
      );
      return null;
    }
    throw error;
  }
}

export async function getAllPublishedNotes(): Promise<PublishedNotePreview[]> {
  try {
    return await sql<PublishedNotePreview[]>`
      SELECT id, title, slug, tags, updated_at
      FROM pages
      WHERE published = true
        AND slug != 'about'
      ORDER BY updated_at DESC
    `;
  } catch (error) {
    const isPrerenderBuild = process.env.IS_PRERENDER_BUILD === "true";
    if (isPrerenderBuild && isConnectionErrorOrAggregate(error)) {
      const summary =
        error instanceof Error ? error.message.slice(0, 120) : String(error).slice(0, 120);
      console.warn(
        "[getAllPublishedNotes] DB unavailable during prerender build — returning empty list.",
        `Reason: ${summary}`
      );
      return [];
    }
    throw error;
  }
}
