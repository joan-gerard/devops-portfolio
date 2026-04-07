"use client";

import { SignOutButton } from "@/components/auth";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/notes": "Notes",
  "/admin/projects": "Projects",
  "/roadmap/edit": "Roadmap",
};

type AdminHeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  sidebarId: string;
};

export function AdminHeader({ sidebarOpen, onToggleSidebar, sidebarId }: AdminHeaderProps) {
  const pathname = usePathname();

  const title =
    Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname.startsWith(path + "/")
    )?.[1] ?? "Admin";

  return (
    <header
      className="admin-shell__header"
      style={{
        position: "fixed",
        top: 0,
        left: "var(--admin-sidebar-offset)",
        right: 0,
        height: "var(--header-height)",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 9,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-controls={sidebarId}
          aria-label={sidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            padding: 0,
            border: "1px solid var(--border)",
            borderRadius: "4px",
            background: "var(--surface-2)",
            color: "var(--text-dim)",
            cursor: "pointer",
          }}
          className="u-bg-surface-hover admin-header__sidebar-toggle"
        >
          {sidebarOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 12l4-4-4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
              display: "inline-block",
            }}
          />
          Live
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
