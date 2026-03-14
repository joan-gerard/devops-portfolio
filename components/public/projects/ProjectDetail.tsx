"use client";

import type { PublicProject } from "@/types/projects";
import { BackLink } from "@/components/shared/BackLink";
import { DetailPageHeader } from "@/components/public/DetailPageHeader";
import { PageContainer } from "@/components/public/PageContainer";
import {
  ProjectDescriptionSection,
  ProjectLinksSection,
  ProjectTechStackSection,
} from "./project-page";

const sectionDividerStyle = {
  border: "none",
  borderTop: "1px solid var(--border)",
  margin: "0 0 32px",
};

const metadataDateStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-muted)",
};

type ProjectDetailProps = {
  project: PublicProject;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const updatedAt = new Date(project.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const metadata = <p style={metadataDateStyle}>Last updated {updatedAt}</p>;

  return (
    <PageContainer>
      <BackLink href="/projects">← All projects</BackLink>
      <DetailPageHeader label="Project" title={project.title} metadata={metadata} />
      <hr style={sectionDividerStyle} />
      <ProjectDescriptionSection description={project.description} />
      <ProjectTechStackSection techStack={project.tech_stack} />
      <ProjectLinksSection githubUrl={project.github_url} liveUrl={project.live_url} />
    </PageContainer>
  );
}
