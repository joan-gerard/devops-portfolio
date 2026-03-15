"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapEdge } from "@/types/roadmap";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { RoadmapNode } from "./RoadmapNode";

const nodeTypes = { roadmapNode: RoadmapNode };

interface Props {
  items: RoadmapItemWithSlug[];
  edges: RoadmapEdge[];
}

export function RoadmapCanvas({ items, edges }: Props) {
  const nodes = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        type: "roadmapNode",
        position: { x: item.position_x, y: item.position_y },
        data: item,
        draggable: false, // public view is read-only
      })) as unknown as Node[],
    [items]
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        style: { stroke: "var(--border)", strokeWidth: 1.5 },
        animated: false,
      })),
    [edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: false }}
      style={{ background: "var(--bg)" }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border)" />
      <Controls
        showInteractive={false}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      />
      <MiniMap
        nodeColor={(node) => {
          const status = (node.data as unknown as RoadmapItemWithSlug).status;
          if (status === "completed") return "var(--accent)";
          if (status === "in_progress") return "var(--accent-2)";
          return "var(--border)";
        }}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
        maskColor="rgba(0,0,0,0.4)"
      />
    </ReactFlow>
  );
}
