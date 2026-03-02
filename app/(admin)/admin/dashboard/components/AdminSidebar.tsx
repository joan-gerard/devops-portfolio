"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect
          x="8.5"
          y="1"
          width="5.5"
          height="5.5"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="1"
          y="8.5"
          width="5.5"
          height="5.5"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="8.5"
          y="8.5"
          width="5.5"
          height="5.5"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    label: "Notes",
    href: "/admin/notes",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M4 5h7M4 7.5h7M4 10h4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path
          d="M1 3.5A1.5 1.5 0 012.5 2h3.379a1.5 1.5 0 011.06.44l.622.621A1.5 1.5 0 008.62 3.5H12.5A1.5 1.5 0 0114 5v6.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 11.5v-8z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    label: "Roadmap",
    href: "/admin/roadmap/edit",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="3" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M4.5 4h4A2.5 2.5 0 0111 6.5v2A2.5 2.5 0 0013.5 11"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "var(--sidebar-width)",
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "14px",
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}
        >
          Dev<span style={{ color: "var(--accent)" }}>Ops</span>
        </span>
        <span
          style={{
            marginLeft: "8px",
            fontSize: "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            padding: "2px 6px",
            borderRadius: "2px",
          }}
        >
          admin
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            padding: "0 8px",
            marginBottom: "6px",
          }}
        >
          Menu
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "2px",
                fontSize: "12px",
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-dim)",
                background: isActive ? "var(--accent-dim)" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-dim)";
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.5, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          fontSize: "10px",
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "2px" }}>Learning Portal</div>
        <div style={{ color: "var(--accent)", opacity: 0.6 }}>v0.1.0</div>
      </div>
    </aside>
  );
}
