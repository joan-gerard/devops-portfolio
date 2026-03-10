import sql from "@/lib/db";
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

export async function getNoteBySlug(slug: string): Promise<PublicNote | null> {
  const rows = await sql<PublicNote[]>`
    SELECT id, title, slug, content, tags, updated_at
    FROM pages
    WHERE slug = ${slug}
      AND published = true
    LIMIT 1
  `;
  return rows[0] ?? null;
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
  } catch {
    return [];
  }
}
