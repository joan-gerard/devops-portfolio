import type { CSSProperties, ReactNode } from "react";

/**
 * Shared styles for empty-state blocks across public pages (Notes, Projects, About).
 */
export const emptyStateWrapperStyle: CSSProperties = {
  padding: "64px 0",
  textAlign: "center",
};

export const emptyStateTextStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
};

export type EmptyStateProps = {
  /** Short message (single paragraph). Omit when using children for richer content. */
  message?: string;
  /** Custom content (e.g. multiple paragraphs, instructions). Renders instead of or after message. */
  children?: ReactNode;
  /** Optional style merged with the wrapper (e.g. different padding, border-radius). */
  style?: CSSProperties;
  /** Optional class name for the wrapper. */
  className?: string;
};

/**
 * Shared empty-state block: centered message and/or custom children.
 * Use for Notes (message only), Projects (message only), and About (children with instructions).
 */
export function EmptyState({ message, children, style, className }: EmptyStateProps) {
  const wrapperStyle: CSSProperties = style
    ? { ...emptyStateWrapperStyle, ...style }
    : emptyStateWrapperStyle;

  return (
    <div style={wrapperStyle} className={className}>
      {message != null && <p style={emptyStateTextStyle}>{message}</p>}
      {children}
    </div>
  );
}
