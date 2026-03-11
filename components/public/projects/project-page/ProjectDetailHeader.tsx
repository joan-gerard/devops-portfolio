type ProjectDetailHeaderProps = {
  title: string;
  updatedAt: string;
};

export function ProjectDetailHeader({ title, updatedAt }: ProjectDetailHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: "12px",
        }}
      >
        Project
      </p>
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "32px",
          fontWeight: "800",
          color: "var(--text)",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-muted)",
        }}
      >
        Last updated {updatedAt}
      </p>
    </div>
  );
}
