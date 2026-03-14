"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageContainerBaseStyle } from "@/components/public/PageContainer";

const NAV_LINKS = [
  { href: "/notes", label: "Notes" },
  { href: "/projects", label: "Projects" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/about", label: "About" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          ...pageContainerBaseStyle,
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text)",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Joan Gerard
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  transition: "color 0.15s, background 0.15s",
                }}
                className={isActive ? undefined : "u-text-muted-text-hover"}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
