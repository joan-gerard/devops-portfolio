import type { CSSProperties, ReactNode } from "react";
import {
  emptyMessageStyle,
  emptyStateWrapperStyle as wrapperStyleFromTokens,
} from "./publicPageStyles";

/** Re-export for backward compatibility; same as emptyMessageStyle. */
export const emptyStateTextStyle: CSSProperties = emptyMessageStyle;

/** Re-export so consumers can reference the token. */
export const emptyStateWrapperStyle: CSSProperties = wrapperStyleFromTokens;

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
 * Text and wrapper styles come from publicPageStyles.ts.
 */
export function EmptyState({ message, children, style, className }: EmptyStateProps) {
  const wrapperStyle: CSSProperties = style
    ? { ...wrapperStyleFromTokens, ...style }
    : wrapperStyleFromTokens;

  return (
    <div style={wrapperStyle} className={className}>
      {message != null && <p style={emptyMessageStyle}>{message}</p>}
      {children}
    </div>
  );
}
