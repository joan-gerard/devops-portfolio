export type Project = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  /**
   * True when the project was created/published by E2E tests. Used to separate
   * test content from real portfolio entries and hide it from public views.
   */
  e2e_only?: boolean;
  roadmap_item_id?: string | null;
  roadmap_item_status?: "not_started" | "in_progress" | "completed" | null;
  roadmap_item_title?: string | null;
};

export type PublicProject = Omit<Project, "published" | "created_at">;
