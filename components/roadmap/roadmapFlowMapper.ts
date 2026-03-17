import type { Edge as FlowEdge, Node as FlowNode } from "@xyflow/react";
import type { RoadmapItemWithSlug, RoadmapEdge } from "@/types/roadmap";

export function toPublicFlowNodes(
  items: RoadmapItemWithSlug[],
  selectedId: string | null
): FlowNode[] {
  return items.map((item) => ({
    id: item.id,
    type: "roadmapNode",
    position: { x: item.position_x, y: item.position_y },
    data: item,
    draggable: false,
    selected: selectedId === item.id,
  })) as unknown as FlowNode[];
}

export function toAdminFlowNodes(
  items: RoadmapItemWithSlug[],
  selectedId: string | null
): FlowNode[] {
  return items.map((item) => ({
    id: item.id,
    type: "adminRoadmapNode",
    position: { x: item.position_x, y: item.position_y },
    data: item as unknown as Record<string, unknown>,
    selected: selectedId === item.id,
  })) as unknown as FlowNode[];
}

export function toFlowEdges(edges: RoadmapEdge[]): FlowEdge[] {
  return edges.map((edge) => {
    const isSideToSide =
      (edge.source_handle === "left" || edge.source_handle === "right") &&
      (edge.target_handle === "left" || edge.target_handle === "right");

    const flowEdge: FlowEdge = {
      id: edge.id,
      source: edge.source_id,
      target: edge.target_id,
      style: { stroke: "var(--border)", strokeWidth: 1.5 },
      interactionWidth: 20,
      animated: false,
      type: isSideToSide ? "straight" : "smoothstep",
    };

    if (edge.source_handle != null) {
      flowEdge.sourceHandle = edge.source_handle;
    }
    if (edge.target_handle != null) {
      flowEdge.targetHandle = edge.target_handle;
    }

    return flowEdge;
  });
}
