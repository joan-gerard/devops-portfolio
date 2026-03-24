import type { RoadmapItemStatus, RoadmapItemType } from "@/types/roadmap";
import type { CSSProperties } from "react";

export const ROADMAP_STATUS: RoadmapItemStatus[] = ["not_started", "in_progress", "completed"];

export const ROADMAP_STATUS_LABEL: Record<RoadmapItemStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export const ROADMAP_STATUS_COLORS: Record<RoadmapItemStatus, string> = {
  not_started: "var(--text-muted)",
  in_progress: "var(--accent)",
  completed: "var(--text-dim)",
};

export const ROADMAP_STATUS_ICON: Record<RoadmapItemStatus, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "✓",
};

export const ROADMAP_STATUS_NODE_STYLES: Record<
  RoadmapItemStatus,
  {
    border: string;
    labelColor: string;
    iconColor: string;
    dot: string;
    pillBg: string;
    pulse: boolean;
  }
> = {
  not_started: {
    border: "var(--border)",
    labelColor: "var(--text-muted)",
    iconColor: "var(--text)",
    dot: "var(--text-muted)",
    pillBg: "rgba(148, 163, 184, 0.12)",
    pulse: false,
  },
  in_progress: {
    border: "var(--accent)",
    labelColor: "var(--text)",
    iconColor: "var(--accent)",
    dot: "var(--accent)",
    pillBg: "var(--accent-dim)",
    pulse: true,
  },
  completed: {
    border: "var(--text-dim)",
    labelColor: "var(--text-dim)",
    iconColor: "var(--text)",
    dot: "var(--text-dim)",
    pillBg: "var(--accent-2-dim)",
    pulse: false,
  },
};

export const ROADMAP_TYPE_CONFIG: Record<
  RoadmapItemType,
  {
    label: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  learning: {
    label: "Learning",
    badgeBg: "var(--accent-dim)",
    badgeColor: "var(--accent)",
  },
  project: {
    label: "Project",
    badgeBg: "var(--accent-2-dim)",
    badgeColor: "var(--text-dim)",
  },
  group: {
    label: "Group",
    badgeBg: "var(--surface-2)",
    badgeColor: "var(--text-muted)",
  },
};

export const ROADMAP_STATUS_OPTIONS: { value: RoadmapItemStatus; label: string; color: string }[] =
  ROADMAP_STATUS.map((value) => ({
    value,
    label: ROADMAP_STATUS_LABEL[value],
    color: ROADMAP_STATUS_COLORS[value],
  }));

export const ROADMAP_TYPE_OPTIONS: { value: RoadmapItemType; label: string }[] = (
  ["learning", "project", "group"] as RoadmapItemType[]
).map((value) => ({
  value,
  label: ROADMAP_TYPE_CONFIG[value].label,
}));

// ── Layout and typography tokens for roadmap ───────────────────────────────────

export const ROADMAP_PAGE_CONTAINER_STYLE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "48px 24px 24px",
};

export const ROADMAP_PAGE_HEADING_STYLE: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: 28,
  fontWeight: 800,
  color: "var(--text)",
  marginBottom: 8,
};

export const ROADMAP_PAGE_SUBHEADING_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  color: "var(--text-muted)",
  marginBottom: 16,
};

export const ROADMAP_NODE_CONTAINER_STYLE: CSSProperties = {
  borderRadius: 10,
  padding: "10px 14px",
  width: 220,
  position: "relative",
  transition: "border-color 0.2s, box-shadow 0.2s, transform 0.1s",
};

export const ROADMAP_NODE_TYPE_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
};

export const ROADMAP_NODE_TYPE_BADGE_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 999,
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  whiteSpace: "nowrap",
};

export const ROADMAP_NODE_TITLE_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.5,
};

export const ROADMAP_PANEL_HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: "20px 20px 16px",
  borderBottom: "1px solid var(--border)",
  gap: 12,
};

export const ROADMAP_PANEL_HEADER_TITLE_CONTAINER_STYLE: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

export const ROADMAP_PANEL_TITLE_STYLE: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: 16,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
  lineHeight: 1.3,
};

export const ROADMAP_PANEL_BODY_STYLE: CSSProperties = {
  padding: 20,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

export const ROADMAP_PANEL_DESCRIPTION_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-dim)",
  lineHeight: 1.7,
  margin: 0,
};

export const ROADMAP_PANEL_DESCRIPTION_EMPTY_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-muted)",
  fontStyle: "italic",
  margin: 0,
};
