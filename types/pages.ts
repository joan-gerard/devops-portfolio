/**
 * Page/note from the pages table.
 * `content` and `created_at` are omitted in list queries (getAllPages) and
 * present in single-row queries (getPageById, getNoteBySlug).
 */
export type Page = {
  id: string;
  title: string;
  slug: string;
  content?: Record<string, unknown>;
  tags: string[];
  published: boolean;
  created_at?: string;
  updated_at: string;
};
