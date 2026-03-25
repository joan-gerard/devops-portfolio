export type RoadmapItemType = "learning" | "project" | "group";
export type RoadmapItemStatus = "not_started" | "in_progress" | "completed";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  type: RoadmapItemType;
  status: RoadmapItemStatus;
  position_x: number;
  position_y: number;
  linked_page_id: string | null;
  is_group_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  e2e_only?: boolean;
}

export interface RoadmapEdge {
  id: string;
  source_id: string;
  target_id: string;
  source_handle: string | null;
  target_handle: string | null;
  created_at: string;
}

/** Base shape returned by GET /api/roadmap (API-level, without slugs) */
export interface RoadmapData {
  items: RoadmapItem[];
  edges: RoadmapEdge[];
}

/** Roadmap item including resolved linked page slug for UI/query layer */
export interface RoadmapItemWithSlug extends RoadmapItem {
  linked_page_slug: string | null;
  linked_page_type: "note" | "project" | null;
}

/** Shape returned by roadmap query helpers that include slugs */
export interface RoadmapDataWithSlug {
  items: RoadmapItemWithSlug[];
  edges: RoadmapEdge[];
}
