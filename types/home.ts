/**
 * Types used by the public homepage.
 * These represent the shape of data returned by home-specific queries.
 */

export type RecentNote = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  updated_at: string;
};

export type FeaturedProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
};

export type RoadmapPhase = {
  num: string;
  label: string;
  done: boolean;
};
