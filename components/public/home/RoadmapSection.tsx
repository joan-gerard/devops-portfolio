import Link from "next/link";
import { sectionLabel, sectionHeading, viewAllLink } from "./sectionStyles";
import { ROADMAP_PHASES } from "@/lib/constants/home";

export function RoadmapSection() {
  return (
    <section style={{ marginBottom: "72px" }}>
      <p style={sectionLabel}>Roadmap</p>
      <h2 style={sectionHeading}>Where I&apos;m at</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ROADMAP_PHASES.map((phase) => (
          <div
            key={phase.num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              background: phase.done ? "var(--surface)" : "transparent",
              border: `1px solid ${phase.done ? "var(--border)" : "var(--border)"}`,
              borderRadius: "4px",
              opacity: phase.done ? 1 : 0.4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: phase.done ? "var(--accent)" : "var(--text-muted)",
                minWidth: "16px",
              }}
            >
              {phase.done ? "✓" : "·"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-muted)",
                minWidth: "24px",
              }}
            >
              {phase.num}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: phase.done ? "var(--text)" : "var(--text-dim)",
              }}
            >
              {phase.label}
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "16px",
          fontStyle: "italic",
        }}
      >
        Dynamic roadmap coming in Phase 6 — items will be tracked in the database.
      </p>

      <Link href="/roadmap" style={viewAllLink}>
        Full roadmap →
      </Link>
    </section>
  );
}
