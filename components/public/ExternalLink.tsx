"use client";

import { linkBaseStyle, linkPillStyle } from "@/components/public/publicPageStyles";
import type { CSSProperties } from "react";

export type ExternalLinkVariant = "plain" | "pill";
export type ExternalLinkTone = "muted" | "accent";

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: ExternalLinkVariant;
  tone?: ExternalLinkTone;
  "aria-label"?: string;
};

const TONE_HOVER_CLASS: Record<ExternalLinkTone, string> = {
  muted: "u-text-muted-text-hover",
  accent: "u-text-accent-text-hover",
};

/** Extra class for pill + muted so border highlights on hover. */
const PILL_MUTED_CLASS = "u-border-accent-hover";

const PILL_TONE_BORDER: Record<ExternalLinkTone, string> = {
  muted: "var(--border)",
  accent: "var(--accent)",
};

/**
 * Shared external link for project/card actions. Use "plain" for card rows,
 * "pill" for project detail page links. Tone controls hover (muted → text, accent → text).
 */
export function ExternalLink({
  href,
  children,
  variant = "plain",
  tone = "muted",
  "aria-label": ariaLabel,
}: ExternalLinkProps) {
  const baseStyle: CSSProperties =
    variant === "pill" ? { ...linkPillStyle, borderColor: PILL_TONE_BORDER[tone] } : linkBaseStyle;
  const className =
    variant === "pill" && tone === "muted"
      ? `${TONE_HOVER_CLASS[tone]} ${PILL_MUTED_CLASS}`
      : TONE_HOVER_CLASS[tone];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={baseStyle}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
