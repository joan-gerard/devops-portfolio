import { BackgroundVariant, type ProOptions } from "@xyflow/react";
import type { CSSProperties } from "react";

export const ROADMAP_BACKGROUND_GAP = 24;
export const ROADMAP_BACKGROUND_SIZE = 1;
export const ROADMAP_BACKGROUND_COLOR = "var(--border)";
export const ROADMAP_BACKGROUND_VARIANT = BackgroundVariant.Dots;

export const ROADMAP_DEFAULT_EDGE_STYLE: CSSProperties = {
  stroke: "var(--border)",
  strokeWidth: 1.5,
};

export const ROADMAP_PRO_OPTIONS: ProOptions = {
  hideAttribution: false,
};

export const ROADMAP_ADMIN_FLOW_PROPS = {
  connectionMode: "loose" as const,
  deleteKeyCode: ["Delete", "Backspace"] as const,
};

export const ROADMAP_PUBLIC_FLOW_PROPS = {
  minZoom: 1,
  maxZoom: 1,
  panOnDrag: false,
  panOnScroll: true,
  zoomOnScroll: false,
  zoomOnDoubleClick: false,
  zoomOnPinch: false,
  zoomActivationKeyCode: null as unknown as string,
};
