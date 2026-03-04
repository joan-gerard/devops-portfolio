export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};
