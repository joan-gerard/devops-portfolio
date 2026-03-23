"use client";

import type { RoadmapItemWithSlug } from "@/types/roadmap";
import { RoadmapSidePanelShell } from "@/components/roadmap/panels/RoadmapSidePanelShell";
import {
  ROADMAP_PANEL_BODY_STYLE,
  ROADMAP_PANEL_DESCRIPTION_STYLE,
  ROADMAP_PANEL_HEADER_STYLE,
  ROADMAP_PANEL_TITLE_STYLE,
  ROADMAP_STATUS_OPTIONS,
  ROADMAP_TYPE_OPTIONS,
} from "@/components/roadmap/roadmapStyles";
import { formatRoadmapDate } from "@/lib/roadmap-date";
import type { RoadmapSaveStatus } from "@/hooks/useRoadmapSaveStatus";
import { useEffect, useState } from "react";

interface Props {
  item: RoadmapItemWithSlug | null;
  onClose: () => void;
  onUpdate: (updated: RoadmapItemWithSlug) => void;
  onDelete: (id: string) => Promise<void>;
  onBeginSaving: () => void;
  onFinishSaving: (ok: boolean) => void;
}

export function AdminRoadmapSidePanel({
  item,
  onClose,
  onUpdate,
  onDelete,
  onBeginSaving,
  onFinishSaving,
}: Props) {
  type CopyStatus = "idle" | "copied" | "error";
  const [saveStatus, setSaveStatus] = useState<RoadmapSaveStatus>("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  // Local field states — kept in sync with item prop
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [linkedPageId, setLinkedPageId] = useState(item?.linked_page_id ?? "");
  const [isGroupCompleted, setIsGroupCompleted] = useState<boolean>(
    item?.is_group_completed ?? false
  );

  // Sync fields when the selected item changes
  useEffect(() => {
    setTitle(item?.title ?? "");
    setDescription(item?.description ?? "");
    setLinkedPageId(item?.linked_page_id ?? "");
    setIsGroupCompleted(item?.is_group_completed ?? false);
    setConfirmDelete(false);
    setSaveStatus("idle");
    setCopyStatus("idle");
  }, [item?.id, item?.title, item?.description, item?.linked_page_id, item?.is_group_completed]);

  async function handleCopyRoadmapItemId(id: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setCopyStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(id);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 1500);
    }
  }

  async function patch(fields: Record<string, unknown>): Promise<boolean> {
    if (!item) return false;
    onBeginSaving();
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/roadmap/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      const updated: RoadmapItemWithSlug = await res.json();
      onUpdate(updated);
      onFinishSaving(true);
      setSaveStatus("saved");
      return true;
    } catch {
      onFinishSaving(false);
      setSaveStatus("error");
      return false;
    }
  }

  async function handleDeleteConfirmed() {
    if (!item) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  }

  const isVisible = item !== null;

  return (
    <RoadmapSidePanelShell
      isOpen={isVisible}
      onClose={onClose}
      width={300}
      header={
        item && (
          <div
            style={{
              ...ROADMAP_PANEL_HEADER_STYLE,
              padding: "16px 16px 12px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                ...ROADMAP_PANEL_TITLE_STYLE,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 400,
              }}
            >
              Edit node
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Save status indicator */}
              {saveStatus !== "idle" && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color:
                      saveStatus === "saved"
                        ? "var(--accent)"
                        : saveStatus === "error"
                          ? "var(--red)"
                          : "var(--text-muted)",
                  }}
                >
                  {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Error"}
                </span>
              )}
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "2px 7px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>
          </div>
        )
      }
    >
      {item && (
        <>
          <div
            style={{
              ...ROADMAP_PANEL_BODY_STYLE,
              padding: 16,
              gap: 16,
            }}
          >
            {/* Title */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span
                style={{
                  ...ROADMAP_PANEL_TITLE_STYLE,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 400,
                }}
              >
                Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== item.title) patch({ title: title.trim() });
                }}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  padding: "8px 10px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </label>

            {/* Description */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span
                style={{
                  ...ROADMAP_PANEL_TITLE_STYLE,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 400,
                }}
              >
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== (item.description ?? ""))
                    patch({ description: description || null });
                }}
                rows={3}
                style={{
                  ...ROADMAP_PANEL_DESCRIPTION_STYLE,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--text)",
                  resize: "vertical",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </label>

            {/* Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Type
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {ROADMAP_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (opt.value !== item.type) patch({ type: opt.value });
                    }}
                    style={{
                      flex: 1,
                      background: item.type === opt.value ? "var(--surface-2)" : "none",
                      border: `1px solid ${item.type === opt.value ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 4,
                      color: item.type === opt.value ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      padding: "7px 0",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status — only for learning/project; group nodes are organisational only */}
            {item.type !== "group" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Status
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {ROADMAP_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (opt.value !== item.status) patch({ status: opt.value });
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: item.status === opt.value ? "var(--surface-2)" : "none",
                        border: `1px solid ${item.status === opt.value ? opt.color : "var(--border)"}`,
                        borderRadius: 4,
                        color: item.status === opt.value ? opt.color : "var(--text-muted)",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        padding: "8px 12px",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: item.status === opt.value ? opt.color : "var(--border)",
                          flexShrink: 0,
                        }}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Roadmap item ID — only for learning/project */}
            {item.type !== "group" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Roadmap item ID
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRoadmapItemId(item.id)}
                    aria-label="Copy roadmap item ID"
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      color:
                        copyStatus === "copied"
                          ? "var(--accent)"
                          : copyStatus === "error"
                            ? "var(--red, #ff4444)"
                            : "var(--text-muted)",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      lineHeight: 1.2,
                      padding: "4px 6px",
                      transition: "all 0.15s",
                    }}
                  >
                    {copyStatus === "copied"
                      ? "Copied"
                      : copyStatus === "error"
                        ? "Copy failed"
                        : "Copy ID"}
                  </button>
                </div>
                <input
                  value={item.id}
                  readOnly
                  aria-label="Roadmap item ID"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "8px 10px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    cursor: "text",
                  }}
                />
              </label>
            )}

            {/* Group completion toggle — only for group nodes */}
            {item.type === "group" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Group completion
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const previous = isGroupCompleted;
                    const next = !isGroupCompleted;
                    setIsGroupCompleted(next);
                    const ok = await patch({ is_group_completed: next });
                    if (!ok) setIsGroupCompleted(previous);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    background: isGroupCompleted ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${isGroupCompleted ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 4,
                    color: isGroupCompleted ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "8px 10px",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span>
                    {isGroupCompleted ? "Marked as completed" : "Mark group as completed"}
                  </span>
                  <span>{isGroupCompleted ? "✓" : "○"}</span>
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  This does not change individual item statuses; it only affects how the group box
                  is styled.
                </span>
              </div>
            )}

            {/* Linked page ID — only for learning/project */}
            {item.type !== "group" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Linked page UUID
                  {item.linked_page_slug && (
                    <span style={{ color: "var(--accent)", marginLeft: 6, textTransform: "none" }}>
                      → /notes/{item.linked_page_slug}
                    </span>
                  )}
                </span>
                <input
                  value={linkedPageId}
                  onChange={(e) => setLinkedPageId(e.target.value)}
                  onBlur={() => {
                    const val = linkedPageId.trim() || null;
                    if (val !== item.linked_page_id) patch({ linked_page_id: val });
                  }}
                  placeholder="paste page UUID"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "8px 10px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </label>
            )}

            {/* Completed at */}
            {item.completed_at && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                Completed{" "}
                <span style={{ color: "var(--accent)" }}>
                  {formatRoadmapDate(item.completed_at)}
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 16,
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  padding: "8px 0",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--red, #ff4444)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--red, #ff4444)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                }}
              >
                Delete node
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "1px solid var(--red, #ff4444)",
                    borderRadius: 4,
                    color: "var(--red, #ff4444)",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "8px 0",
                    opacity: isDeleting ? 0.6 : 1,
                  }}
                >
                  {isDeleting ? "Deleting…" : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "8px 0",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </RoadmapSidePanelShell>
  );
}
