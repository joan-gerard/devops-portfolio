"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  not_started: "var(--text-muted)",
  in_progress: "var(--accent-2)",
  completed: "var(--accent)",
};

interface Props {
  item: RoadmapItemWithSlug | null;
  onClose: () => void;
}

export function RoadmapSidePanel({ item, onClose }: Props) {
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    if (!item) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  const isVisible = item !== null;
  const isGroup = item?.type === "group";
  const linkedHref =
    !isGroup && item?.linked_page_slug
      ? item.type === "project"
        ? `/projects/${item.linked_page_slug}`
        : `/notes/${item.linked_page_slug}`
      : null;

  return (
    <>
      {/* Backdrop — clicking outside closes the panel */}
      {isVisible && (
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
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
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "20px 20px 16px",
                borderBottom: "1px solid var(--border)",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Status + type row — hidden for group nodes on public view */}
                {!isGroup && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: STATUS_COLOR[item.status] ?? "var(--text-muted)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: STATUS_COLOR[item.status] ?? "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                    <span style={{ color: "var(--border)", fontSize: 10 }}>·</span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h2>
              </div>

              {/* Close button */}
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
                  flexShrink: 0,
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--text-muted)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                }}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: "20px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Description */}
              {item.description ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-dim)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  No description yet.
                </p>
              )}

              {/* Completed date — only for learning/project */}
              {!isGroup && item.completed_at && (
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

              {/* Link to note / project — group nodes have no link */}
              {isGroup ? (
                <div
                  style={{
                    marginTop: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  Group node — use to organise the roadmap.
                </div>
              ) : linkedHref ? (
                <button
                  onClick={() => router.push(linkedHref)}
                  style={{
                    marginTop: "auto",
                    background: "none",
                    border: "1px solid var(--accent)",
                    borderRadius: 6,
                    color: "var(--accent)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    padding: "10px 16px",
                    textAlign: "left",
                    width: "100%",
                    transition: "background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(0, 229, 160, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "none";
                  }}
                >
                  <span>View {item.type === "project" ? "project" : "note"} →</span>
                </button>
              ) : (
                <div
                  style={{
                    marginTop: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {item.status === "completed"
                    ? "No linked note for this item yet."
                    : "Note will be linked once this topic is completed."}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
