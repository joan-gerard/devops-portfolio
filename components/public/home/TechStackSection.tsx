import { sectionLabel, sectionHeading } from "./sectionStyles";
import { TECH_STACK } from "@/lib/constants/home";

export function TechStackSection() {
  return (
    <section>
      <p style={sectionLabel}>Tools & Tech</p>
      <h2 style={sectionHeading}>What I&apos;m working with</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {TECH_STACK.map((tech) => (
          <span
            key={tech}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "6px 14px",
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
