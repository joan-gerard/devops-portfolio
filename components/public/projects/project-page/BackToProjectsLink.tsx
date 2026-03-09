"use client";

import Link from "next/link";

export function BackToProjectsLink() {
  return (
    <Link
      href="/projects"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-muted)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        marginBottom: "48px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      ← All projects
    </Link>
  );
}
