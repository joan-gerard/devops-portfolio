"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapEdge } from "@/types/roadmap";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnConnect,
  type OnEdgesDelete,
  type OnNodeDrag,
  type OnNodesDelete,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import { AdminRoadmapNode } from "./AdminRoadmapNode";
import { AdminRoadmapSidePanel } from "./AdminRoadmapSidePanel";

const nodeTypes = { adminRoadmapNode: AdminRoadmapNode };

interface Props {
  initialItems: RoadmapItemWithSlug[];
  initialEdges: RoadmapEdge[];
}

function toFlowNode(item: RoadmapItemWithSlug, selectedId: string | null): Node {
  return {
    id: item.id,
    type: "adminRoadmapNode",
    position: { x: item.position_x, y: item.position_y },
    data: item as unknown as Record<string, unknown>,
    selected: item.id === selectedId,
  };
}

function toFlowEdge(edge: RoadmapEdge): Edge {
  return {
    id: edge.id,
    source: edge.source_id,
    target: edge.target_id,
    sourceHandle: edge.source_handle,
    targetHandle: edge.target_handle,
    style: { stroke: "var(--border)", strokeWidth: 1.5 },
    interactionWidth: 20,
    animated: false,
  };
}

export function RoadmapEditor({ initialItems, initialEdges }: Props) {
  // itemsById is the metadata source of truth — updated on every successful PATCH
  const [itemsById, setItemsById] = useState<Record<string, RoadmapItemWithSlug>>(() =>
    Object.fromEntries(initialItems.map((i) => [i.id, i]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = selectedId ? (itemsById[selectedId] ?? null) : null;

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialItems.map((i) => toFlowNode(i, null))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(toFlowEdge));

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          stroke: edge.selected ? "var(--accent)" : "var(--border)",
          strokeWidth: edge.selected ? 2 : 1.5,
        },
      })),
    [edges]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handlePaneClick = useCallback(() => setSelectedId(null), []);

  const handleNodeDragStop: OnNodeDrag = useCallback((_event: unknown, node: Node) => {
    fetch(`/api/roadmap/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        position_x: node.position.x,
        position_y: node.position.y,
      }),
    }).catch((err) => console.error("[RoadmapEditor] Failed to save position", err));
  }, []);

  const handleConnect: OnConnect = useCallback(
    async (connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target) return;

      const res = await fetch("/api/roadmap/edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_id: source,
          target_id: target,
          source_handle: sourceHandle,
          target_handle: targetHandle,
        }),
      });

      if (!res.ok) {
        console.error("[RoadmapEditor] Failed to create edge");
        return;
      }

      const newEdge: RoadmapEdge = await res.json();
      setEdges((prev) => [...prev, toFlowEdge(newEdge)]);
    },
    [setEdges]
  );

  const handleEdgesDelete: OnEdgesDelete = useCallback(async (deletedEdges) => {
    await Promise.all(
      deletedEdges.map((edge) =>
        fetch(`/api/roadmap/edges/${edge.id}`, { method: "DELETE" }).catch((err) =>
          console.error("[RoadmapEditor] Failed to delete edge", err)
        )
      )
    );
  }, []);

  const handleNodesDelete: OnNodesDelete = useCallback(
    async (deletedNodes) => {
      await Promise.all(
        deletedNodes.map((node) =>
          fetch(`/api/roadmap/${node.id}`, { method: "DELETE" }).catch((err) =>
            console.error("[RoadmapEditor] Failed to delete node", err)
          )
        )
      );
      setItemsById((prev) => {
        const next = { ...prev };
        deletedNodes.forEach((n) => delete next[n.id]);
        return next;
      });
      if (deletedNodes.some((n) => n.id === selectedId)) setSelectedId(null);
    },
    [selectedId]
  );

  // ── Item update (from side panel PATCH) ──────────────────────────────────

  const handleItemUpdate = useCallback(
    (updated: RoadmapItemWithSlug) => {
      setItemsById((prev) => ({ ...prev, [updated.id]: updated }));
      setNodes(
        (nds: Node[]) =>
          nds.map((n: Node) =>
            n.id === updated.id ? { ...n, data: updated, selected: true } : n
          ) as Node[]
      );
    },
    [setNodes]
  );

  // ── Delete from side panel ────────────────────────────────────────────────

  const handleDeleteNode = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/roadmap/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setItemsById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSelectedId(null);
    },
    [setNodes, setEdges]
  );

  // ── Add node ──────────────────────────────────────────────────────────────

  const [isAdding, setIsAdding] = useState(false);

  async function handleAddNode(nodeType: "learning" | "project" | "group" = "learning") {
    setIsAdding(true);
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nodeType === "group" ? "New group" : "New Node",
        type: nodeType,
        position_x: 80 + Math.random() * 280,
        position_y: 80 + Math.random() * 280,
      }),
    });
    setIsAdding(false);

    if (!res.ok) {
      console.error("[RoadmapEditor] Failed to create node");
      return;
    }

    const newItem: RoadmapItemWithSlug = {
      ...(await res.json()),
      linked_page_slug: null,
    };

    setItemsById((prev) => ({ ...prev, [newItem.id]: newItem }));
    setNodes((prev) => [...prev, toFlowNode(newItem, newItem.id)]);
    setSelectedId(newItem.id);
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        onNodesDelete={handleNodesDelete}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={["Delete", "Backspace"]}
        style={{ background: "var(--bg)" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border)" />
        <Controls
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
          }}
        />

        {/* Toolbar */}
        <Panel position="top-left">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => handleAddNode("learning")}
              disabled={isAdding}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                cursor: isAdding ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "8px 14px",
                opacity: isAdding ? 0.6 : 1,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isAdding)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              {isAdding ? "Adding…" : "+ Learning"}
            </button>
            <button
              onClick={() => handleAddNode("project")}
              disabled={isAdding}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                cursor: isAdding ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "8px 14px",
                opacity: isAdding ? 0.6 : 1,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isAdding)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              {isAdding ? "Adding…" : "+ Project"}
            </button>
            <button
              onClick={() => handleAddNode("group")}
              disabled={isAdding}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                cursor: isAdding ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "8px 14px",
                opacity: isAdding ? 0.6 : 1,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isAdding)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              {isAdding ? "Adding…" : "+ Group"}
            </button>
          </div>
        </Panel>
      </ReactFlow>

      <AdminRoadmapSidePanel
        item={selectedItem}
        onClose={() => setSelectedId(null)}
        onUpdate={handleItemUpdate}
        onDelete={handleDeleteNode}
      />
    </div>
  );
}
