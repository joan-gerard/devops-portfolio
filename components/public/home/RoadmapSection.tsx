import { ROADMAP_PHASES } from "@/lib/constants/home";
import { HomeSection } from "./HomeSection";

const roadmapListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const phaseRowStyle = (done: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 16px",
  background: done ? "var(--surface)" : "transparent",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  opacity: done ? 1 : 0.4,
});

const phaseIconStyle = (done: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: done ? "var(--accent)" : "var(--text-muted)",
  minWidth: "16px",
});

const phaseNumStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-muted)",
  minWidth: "24px",
};

const phaseLabelStyle = (done: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: done ? "var(--text)" : "var(--text-dim)",
});

const roadmapFootnoteStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-muted)",
  marginTop: "16px",
  fontStyle: "italic",
};

export function RoadmapSection() {
  return (
    <HomeSection
      label="Roadmap"
      heading="Where I'm at"
      viewAllHref="/roadmap"
      viewAllLabel="Full roadmap →"
    >
      <>
        <div style={roadmapListStyle}>
          {ROADMAP_PHASES.map((phase) => (
            <div key={phase.num} style={phaseRowStyle(phase.done)}>
              <span style={phaseIconStyle(phase.done)}>{phase.done ? "✓" : "·"}</span>
              <span style={phaseNumStyle}>{phase.num}</span>
              <span style={phaseLabelStyle(phase.done)}>{phase.label}</span>
            </div>
          ))}
        </div>
        <p style={roadmapFootnoteStyle}>
          Dynamic roadmap coming in Phase 6 — items will be tracked in the database.
        </p>
      </>
    </HomeSection>
  );
}
