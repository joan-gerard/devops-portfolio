export type Page = {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};
