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
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import { RoadmapNode } from "./RoadmapNode";
import { RoadmapSidePanel } from "./RoadmapSidePanel";

const nodeTypes = { roadmapNode: RoadmapNode };

interface Props {
  items: RoadmapItemWithSlug[];
  edges: RoadmapEdge[];
}

export function RoadmapCanvas({ items, edges }: Props) {
  const [selectedItem, setSelectedItem] = useState<RoadmapItemWithSlug | null>(null);
  const nodes = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        type: "roadmapNode",
        position: { x: item.position_x, y: item.position_y },
        data: item,
        draggable: false, // public view is read-only
        selected: selectedItem?.id === item.id,
      })) as unknown as Node[],
    [items, selectedItem]
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => {
        const flowEdge: Edge = {
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          style: { stroke: "var(--border)", strokeWidth: 1.5 },
          animated: false,
        };
        if (edge.source_handle != null) flowEdge.sourceHandle = edge.source_handle;
        if (edge.target_handle != null) flowEdge.targetHandle = edge.target_handle;
        return flowEdge;
      }),
    [edges]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const item = items.find((i) => i.id === node.id) ?? null;
      // Clicking the already-selected node closes the panel
      setSelectedItem((prev) => (prev?.id === item?.id ? null : item));
    },
    [items]
  );

  const handleClose = useCallback(() => setSelectedItem(null), []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
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
            const item = node.data as unknown as RoadmapItemWithSlug;
            if (item.type === "group") return "var(--text-muted)";
            const status = item.status;
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
      <RoadmapSidePanel item={selectedItem} onClose={handleClose} />
    </div>
  );
}
