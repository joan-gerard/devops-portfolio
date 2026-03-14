"use client";

import { ExternalLink } from "@/components/public/ExternalLink";

type ProjectLinksSectionProps = {
  githubUrl: string | null;
  liveUrl: string | null;
};

export function ProjectLinksSection({ githubUrl, liveUrl }: ProjectLinksSectionProps) {
  if (!githubUrl && !liveUrl) return null;

  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", paddingTop: "8px" }}>
      {githubUrl && (
        <ExternalLink href={githubUrl} variant="pill" tone="muted">
          GitHub →
        </ExternalLink>
      )}
      {liveUrl && (
        <ExternalLink href={liveUrl} variant="pill" tone="accent">
          Live demo →
        </ExternalLink>
      )}
    </div>
  );
}
