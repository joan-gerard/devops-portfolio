import type { RoadmapItemStatus, RoadmapItemType } from "@/types/roadmap";

export const ROADMAP_STATUS: RoadmapItemStatus[] = ["not_started", "in_progress", "completed"];

export const ROADMAP_STATUS_LABEL: Record<RoadmapItemStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export const ROADMAP_STATUS_COLORS: Record<RoadmapItemStatus, string> = {
  not_started: "var(--text-muted)",
  in_progress: "var(--accent-2)",
  completed: "var(--accent)",
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
    border: "var(--accent-2)",
    labelColor: "var(--text)",
    iconColor: "var(--accent-2)",
    dot: "var(--accent-2)",
    pillBg: "var(--accent-2-dim)",
    pulse: true,
  },
  completed: {
    border: "var(--accent)",
    labelColor: "var(--accent)",
    iconColor: "var(--accent)",
    dot: "var(--accent)",
    pillBg: "var(--accent-dim)",
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
    badgeBg: "rgba(56, 189, 248, 0.16)",
    badgeColor: "#0ea5e9",
  },
  project: {
    label: "Project",
    badgeBg: "rgba(129, 140, 248, 0.16)",
    badgeColor: "#6366f1",
  },
  group: {
    label: "Group",
    badgeBg: "rgba(148, 163, 184, 0.16)",
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
