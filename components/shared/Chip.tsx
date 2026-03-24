import type { CSSProperties } from "react";

const chipStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  borderRadius: "99px",
  padding: "4px 10px",
  textTransform: "lowercase",
};

function getTagChipStyle(tag: string): CSSProperties | undefined {
  const normalizedTag = tag.trim().toLowerCase();
  if (normalizedTag === "learning" || normalizedTag === "project") {
    return { backgroundColor: "var(--accent)", color: "var(--bg)" };
  }
  return undefined;
}

type ChipProps = {
  tag: string;
  style?: CSSProperties;
};

export function Chip({ tag, style }: ChipProps) {
  const tagStyle = getTagChipStyle(tag);
  return <span style={{ ...chipStyle, ...tagStyle, ...style }}>{tag}</span>;
}
