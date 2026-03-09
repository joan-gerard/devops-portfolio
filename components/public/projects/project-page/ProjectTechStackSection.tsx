import { tag as tagStyle } from "../projectStyles";

type ProjectTechStackSectionProps = {
  techStack: string[];
};

export function ProjectTechStackSection({ techStack }: ProjectTechStackSectionProps) {
  if (techStack.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "12px",
        }}
      >
        Tech stack
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {techStack.map((tech) => (
          <span key={tech} style={tagStyle}>
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
