"use client";

import type { RoadmapEdge, RoadmapItemWithSlug } from "@/types/roadmap";
import {
  ROADMAP_BACKGROUND_COLOR,
  ROADMAP_BACKGROUND_GAP,
  ROADMAP_BACKGROUND_SIZE,
  ROADMAP_BACKGROUND_VARIANT,
  ROADMAP_PRO_OPTIONS,
} from "@/components/roadmap/roadmapFlowConfig";
import { toAdminFlowNodes, toFlowEdges } from "@/components/roadmap/roadmapFlowMapper";
import {
  Background,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRoadmapSaveStatus } from "@/hooks/useRoadmapSaveStatus";
import { AdminRoadmapNode } from "@/components/roadmap/nodes/admin/AdminRoadmapNode";
import { AdminRoadmapSidePanel } from "@/components/roadmap/panels/admin/AdminRoadmapSidePanel";
import { ViewportZoomDisplay } from "./ViewportZoomDisplay";

const nodeTypes = { adminRoadmapNode: AdminRoadmapNode };
const ROADMAP_INTERACTIVITY_STORAGE_KEY = "devops-portfolio:roadmap-editor:isInteractive";

interface Props {
  initialItems: RoadmapItemWithSlug[];
  initialEdges: RoadmapEdge[];
}

