export type RoadmapItemType = "learning" | "project";
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
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapEdge {
  id: string;
  source_id: string;
  target_id: string;
  source_handle: string | null;
  target_handle: string | null;
  created_at: string;
}

/** Shape returned by GET /api/roadmap */
export interface RoadmapData {
  items: RoadmapItem[];
  edges: RoadmapEdge[];
}
