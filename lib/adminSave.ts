/**
 * Shared types and constants for admin save status (editor and project edit).
 * Single source for SaveStatus, debounce delay, and status color/label so
 * useEditorPage and useProjectEdit stay consistent and EditMetaBar receives
 * a uniform API (statusColor).
 */

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "slugSaving" | "slugSaved";

/**
 * Debounce delay (ms) before persisting field changes to the API.
 * Used by useEditorPage and useProjectEdit.
 */
export const DEBOUNCE_MS = 1000;

/**
 * CSS color for each save status. Use for EditMetaBar status display.
 * American spelling to match EditMetaBar's statusColor prop.
 */
export const STATUS_COLOR: Record<SaveStatus, string> = {
  idle: "var(--text-muted)",
  saving: "var(--yellow)",
  saved: "var(--accent)",
  error: "var(--red)",
  slugSaving: "var(--yellow)",
  slugSaved: "var(--accent)",
};

/**
 * Human-readable label for each save status.
 */
export const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
  slugSaving: "Saving slug…",
  slugSaved: "Title slug saved",
};
