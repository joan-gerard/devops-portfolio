type ProjectDescriptionSectionProps = {
  description?: string | null;
};

export function ProjectDescriptionSection({ description }: ProjectDescriptionSectionProps) {
  if (!description) return null;

  return (
    <div style={{ marginBottom: "32px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
          color: "var(--text-dim)",
          lineHeight: 1.75,
        }}
      >
        {description}
      </p>
    </div>
  );
}
