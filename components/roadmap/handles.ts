/**
 * React Flow handle id "contract" for roadmap nodes.
 *
 * These ids must stay stable across both:
 * - the public node component (`RoadmapNode`)
 * - the admin/editor node component (`AdminRoadmapNode`)
 *
 * so edges created in the editor connect correctly when rendered in public mode.
 */
export const ROADMAP_NODE_HANDLE_IDS = {
  top: "top",
  left: "left",
  bottom: "bottom",
  right: "right",
} as const;

export type RoadmapNodeHandleId =
  (typeof ROADMAP_NODE_HANDLE_IDS)[keyof typeof ROADMAP_NODE_HANDLE_IDS];
