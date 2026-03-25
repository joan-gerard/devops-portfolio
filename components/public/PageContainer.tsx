import type { CSSProperties, ReactNode } from "react";

/**
 * Shared container dimensions for public (and error) pages.
 * Use when you need maxWidth + margin but custom padding (e.g. PublicNav, PublicFooter).
 */
export const pageContainerBaseStyle: CSSProperties = {
  // Keep 1440px content width on large screens, while preserving horizontal gutter on smaller viewports.
  maxWidth: "calc(1440px + 72px)",
  width: "100%",
  boxSizing: "border-box",
  // 24px on small screens, growing up to 36px on larger screens.
  paddingInline: "clamp(24px, 3vw, 36px)",
  margin: "0 auto",
};

/**
 * Full page container style: base + default vertical padding (top 48px, bottom 80px).
 * Use for standard content pages (notes, projects, detail, about).
 */
export const pageContainerStyle: CSSProperties = {
  ...pageContainerBaseStyle,
  paddingBlock: "48px 80px",
};

export type PageContainerProps = {
  children: ReactNode;
  /** Optional style merged with the default container style (e.g. different padding). */
  style?: CSSProperties;
  /** Optional class name. */
  className?: string;
};

/**
 * Wrapper for public page content. Applies shared maxWidth, margin, and default padding
 * so layout stays consistent and can be changed in one place.
 * Use for notes/projects list pages, detail pages, about, homepage (with style override), and error.
 */
export function PageContainer({ children, style, className }: PageContainerProps) {
  const combinedStyle: CSSProperties = style
    ? { ...pageContainerStyle, ...style }
    : pageContainerStyle;

  return (
    <div style={combinedStyle} className={className}>
      {children}
    </div>
  );
}
