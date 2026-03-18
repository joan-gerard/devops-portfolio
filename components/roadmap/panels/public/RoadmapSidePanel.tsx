"use client";

import type { RoadmapItemWithSlug } from "@/types/roadmap";
import { RoadmapSidePanelShell } from "@/components/roadmap/panels/RoadmapSidePanelShell";
import {
  ROADMAP_PANEL_BODY_STYLE,
  ROADMAP_PANEL_DESCRIPTION_EMPTY_STYLE,
  ROADMAP_PANEL_DESCRIPTION_STYLE,
  ROADMAP_PANEL_HEADER_STYLE,
  ROADMAP_PANEL_HEADER_TITLE_CONTAINER_STYLE,
  ROADMAP_PANEL_TITLE_STYLE,
  ROADMAP_STATUS_COLORS,
  ROADMAP_STATUS_LABEL,
  ROADMAP_TYPE_CONFIG,
} from "@/components/roadmap/roadmapStyles";
import { formatRoadmapDate } from "@/lib/roadmap-date";
import { useRouter } from "next/navigation";

interface Props {
  item: RoadmapItemWithSlug | null;
  onClose: () => void;
}

export function RoadmapSidePanel({ item, onClose }: Props) {
  const router = useRouter();

  const isVisible = item !== null;
  const isGroup = item?.type === "group";
  const linkedHref =
    !isGroup && item?.linked_page_slug
      ? item.type === "project"
        ? `/projects/${item.linked_page_slug}`
        : `/notes/${item.linked_page_slug}`
      : null;

  return (
    <RoadmapSidePanelShell
      isOpen={isVisible}
      onClose={onClose}
      width={320}
      header={
        item && (
          <div style={ROADMAP_PANEL_HEADER_STYLE}>
            <div style={ROADMAP_PANEL_HEADER_TITLE_CONTAINER_STYLE}>
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
                      background: item
                        ? (ROADMAP_STATUS_COLORS[item.status] ?? "var(--text-muted)")
                        : "var(--text-muted)",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  {item && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: ROADMAP_STATUS_COLORS[item.status] ?? "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {ROADMAP_STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  )}
                  <span style={{ color: "var(--border)", fontSize: 10 }}>·</span>
                  {item && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {ROADMAP_TYPE_CONFIG[item.type].label}
                    </span>
                  )}
                </div>
              )}

              {item && (
                <h2
                  style={{
                    ...ROADMAP_PANEL_TITLE_STYLE,
                  }}
                >
                  {item.title}
                </h2>
              )}
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
        )
      }
    >
      {item && (
        <div style={ROADMAP_PANEL_BODY_STYLE}>
          {/* Description */}
          {item.description ? (
            <p style={ROADMAP_PANEL_DESCRIPTION_STYLE}>{item.description}</p>
          ) : (
            <p style={ROADMAP_PANEL_DESCRIPTION_EMPTY_STYLE}>No description yet.</p>
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
              <span style={{ color: "var(--accent)" }}>{formatRoadmapDate(item.completed_at)}</span>
            </div>
          )}

          {/* Link to note / project — group nodes have no link or helper text */}
          {isGroup ? null : linkedHref ? (
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
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0, 229, 160, 0.06)";
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
      )}
    </RoadmapSidePanelShell>
  );
}
