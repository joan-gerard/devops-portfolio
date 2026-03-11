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
            textDecoration: "none",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "8px 16px",
            transition: "border-color 0.15s, color 0.15s",
          }}
          className="u-text-muted-text-hover u-border-accent-hover"
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
            textDecoration: "none",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            padding: "8px 16px",
            transition: "background 0.15s, color 0.15s",
          }}
          className="u-text-accent-text-hover"
        >
          Live demo →
        </a>
      )}
    </div>
  );
}
