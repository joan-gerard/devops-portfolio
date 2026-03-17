"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapEdge } from "@/types/roadmap";
import {
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  ReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type ReactFlowInstance,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useRef, useState } from "react";
import { RoadmapNode } from "./RoadmapNode";
import { RoadmapSidePanel } from "./RoadmapSidePanel";

/** Fixed zoom level for the public roadmap (no zoom in/out). */
const PUBLIC_ROADMAP_ZOOM = 1;

/** Vertical padding from the top when aligning content to top. */
const TOP_PADDING = 24;

/** Vertical padding from the bottom when clamping scroll (extra space so bottom nodes aren't cut off). */
const BOTTOM_PADDING = 64;

/** Horizontal offset: content is shifted left of center by this many pixels. */
const CONTENT_LEFT_OFFSET = -50;

const nodeTypes = { roadmapNode: RoadmapNode };

interface ContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ContainerSize {
  width: number;
  height: number;
}

interface Props {
  items: RoadmapItemWithSlug[];
  edges: RoadmapEdge[];
}

const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: PUBLIC_ROADMAP_ZOOM,
};

function clampViewport(
  viewport: Viewport,
  bounds: ContentBounds,
  container: ContainerSize
): Viewport {
  const zoom = viewport.zoom;
  // Max Y: top of content must not go below top of viewport (no scrolling up past top)
  const maxY = TOP_PADDING - bounds.y * zoom;
  // Min Y: bottom of content must not go above bottom of viewport (no scrolling down past bottom)
  const minY = container.height - BOTTOM_PADDING - (bounds.y + bounds.height) * zoom;
  const y = Math.max(minY, Math.min(maxY, viewport.y));
  return { ...viewport, y };
}

export function RoadmapCanvas({ items, edges }: Props) {
  const [selectedItem, setSelectedItem] = useState<RoadmapItemWithSlug | null>(null);
  const [viewport, setViewportState] = useState<Viewport>(defaultViewport);
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<ContentBounds | null>(null);
  const containerSizeRef = useRef<ContainerSize | null>(null);
  const initialViewportXRef = useRef<number>(0);

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    requestAnimationFrame(() => {
      const flowNodes = instance.getNodes();
      if (flowNodes.length === 0) return;
      const bounds = instance.getNodesBounds(flowNodes);
      const zoom = PUBLIC_ROADMAP_ZOOM;
      const el = containerRef.current;
      const width = el?.clientWidth ?? 800;
      const height = el?.clientHeight ?? 600;
      boundsRef.current = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      };
      containerSizeRef.current = { width, height };
      const viewportY = TOP_PADDING - bounds.y * zoom;
      const viewportX = width / 2 - (bounds.x + bounds.width / 2) * zoom + CONTENT_LEFT_OFFSET;
      initialViewportXRef.current = viewportX;
      const nextViewport: Viewport = { x: viewportX, y: viewportY, zoom };
      setViewportState(nextViewport);
    });
  }, []);

  const handleViewportChange = useCallback((next: Viewport) => {
    const bounds = boundsRef.current;
    const container = containerSizeRef.current;
    if (bounds && container) {
      const clamped = clampViewport(next, bounds, container);
      setViewportState({
        ...clamped,
        x: initialViewportXRef.current,
      });
    } else {
      setViewportState(next);
    }
  }, []);

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
          type: "smoothstep",
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
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", background: "red !important" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onInit={handleInit}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        minZoom={PUBLIC_ROADMAP_ZOOM}
        maxZoom={PUBLIC_ROADMAP_ZOOM}
        panOnDrag={false}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Vertical}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        zoomActivationKeyCode={null}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: false }}
        style={{ background: "var(--bg)" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border)" />
      </ReactFlow>
      <RoadmapSidePanel item={selectedItem} onClose={handleClose} />
    </div>
  );
}
