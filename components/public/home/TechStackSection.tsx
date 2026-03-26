import { TECH_STACK } from "@/lib/constants/home";
import { HomeSection } from "./HomeSection";

const techListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const techItemStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "var(--text-dim)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "6px 14px",
};

export function TechStackSection() {
  return (
    <HomeSection
      label="Tools & Tech"
      heading="What I'm working with"
      wrapperStyle={{ marginBottom: 0 }}
    >
      <div style={techListStyle}>
        {TECH_STACK.map((tech) => (
          <span key={tech} style={techItemStyle}>
            {tech}
          </span>
        ))}
      </div>
      <p className="mt-7">ADD A ARCHITECTURE DIAGRAM INSTEAD OF TECH STACK</p>
    </HomeSection>
  );
}
