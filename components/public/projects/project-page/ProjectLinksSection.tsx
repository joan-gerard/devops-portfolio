"use client";

type ProjectLinksSectionProps = {
  githubUrl: string | null;
  liveUrl: string | null;
};

export function ProjectLinksSection({ githubUrl, liveUrl }: ProjectLinksSectionProps) {
  if (!githubUrl && !liveUrl) return null;

  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", paddingTop: "8px" }}>
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-muted)",
            textDecoration: "none",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "8px 16px",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.borderColor = "var(--text-dim)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          GitHub →
        </a>
      )}
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--accent)",
            textDecoration: "none",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            padding: "8px 16px",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "var(--bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--accent)";
          }}
        >
          Live demo →
        </a>
      )}
    </div>
  );
}
