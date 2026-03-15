"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapItemStatus, RoadmapItemType } from "@/types/roadmap";
import { useEffect, useRef, useState } from "react";

const STATUS_OPTIONS: { value: RoadmapItemStatus; label: string; color: string }[] = [
  { value: "not_started", label: "Not started", color: "var(--text-muted)" },
  { value: "in_progress", label: "In progress", color: "var(--accent-2)" },
  { value: "completed", label: "Completed", color: "var(--accent)" },
];

const TYPE_OPTIONS: { value: RoadmapItemType; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "project", label: "Project" },
];

interface Props {
  item: RoadmapItemWithSlug | null;
  onClose: () => void;
  onUpdate: (updated: RoadmapItemWithSlug) => void;
  onDelete: (id: string) => Promise<void>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AdminRoadmapSidePanel({ item, onClose, onUpdate, onDelete }: Props) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local field states — kept in sync with item prop
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [linkedPageId, setLinkedPageId] = useState(item?.linked_page_id ?? "");

  // Sync fields when the selected item changes
  useEffect(() => {
    setTitle(item?.title ?? "");
    setDescription(item?.description ?? "");
    setLinkedPageId(item?.linked_page_id ?? "");
    setConfirmDelete(false);
    setSaveStatus("idle");
  }, [item?.id]);

  // Close on Escape
  useEffect(() => {
    if (!item) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function patch(fields: Record<string, unknown>) {
    if (!item) return;
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
      setSaveStatus("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleDeleteConfirmed() {
    if (!item) return;
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
  }

  const isVisible = item !== null;

  return (
    <>
      {isVisible && <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 9 }} />}

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 300,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.2s ease",
          overflowY: "auto",
        }}
      >
        {item && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 16px 12px",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
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
                    {saveStatus === "saving"
                      ? "Saving…"
                      : saveStatus === "saved"
                        ? "Saved"
                        : "Error"}
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

            {/* Fields */}
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                flex: 1,
              }}
            >
              {/* Title */}
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
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
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
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    padding: "8px 10px",
                    outline: "none",
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
                  {TYPE_OPTIONS.map((opt) => (
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

              {/* Status */}
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
                  {STATUS_OPTIONS.map((opt) => (
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

              {/* Linked page ID */}
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
                    {new Date(item.completed_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Delete */}
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
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--red, #ff4444)";
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
      </div>
    </>
  );
}