export function RoadmapEditor({ initialItems, initialEdges }: Props) {
  // itemsById is the metadata source of truth — updated on every successful PATCH
  const [itemsById, setItemsById] = useState<Record<string, RoadmapItemWithSlug>>(() =>
    Object.fromEntries(initialItems.map((i) => [i.id, i]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw = window.localStorage.getItem(ROADMAP_INTERACTIVITY_STORAGE_KEY);
      if (raw == null) return true;
      const parsed = JSON.parse(raw) as unknown;
      return typeof parsed === "boolean" ? parsed : true;
    } catch {
      return true;
    }
  });

  const selectedItem = selectedId ? (itemsById[selectedId] ?? null) : null;

  const [nodes, setNodes, onNodesChange] = useNodesState(
    toAdminFlowNodes(initialItems, null) as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initialEdges) as Edge[]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ROADMAP_INTERACTIVITY_STORAGE_KEY, JSON.stringify(isInteractive));
    } catch (err) {
      console.warn("[RoadmapEditor] Failed to persist interactivity setting", err);
    }
  }, [isInteractive]);

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

  const { saveStatus, beginSaving, finishSaving } = useRoadmapSaveStatus();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handlePaneClick = useCallback(() => setSelectedId(null), []);

  /**
   * "Magnetic" alignment while dragging:
   * - When a node's center is within a small threshold of another node's center on X or Y,
   *   snap its position to match that coordinate. This helps keep columns/rows visually aligned.
   */
  const handleNodeDrag: OnNodeDrag = useCallback(
    (_event: unknown, node: Node) => {
      const threshold = 16;

      setNodes((prev) => {
        const others = prev.filter((n) => n.id !== node.id);
        let { x, y } = node.position;

        for (const other of others) {
          if (Math.abs(other.position.x - x) <= threshold) x = other.position.x;
          if (Math.abs(other.position.y - y) <= threshold) y = other.position.y;
        }

        return prev.map((n) => (n.id === node.id ? { ...n, position: { x, y } } : n)) as Node[];
      });
    },
    [setNodes]
  );

  const handleNodeDragStop: OnNodeDrag = useCallback(
    async (_event: unknown, node: Node) => {
      beginSaving();
      try {
        const res = await fetch(`/api/roadmap/${node.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position_x: node.position.x,
            position_y: node.position.y,
          }),
        });
        if (!res.ok) {
          console.error("[RoadmapEditor] Failed to save position");
          finishSaving(false);
          return;
        }
        finishSaving(true);
      } catch (err) {
        console.error("[RoadmapEditor] Failed to save position", err);
        finishSaving(false);
      }
    },
    [beginSaving, finishSaving]
  );

  const handleConnect: OnConnect = useCallback(
    async (connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target) return;

      beginSaving();
      try {
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
          finishSaving(false);
          return;
        }

        const newEdge: RoadmapEdge = await res.json();
        setEdges((prev) => [...prev, ...(toFlowEdges([newEdge]) as Edge[])]);
        finishSaving(true);
      } catch (err) {
        console.error("[RoadmapEditor] Failed to create edge", err);
        finishSaving(false);
      }
    },
    [beginSaving, finishSaving, setEdges]
  );

  const handleEdgesDelete: OnEdgesDelete = useCallback(
    async (deletedEdges) => {
      if (!deletedEdges.length) return;
      beginSaving();
      try {
        const results = await Promise.all(
          deletedEdges.map((edge) =>
            fetch(`/api/roadmap/edges/${edge.id}`, { method: "DELETE" }).catch((err) => {
              console.error("[RoadmapEditor] Failed to delete edge", err);
              return null;
            })
          )
        );
        const ok = results.every((res) => res !== null && res.ok);
        finishSaving(ok);
      } catch (err) {
        console.error("[RoadmapEditor] Failed to delete edges", err);
        finishSaving(false);
      }
    },
    [beginSaving, finishSaving]
  );

  const handleNodesDelete: OnNodesDelete = useCallback(
    async (deletedNodes) => {
      if (!deletedNodes.length) return;
      beginSaving();
      try {
        const results = await Promise.all(
          deletedNodes.map((node) =>
            fetch(`/api/roadmap/${node.id}`, { method: "DELETE" }).catch((err) => {
              console.error("[RoadmapEditor] Failed to delete node", err);
              return null;
            })
          )
        );
        const ok = results.every((res) => res !== null && res.ok);
        if (ok) {
          setItemsById((prev) => {
            const next = { ...prev };
            deletedNodes.forEach((n) => delete next[n.id]);
            return next;
          });
          if (deletedNodes.some((n) => n.id === selectedId)) setSelectedId(null);
        }
        finishSaving(ok);
      } catch (err) {
        console.error("[RoadmapEditor] Failed to delete nodes", err);
        finishSaving(false);
      }
    },
    [beginSaving, finishSaving, selectedId]
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
      beginSaving();
      try {
        const res = await fetch(`/api/roadmap/${id}`, { method: "DELETE" });
        if (!res.ok) {
          finishSaving(false);
          return;
        }
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        setItemsById((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setSelectedId(null);
        finishSaving(true);
      } catch (err) {
        console.error("[RoadmapEditor] Failed to delete node from side panel", err);
        finishSaving(false);
      }
    },
    [beginSaving, finishSaving, setNodes, setEdges]
  );

  // ── Add node ──────────────────────────────────────────────────────────────

  const [isAdding, setIsAdding] = useState(false);

  async function handleAddNode(nodeType: "learning" | "project" | "group" = "learning") {
    setIsAdding(true);
    beginSaving();
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
      finishSaving(false);
      return;
    }

    const newItem: RoadmapItemWithSlug = {
      ...(await res.json()),
      linked_page_slug: null,
    };

    setItemsById((prev) => ({ ...prev, [newItem.id]: newItem }));
    setNodes((prev) => [...prev, ...(toAdminFlowNodes([newItem], newItem.id) as Node[])]);
    setSelectedId(newItem.id);
    finishSaving(true);
  }

  // ── Manual alignment (via toolbar buttons) ─────────────────────────────────

  function alignSelectedVertically() {
    setNodes((prev) => {
      const selected = prev.filter((n) => n.selected);
      if (selected.length < 2) return prev;

      // Align to the first selected node's x for predictable behavior
      const targetX = selected[0]?.position.x ?? 0;

      const updated = prev.map((n) =>
        n.selected ? { ...n, position: { ...n.position, x: targetX } } : n
      ) as Node[];

      // Persist new positions for aligned nodes
      updated.forEach((n) => {
        if (!n.selected) return;
        fetch(`/api/roadmap/${n.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position_x: n.position.x,
            position_y: n.position.y,
          }),
        }).catch((err) => console.error("[RoadmapEditor] Failed to save aligned position", err));
      });

      return updated;
    });
  }

  function alignSelectedHorizontally() {
    setNodes((prev) => {
      const selected = prev.filter((n) => n.selected);
      if (selected.length < 2) return prev;

      // Prefer aligning by visual center (y + height / 2) using DOM measurements,
      // since React Flow node.height is not populated in our state (confirmed by logs).
      const domHeights: Record<string, number | null> = {};
      selected.forEach((n) => {
        const el = document.querySelector(`[data-id="${n.id}"]`) as HTMLElement | null;
        domHeights[n.id] = el ? el.getBoundingClientRect().height : null;
      });

      const referenceWithHeight = selected.find((n) => domHeights[n.id] != null) ?? selected[0];
      const referenceHeight = domHeights[referenceWithHeight.id] ?? 0;
      const targetCenterY = referenceWithHeight.position.y + referenceHeight / 2;

      const updated = prev.map((n) => {
        if (!n.selected) return n;

        const height = domHeights[n.id] ?? null;

        // If we truly don't have a height for this node or for the reference node,
        // fall back to aligning by top position.
        const useTopAlignment = domHeights[referenceWithHeight.id] == null || height == null;

        if (useTopAlignment || height == null) {
          return { ...n, position: { ...n.position, y: referenceWithHeight.position.y } };
        }

        const currentCenterY = n.position.y + height / 2;
        const deltaY = targetCenterY - currentCenterY;

        return {
          ...n,
          position: { ...n.position, y: n.position.y + deltaY },
        };
      }) as Node[];

      // Persist new positions for aligned nodes
      updated.forEach((n) => {
        if (!n.selected) return;
        fetch(`/api/roadmap/${n.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position_x: n.position.x,
            position_y: n.position.y,
          }),
        }).catch((err) => console.error("[RoadmapEditor] Failed to save aligned position", err));
      });

      return updated;
    });
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        onNodesDelete={handleNodesDelete}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={["Delete", "Backspace"]}
        proOptions={ROADMAP_PRO_OPTIONS}
        style={{ background: "var(--bg)" }}
      >
        <Background
          variant={ROADMAP_BACKGROUND_VARIANT}
          gap={ROADMAP_BACKGROUND_GAP}
          size={ROADMAP_BACKGROUND_SIZE}
          color={ROADMAP_BACKGROUND_COLOR}
        />
        <Controls
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
          }}
          fitViewOptions={{ padding: 0.2 }}
          showInteractive
          onInteractiveChange={setIsInteractive}
        />
        <Panel position="top-right">
          <ViewportZoomDisplay />
        </Panel>

        {saveStatus !== "idle" && (
          <Panel position="top-center">
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "4px 10px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color:
                  saveStatus === "saved"
                    ? "var(--accent)"
                    : saveStatus === "error"
                      ? "var(--red, #ff4444)"
                      : "var(--text-muted)",
                boxShadow: "0 10px 30px rgba(15,23,42,0.55)",
              }}
            >
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "saved"
                  ? "Saved"
                  : "Save failed"}
            </div>
          </Panel>
        )}

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
            <button
              type="button"
              onClick={alignSelectedVertically}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "8px 10px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              Align X
            </button>
            <button
              type="button"
              onClick={alignSelectedHorizontally}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "8px 10px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              Align Y
            </button>
          </div>
        </Panel>
      </ReactFlow>

      <AdminRoadmapSidePanel
        item={selectedItem}
        onClose={() => setSelectedId(null)}
        onUpdate={handleItemUpdate}
        onDelete={handleDeleteNode}
        onBeginSaving={beginSaving}
        onFinishSaving={finishSaving}
      />
    </div>
  );
}
