"use client";

import { SignOutButton } from "@/components/auth";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/notes": "Notes",
  "/admin/projects": "Projects",
  "/admin/roadmap/edit": "Roadmap",
};

export function AdminHeader() {
  const pathname = usePathname();

  const title =
    Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname.startsWith(path + "/")
    )?.[1] ?? "Admin";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: "var(--sidebar-width)",
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
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "15px",
          fontWeight: "700",
          color: "var(--text)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>

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
