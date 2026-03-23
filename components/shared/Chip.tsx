import type { CSSProperties, ReactNode } from "react";

const chipStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  borderRadius: "99px",
  padding: "4px 10px",
  textTransform: "lowercase",
};

type ChipProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function Chip({ children, style }: ChipProps) {
  return <span style={{ ...chipStyle, ...style }}>{children}</span>;
}
