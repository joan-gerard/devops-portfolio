import Link from "next/link";
import type { ReactNode } from "react";

export type BackLinkProps = {
  href: string;
  children: ReactNode;
  /** Optional class name (e.g. "back-link--compact" to remove bottom margin in admin bars). */
  className?: string;
};

/**
 * Shared back navigation link with consistent styling across admin and public pages.
 * Uses the .back-link CSS class for appearance and hover; pass className for context-specific overrides (e.g. compact).
 */
export function BackLink({ href, children, className }: BackLinkProps) {
  const combinedClassName = ["back-link", className].filter(Boolean).join(" ");
  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  );
}
