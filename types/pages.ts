/**
 * Page/note from the pages table.
 * `content` and `created_at` are omitted in list queries (getAllPages) and
 * present in single-row queries (getPageById, getNoteBySlug).
 *
 * `e2e_only` is used to tag content that was created/published by E2E tests so
 * it can be filtered or grouped in admin views and hidden from public views.
 */
export type Page = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: Record<string, unknown>;
  tags: string[];
  published: boolean;
  created_at?: string;
  updated_at: string;
  e2e_only?: boolean;
  roadmap_item_id?: string | null;
  roadmap_item_status?: "not_started" | "in_progress" | "completed" | null;
  roadmap_item_title?: string | null;
};

export type PublicNote = Omit<Page, "published" | "created_at">;

export type PublishedNotePreview = Pick<
  PublicNote,
  "id" | "title" | "slug" | "tags" | "updated_at"
>;
